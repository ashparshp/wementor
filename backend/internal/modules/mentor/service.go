package mentor

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	db "wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/email"
	"wementor-backend/internal/modules/auth"
)

// Service contains mentor business logic.
type Service struct {
	queries       db.Querier
	emailClient   *email.Client
	logger        *zap.Logger
	adminPanelURL string
}

// NewService creates a mentor service.
func NewService(queries db.Querier, emailClient *email.Client, logger *zap.Logger, adminPanelURL string) *Service {
	return &Service{
		queries:       queries,
		emailClient:   emailClient,
		logger:        logger,
		adminPanelURL: adminPanelURL,
	}
}

// Apply submits a new mentor application (public, no auth required).
func (s *Service) Apply(ctx context.Context, req ApplyRequest) (*ApplicationResponse, error) {
	if _, err := s.queries.GetMentorApplicationByEmail(ctx, req.Email); err == nil {
		return nil, fmt.Errorf("you already have a pending application with this email")
	}

	app, err := s.queries.CreateMentorApplication(ctx, db.CreateMentorApplicationParams{
		Name:  req.Name,
		Email: req.Email,
		Phone: req.Phone,
		About: req.About,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to submit application: %w", err)
	}

	go func() {
		if err := s.emailClient.SendApplicationReceived(req.Email); err != nil {
			s.logger.Error("failed to send application confirmation", zap.Error(err))
		}
	}()

	return toApplicationResponse(app), nil
}

// ListApplications returns paginated mentor applications (admin only).
func (s *Service) ListApplications(ctx context.Context, status string, limit, offset int32) ([]ApplicationResponse, int64, error) {
	var apps []db.MentorApplication
	var total int64
	var err error

	if status != "" {
		apps, err = s.queries.ListMentorApplicationsByStatus(ctx, db.ListMentorApplicationsByStatusParams{
			Status: status,
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return nil, 0, fmt.Errorf("failed to list applications: %w", err)
		}
		total, _ = s.queries.CountMentorApplicationsByStatus(ctx, status)
	} else {
		apps, err = s.queries.ListMentorApplications(ctx, db.ListMentorApplicationsParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return nil, 0, fmt.Errorf("failed to list applications: %w", err)
		}
		total, _ = s.queries.CountMentorApplications(ctx)
	}

	result := make([]ApplicationResponse, len(apps))
	for i, a := range apps {
		result[i] = *toApplicationResponse(a)
	}

	return result, total, nil
}

// GetApplication returns a single application (admin only).
func (s *Service) GetApplication(ctx context.Context, id uuid.UUID) (*ApplicationResponse, error) {
	app, err := s.queries.GetMentorApplicationByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("application not found")
	}

	return toApplicationResponse(app), nil
}

// ApproveApplication creates the mentor account and emails a temporary password.
func (s *Service) ApproveApplication(ctx context.Context, appID, adminID uuid.UUID) error {
	app, err := s.queries.GetMentorApplicationByID(ctx, appID)
	if err != nil {
		return fmt.Errorf("application not found")
	}

	if app.Status != "pending" {
		return fmt.Errorf("application is already %s", app.Status)
	}

	if _, err := s.queries.GetUserByEmail(ctx, app.Email); err == nil {
		return fmt.Errorf("a user with this email already exists")
	}

	tempPassword, err := auth.GenerateRandomPassword()
	if err != nil {
		return fmt.Errorf("failed to generate temporary password: %w", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(tempPassword), 12)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user, err := s.queries.CreateMentorUser(ctx, db.CreateMentorUserParams{
		Email:        app.Email,
		PasswordHash: string(hash),
		Name:         app.Name,
	})
	if err != nil {
		return fmt.Errorf("failed to create mentor account: %w", err)
	}

	if _, err := s.queries.CreateMentorProfile(ctx, db.CreateMentorProfileParams{
		UserID: user.ID,
		Phone:  &app.Phone,
	}); err != nil {
		s.logger.Error("failed to create mentor profile", zap.Error(err))
	}

	err = s.queries.ApproveMentorApplication(ctx, db.ApproveMentorApplicationParams{
		ID: appID,
		ReviewedBy: pgtype.UUID{
			Bytes: adminID,
			Valid: true,
		},
	})
	if err != nil {
		return fmt.Errorf("failed to approve application: %w", err)
	}

	go func() {
		if err := s.emailClient.SendMentorWelcome(app.Email, app.Name, tempPassword, s.adminPanelURL); err != nil {
			s.logger.Error("failed to send mentor welcome email", zap.Error(err))
		}
	}()

	return nil
}

// RejectApplication rejects a mentor application.
func (s *Service) RejectApplication(ctx context.Context, appID, adminID uuid.UUID, reason string) error {
	app, err := s.queries.GetMentorApplicationByID(ctx, appID)
	if err != nil {
		return fmt.Errorf("application not found")
	}

	if app.Status != "pending" {
		return fmt.Errorf("application is already %s", app.Status)
	}

	err = s.queries.RejectMentorApplication(ctx, db.RejectMentorApplicationParams{
		ID: appID,
		ReviewedBy: pgtype.UUID{
			Bytes: adminID,
			Valid: true,
		},
	})
	if err != nil {
		return fmt.Errorf("failed to reject application: %w", err)
	}

	go func() {
		if err := s.emailClient.SendApplicationRejected(app.Email, reason); err != nil {
			s.logger.Error("failed to send rejection email", zap.Error(err))
		}
	}()

	return nil
}

// GetProfile returns the mentor's own profile (authenticated mentor).
func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (*MentorProfileResponse, error) {
	profile, err := s.queries.GetMentorProfileByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("mentor profile not found")
	}

	return &MentorProfileResponse{
		ID:             profile.ID,
		UserID:         profile.UserID,
		Bio:            profile.Bio,
		Achievements:   profile.Achievements,
		Documents:      profile.Documents,
		GoogleMeetLink: profile.GoogleMeetLink,
		Phone:          profile.Phone,
		AvgRating:      profile.AvgRating,
		TotalReviews:   profile.TotalReviews,
		TotalSessions:  profile.TotalSessions,
		CreatedAt:      profile.CreatedAt,
		UpdatedAt:      profile.UpdatedAt,
	}, nil
}

// UpdateProfile updates the mentor's profile.
func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, req UpdateProfileRequest) (*MentorProfileResponse, error) {
	profile, err := s.queries.UpdateMentorProfile(ctx, db.UpdateMentorProfileParams{
		UserID:         userID,
		Bio:            req.Bio,
		Achievements:   req.Achievements,
		Documents:      req.Documents,
		GoogleMeetLink: req.GoogleMeetLink,
		Phone:          req.Phone,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return &MentorProfileResponse{
		ID:             profile.ID,
		UserID:         profile.UserID,
		Bio:            profile.Bio,
		Achievements:   profile.Achievements,
		Documents:      profile.Documents,
		GoogleMeetLink: profile.GoogleMeetLink,
		Phone:          profile.Phone,
		AvgRating:      profile.AvgRating,
		TotalReviews:   profile.TotalReviews,
		TotalSessions:  profile.TotalSessions,
		CreatedAt:      profile.CreatedAt,
		UpdatedAt:      profile.UpdatedAt,
	}, nil
}

// ListPublicProfiles returns paginated mentor public profiles.
func (s *Service) ListPublicProfiles(ctx context.Context, limit, offset int32) ([]MentorPublicResponse, int64, error) {
	profiles, err := s.queries.ListMentorProfiles(ctx, db.ListMentorProfilesParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list mentors: %w", err)
	}

	total, _ := s.queries.CountMentorProfiles(ctx)

	result := make([]MentorPublicResponse, len(profiles))
	for i, p := range profiles {
		result[i] = MentorPublicResponse{
			ID:            p.ID,
			UserID:        p.UserID,
			Name:          p.UserName,
			Email:         p.UserEmail,
			AvatarURL:     p.UserAvatarUrl,
			Bio:           p.Bio,
			Achievements:  p.Achievements,
			AvgRating:     p.AvgRating,
			TotalReviews:  p.TotalReviews,
			TotalSessions: p.TotalSessions,
		}
	}

	return result, total, nil
}

// GetPublicProfile returns a mentor's public profile by user ID.
func (s *Service) GetPublicProfile(ctx context.Context, userID uuid.UUID) (*MentorPublicResponse, error) {
	p, err := s.queries.GetMentorPublicProfile(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("mentor not found")
	}

	return &MentorPublicResponse{
		ID:            p.ID,
		UserID:        p.UserID,
		Name:          p.UserName,
		Email:         p.UserEmail,
		AvatarURL:     p.UserAvatarUrl,
		Bio:           p.Bio,
		Achievements:  p.Achievements,
		AvgRating:     p.AvgRating,
		TotalReviews:  p.TotalReviews,
		TotalSessions: p.TotalSessions,
	}, nil
}

// ListApprovedPlans returns approved sessions for a mentor (public).
func (s *Service) ListApprovedPlans(ctx context.Context, mentorUserID uuid.UUID) ([]MentorPlanPublic, error) {
	plans, err := s.queries.ListApprovedPlansByMentor(ctx, mentorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to list mentor plans: %w", err)
	}

	result := make([]MentorPlanPublic, len(plans))
	for i, p := range plans {
		result[i] = MentorPlanPublic{
			ID:              p.ID,
			Title:           p.Title,
			Description:     p.Description,
			Category:        p.Category,
			PricePaise:      p.PricePaise,
			DurationMinutes: p.DurationMinutes,
		}
	}

	return result, nil
}

func toApplicationResponse(app db.MentorApplication) *ApplicationResponse {
	return &ApplicationResponse{
		ID:        app.ID,
		Name:      app.Name,
		Email:     app.Email,
		Phone:     app.Phone,
		About:     app.About,
		Status:    app.Status,
		CreatedAt: app.CreatedAt,
		UpdatedAt: app.UpdatedAt,
	}
}
