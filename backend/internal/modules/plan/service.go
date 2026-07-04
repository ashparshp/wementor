package plan

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"

	db "wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/email"
)

// Service contains mentorship plan business logic.
type Service struct {
	queries     db.Querier
	emailClient *email.Client
	logger      *zap.Logger
}

// NewService creates a plan service.
func NewService(queries db.Querier, emailClient *email.Client, logger *zap.Logger) *Service {
	return &Service{queries: queries, emailClient: emailClient, logger: logger}
}

// Create creates a new mentorship plan (status = pending_review).
func (s *Service) Create(ctx context.Context, mentorID uuid.UUID, req CreatePlanRequest) (*PlanResponse, error) {
	desc := req.Description
	plan, err := s.queries.CreateMentorshipPlan(ctx, db.CreateMentorshipPlanParams{
		MentorID:              mentorID,
		Title:                 req.Title,
		Description:           &desc,
		Category:              req.Category,
		PricePaise:            req.PricePaise,
		DurationMinutes:       req.DurationMinutes,
		MinBookingNoticeHours: req.MinBookingNoticeHours,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create plan: %w", err)
	}

	return s.toPlanResponse(plan, nil), nil
}

// GetByID returns a plan with its availability slots.
func (s *Service) GetByID(ctx context.Context, planID uuid.UUID) (*PlanResponse, error) {
	plan, err := s.queries.GetMentorshipPlanByID(ctx, planID)
	if err != nil {
		return nil, fmt.Errorf("plan not found")
	}

	slots, _ := s.queries.GetAvailabilitySlotsByPlanID(ctx, planID)
	return s.toPlanResponse(plan, slots), nil
}

// ListApproved returns paginated approved plans, optionally filtered by category.
func (s *Service) ListApproved(ctx context.Context, category string, limit, offset int32) ([]PlanResponse, int64, error) {
	var plans []db.MentorshipPlan
	var total int64
	var err error

	if category != "" {
		plans, err = s.queries.ListApprovedPlansByCategory(ctx, db.ListApprovedPlansByCategoryParams{
			Category: category,
			Limit:    limit,
			Offset:   offset,
		})
		if err != nil {
			return nil, 0, fmt.Errorf("failed to list plans: %w", err)
		}
		total, _ = s.queries.CountApprovedPlansByCategory(ctx, category)
	} else {
		plans, err = s.queries.ListApprovedPlans(ctx, db.ListApprovedPlansParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return nil, 0, fmt.Errorf("failed to list plans: %w", err)
		}
		total, _ = s.queries.CountApprovedPlans(ctx)
	}

	result := make([]PlanResponse, len(plans))
	for i, p := range plans {
		result[i] = *s.toPlanResponse(p, nil)
	}

	return result, total, nil
}

// ListMentorPlans returns all plans for a specific mentor (all statuses).
func (s *Service) ListMentorPlans(ctx context.Context, mentorID uuid.UUID) ([]PlanResponse, error) {
	plans, err := s.queries.ListMentorPlans(ctx, mentorID)
	if err != nil {
		return nil, fmt.Errorf("failed to list mentor plans: %w", err)
	}

	result := make([]PlanResponse, len(plans))
	for i, p := range plans {
		slots, _ := s.queries.GetAvailabilitySlotsByPlanID(ctx, p.ID)
		result[i] = *s.toPlanResponse(p, slots)
	}

	return result, nil
}

// Update updates a plan and resets its status to pending_review.
func (s *Service) Update(ctx context.Context, planID, mentorID uuid.UUID, req UpdatePlanRequest) (*PlanResponse, error) {
	existing, err := s.queries.GetMentorshipPlanByID(ctx, planID)
	if err != nil {
		return nil, fmt.Errorf("plan not found")
	}

	if existing.MentorID != mentorID {
		return nil, fmt.Errorf("you do not own this plan")
	}

	desc := req.Description
	plan, err := s.queries.UpdateMentorshipPlan(ctx, db.UpdateMentorshipPlanParams{
		ID:                    planID,
		Title:                 req.Title,
		Description:           &desc,
		Category:              req.Category,
		PricePaise:            req.PricePaise,
		DurationMinutes:       req.DurationMinutes,
		MinBookingNoticeHours: req.MinBookingNoticeHours,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update plan: %w", err)
	}

	slots, _ := s.queries.GetAvailabilitySlotsByPlanID(ctx, planID)
	return s.toPlanResponse(plan, slots), nil
}

// Archive archives (soft-deletes) a plan.
func (s *Service) Archive(ctx context.Context, planID, mentorID uuid.UUID) error {
	existing, err := s.queries.GetMentorshipPlanByID(ctx, planID)
	if err != nil {
		return fmt.Errorf("plan not found")
	}

	if existing.MentorID != mentorID {
		return fmt.Errorf("you do not own this plan")
	}

	return s.queries.ArchivePlan(ctx, planID)
}

// SetAvailability replaces all availability slots for a plan.
func (s *Service) SetAvailability(ctx context.Context, planID, mentorID uuid.UUID, req SetAvailabilityRequest) ([]AvailabilitySlot, error) {
	existing, err := s.queries.GetMentorshipPlanByID(ctx, planID)
	if err != nil {
		return nil, fmt.Errorf("plan not found")
	}

	if existing.MentorID != mentorID {
		return nil, fmt.Errorf("you do not own this plan")
	}

	// Delete existing slots and replace
	_ = s.queries.DeleteAvailabilitySlotsByPlanID(ctx, planID)

	result := make([]AvailabilitySlot, 0, len(req.Slots))
	for _, slotReq := range req.Slots {
		params := db.CreateAvailabilitySlotParams{
			PlanID:   planID,
			SlotType: slotReq.SlotType,
		}

		if slotReq.DayOfWeek != nil {
			params.DayOfWeek = slotReq.DayOfWeek
		}

		if slotReq.SpecificDate != "" {
			t, err := time.Parse("2006-01-02", slotReq.SpecificDate)
			if err == nil {
				params.SpecificDate = pgtype.Date{
					Time:  t,
					Valid: true,
				}
			}
		}

		// Parse start_time HH:MM
		if st, err := time.Parse("15:04", slotReq.StartTime); err == nil {
			params.StartTime = pgtype.Time{
				Microseconds: int64(st.Hour()*3600+st.Minute()*60) * 1_000_000,
				Valid:        true,
			}
		}

		// Parse end_time HH:MM
		if et, err := time.Parse("15:04", slotReq.EndTime); err == nil {
			params.EndTime = pgtype.Time{
				Microseconds: int64(et.Hour()*3600+et.Minute()*60) * 1_000_000,
				Valid:        true,
			}
		}

		slot, err := s.queries.CreateAvailabilitySlot(ctx, params)
		if err != nil {
			s.logger.Error("failed to create availability slot", zap.Error(err))
			continue
		}

		var specificDate *string
		if slot.SpecificDate.Valid {
			d := slot.SpecificDate.Time.Format("2006-01-02")
			specificDate = &d
		}

		result = append(result, AvailabilitySlot{
			ID:           slot.ID,
			SlotType:     slot.SlotType,
			DayOfWeek:    slot.DayOfWeek,
			SpecificDate: specificDate,
			StartTime:    slot.StartTime,
			EndTime:      slot.EndTime,
		})
	}

	return result, nil
}

// ListPending returns pending plans for admin review.
func (s *Service) ListPending(ctx context.Context, limit, offset int32) ([]PendingPlanResponse, int64, error) {
	plans, err := s.queries.ListPendingPlans(ctx, db.ListPendingPlansParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list pending plans: %w", err)
	}

	total, _ := s.queries.CountPendingPlans(ctx)

	result := make([]PendingPlanResponse, len(plans))
	for i, p := range plans {
		result[i] = PendingPlanResponse{
			PlanResponse: PlanResponse{
				ID:                    p.ID,
				MentorID:              p.MentorID,
				Title:                 p.Title,
				Description:           p.Description,
				Category:              p.Category,
				PricePaise:            p.PricePaise,
				DurationMinutes:       p.DurationMinutes,
				MinBookingNoticeHours: p.MinBookingNoticeHours,
				Status:                p.Status,
				RejectionReason:       p.RejectionReason,
				CreatedAt:             p.CreatedAt,
				UpdatedAt:             p.UpdatedAt,
			},
			MentorName:  p.MentorName,
			MentorEmail: p.MentorEmail,
		}
	}

	return result, total, nil
}

// Approve approves a pending plan.
func (s *Service) Approve(ctx context.Context, planID, adminID uuid.UUID) error {
	plan, err := s.queries.GetMentorshipPlanByID(ctx, planID)
	if err != nil {
		return fmt.Errorf("plan not found")
	}

	if plan.Status != "pending_review" {
		return fmt.Errorf("plan is not pending review")
	}

	err = s.queries.UpdatePlanStatus(ctx, db.UpdatePlanStatusParams{
		ID:     planID,
		Status: "approved",
		ReviewedBy: pgtype.UUID{
			Bytes: adminID,
			Valid: true,
		},
	})
	if err != nil {
		return fmt.Errorf("failed to approve plan: %w", err)
	}

	// Send approval email
	go func() {
		mentor, err := s.queries.GetUserByID(context.Background(), plan.MentorID)
		if err == nil {
			if err := s.emailClient.SendPlanApproved(mentor.Email, plan.Title); err != nil {
				s.logger.Error("failed to send plan approval email", zap.Error(err))
			}
		}
	}()

	return nil
}

// Reject rejects a pending plan with a reason.
func (s *Service) Reject(ctx context.Context, planID, adminID uuid.UUID, reason string) error {
	plan, err := s.queries.GetMentorshipPlanByID(ctx, planID)
	if err != nil {
		return fmt.Errorf("plan not found")
	}

	if plan.Status != "pending_review" {
		return fmt.Errorf("plan is not pending review")
	}

	err = s.queries.UpdatePlanStatus(ctx, db.UpdatePlanStatusParams{
		ID:              planID,
		Status:          "rejected",
		RejectionReason: &reason,
		ReviewedBy: pgtype.UUID{
			Bytes: adminID,
			Valid: true,
		},
	})
	if err != nil {
		return fmt.Errorf("failed to reject plan: %w", err)
	}

	go func() {
		mentor, err := s.queries.GetUserByID(context.Background(), plan.MentorID)
		if err == nil {
			if err := s.emailClient.SendPlanRejected(mentor.Email, plan.Title, reason); err != nil {
				s.logger.Error("failed to send plan rejection email", zap.Error(err))
			}
		}
	}()

	return nil
}

// ───── Internal helpers ─────

func (s *Service) toPlanResponse(p db.MentorshipPlan, slots []db.AvailabilitySlot) *PlanResponse {
	resp := &PlanResponse{
		ID:                    p.ID,
		MentorID:              p.MentorID,
		Title:                 p.Title,
		Description:           p.Description,
		Category:              p.Category,
		PricePaise:            p.PricePaise,
		DurationMinutes:       p.DurationMinutes,
		MinBookingNoticeHours: p.MinBookingNoticeHours,
		Status:                p.Status,
		RejectionReason:       p.RejectionReason,
		CreatedAt:             p.CreatedAt,
		UpdatedAt:             p.UpdatedAt,
	}

	if slots != nil {
		resp.Availability = make([]AvailabilitySlot, len(slots))
		for i, sl := range slots {
			var specificDate *string
			if sl.SpecificDate.Valid {
				d := sl.SpecificDate.Time.Format("2006-01-02")
				specificDate = &d
			}
			resp.Availability[i] = AvailabilitySlot{
				ID:           sl.ID,
				SlotType:     sl.SlotType,
				DayOfWeek:    sl.DayOfWeek,
				SpecificDate: specificDate,
				StartTime:    sl.StartTime,
				EndTime:      sl.EndTime,
			}
		}
	}

	return resp
}
