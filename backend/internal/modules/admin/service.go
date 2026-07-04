package admin

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"

	db "wementor-backend/internal/database/db"
)

// Service contains admin dashboard business logic.
type Service struct {
	queries db.Querier
	logger  *zap.Logger
}

// NewService creates an admin service.
func NewService(queries db.Querier, logger *zap.Logger) *Service {
	return &Service{queries: queries, logger: logger}
}

// GetStats returns platform-wide statistics for the admin dashboard.
func (s *Service) GetStats(ctx context.Context) (*DashboardStats, error) {
	totalUsers, _ := s.queries.CountUsers(ctx)
	totalStudents, _ := s.queries.CountUsersByRole(ctx, "student")
	totalMentors, _ := s.queries.CountUsersByRole(ctx, "mentor")
	totalBookings, _ := s.queries.CountAllBookings(ctx)
	completedSessions, _ := s.queries.CountBookingsByStatus(ctx, "completed")
	pendingPlans, _ := s.queries.CountPendingPlans(ctx)
	pendingApps, _ := s.queries.CountMentorApplicationsByStatus(ctx, "pending")
	totalRevenue, _ := s.queries.SumCapturedPayments(ctx)

	return &DashboardStats{
		TotalUsers:        totalUsers,
		TotalStudents:     totalStudents,
		TotalMentors:      totalMentors,
		TotalBookings:     totalBookings,
		CompletedSessions: completedSessions,
		PendingPlans:      pendingPlans,
		PendingApps:       pendingApps,
		TotalRevenuePaise: totalRevenue,
	}, nil
}

// ListUsers returns paginated list of all users.
func (s *Service) ListUsers(ctx context.Context, limit, offset int32) ([]db.User, int64, error) {
	users, err := s.queries.ListUsers(ctx, db.ListUsersParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	total, _ := s.queries.CountUsers(ctx)
	return users, total, nil
}

// ListBookings returns paginated list of all bookings.
func (s *Service) ListBookings(ctx context.Context, limit, offset int32) ([]AdminBookingResponse, int64, error) {
	bookings, err := s.queries.ListAllBookings(ctx, db.ListAllBookingsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list bookings: %w", err)
	}

	var res []AdminBookingResponse
	for _, b := range bookings {
		sessionDate := ""
		if b.SessionDate.Valid {
			sessionDate = b.SessionDate.Time.Format("2006-01-02")
		}

		formatPgTime := func(t pgtype.Time) string {
			if !t.Valid {
				return ""
			}
			seconds := t.Microseconds / 1000000
			hours := seconds / 3600
			minutes := (seconds % 3600) / 60
			return fmt.Sprintf("%02d:%02d", hours, minutes)
		}

		res = append(res, AdminBookingResponse{
			ID:             b.ID.String(),
			StudentID:      b.StudentID.String(),
			StudentName:    b.StudentName,
			MentorID:       b.MentorID.String(),
			MentorName:     b.MentorName,
			PlanID:         b.PlanID.String(),
			PlanTitle:      b.PlanTitle,
			SessionDate:    sessionDate,
			StartTime:      formatPgTime(b.StartTime),
			EndTime:        formatPgTime(b.EndTime),
			GoogleMeetLink: b.GoogleMeetLink,
			Status:         b.Status,
			CreatedAt:      b.CreatedAt.Format(time.RFC3339),
		})
	}
	
	total, _ := s.queries.CountAllBookings(ctx)
	return res, total, nil
}

// ListPayments returns paginated list of all payments.
func (s *Service) ListPayments(ctx context.Context, limit, offset int32) ([]db.ListAllPaymentsRow, int64, error) {
	payments, err := s.queries.ListAllPayments(ctx, db.ListAllPaymentsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list payments: %w", err)
	}

	total, _ := s.queries.CountAllPayments(ctx)
	return payments, total, nil
}

func (s *Service) GenerateCoupon(ctx context.Context, req CreateCouponRequest) (*CouponResponse, error) {
	studentID, err := uuid.Parse(req.StudentID)
	if err != nil {
		return nil, fmt.Errorf("invalid student_id")
	}

	// Verify user exists
	if _, err := s.queries.GetUserByID(ctx, studentID); err != nil {
		return nil, fmt.Errorf("student not found")
	}

	// Generate a unique 8-character code
	code := fmt.Sprintf("WM-%s", uuid.New().String()[:8])

	var expiresAt pgtype.Timestamptz
	if req.ExpiresInDays != nil && *req.ExpiresInDays > 0 {
		expiresAt = pgtype.Timestamptz{
			Time:  time.Now().AddDate(0, 0, *req.ExpiresInDays),
			Valid: true,
		}
	}

	coupon, err := s.queries.CreateCoupon(ctx, db.CreateCouponParams{
		Code:               code,
		StudentID:          studentID,
		DiscountPercentage: req.DiscountPercentage,
		ExpiresAt:          expiresAt,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create coupon: %w", err)
	}

	var expiresStr *string
	if coupon.ExpiresAt.Valid {
		str := coupon.ExpiresAt.Time.Format(time.RFC3339)
		expiresStr = &str
	}

	return &CouponResponse{
		ID:                 coupon.ID.String(),
		Code:               coupon.Code,
		StudentID:          coupon.StudentID.String(),
		DiscountPercentage: coupon.DiscountPercentage,
		ExpiresAt:          expiresStr,
	}, nil
}
