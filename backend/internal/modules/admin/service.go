package admin

import (
	"context"
	"fmt"

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
func (s *Service) ListBookings(ctx context.Context, limit, offset int32) ([]db.Booking, int64, error) {
	bookings, err := s.queries.ListAllBookings(ctx, db.ListAllBookingsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list bookings: %w", err)
	}

	total, _ := s.queries.CountAllBookings(ctx)
	return bookings, total, nil
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
