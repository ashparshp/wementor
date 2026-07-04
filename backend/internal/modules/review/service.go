package review

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"

	db "wementor-backend/internal/database/db"
)

// Service contains review business logic.
type Service struct {
	queries db.Querier
	logger  *zap.Logger
}

// NewService creates a review service.
func NewService(queries db.Querier, logger *zap.Logger) *Service {
	return &Service{queries: queries, logger: logger}
}

// Create creates a review for a completed booking and updates the mentor's avg rating.
func (s *Service) Create(ctx context.Context, studentID uuid.UUID, req CreateReviewRequest) (*ReviewResponse, error) {
	// 1. Verify booking exists and belongs to student
	booking, err := s.queries.GetBookingByID(ctx, req.BookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found")
	}

	if booking.StudentID != studentID {
		return nil, fmt.Errorf("you can only review your own bookings")
	}

	if booking.Status != "completed" {
		return nil, fmt.Errorf("only completed sessions can be reviewed")
	}

	// 2. Check if already reviewed
	if _, err := s.queries.GetReviewByBookingID(ctx, req.BookingID); err == nil {
		return nil, fmt.Errorf("this booking has already been reviewed")
	}

	// 3. Create review
	var comment *string
	if req.Comment != "" {
		comment = &req.Comment
	}

	review, err := s.queries.CreateReview(ctx, db.CreateReviewParams{
		BookingID: req.BookingID,
		StudentID: studentID,
		MentorID:  booking.MentorID,
		Rating:    req.Rating,
		Comment:   comment,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create review: %w", err)
	}

	// 4. Update mentor's average rating
	ratingData, err := s.queries.GetMentorAverageRating(ctx, booking.MentorID)
	if err == nil {
		_ = s.queries.UpdateMentorRating(ctx, db.UpdateMentorRatingParams{
			UserID:       booking.MentorID,
			AvgRating:    ratingData.AvgRating,
			TotalReviews: int32(ratingData.TotalReviews),
		})
	}

	return &ReviewResponse{
		ID:        review.ID,
		BookingID: review.BookingID,
		StudentID: review.StudentID,
		MentorID:  review.MentorID,
		Rating:    review.Rating,
		Comment:   review.Comment,
		CreatedAt: review.CreatedAt,
	}, nil
}

// ListMentorReviews returns paginated reviews for a mentor.
func (s *Service) ListMentorReviews(ctx context.Context, mentorID uuid.UUID, limit, offset int32) ([]ReviewResponse, int64, error) {
	reviews, err := s.queries.ListMentorReviews(ctx, db.ListMentorReviewsParams{
		MentorID: mentorID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list reviews: %w", err)
	}

	total, _ := s.queries.CountMentorReviews(ctx, mentorID)

	result := make([]ReviewResponse, len(reviews))
	for i, r := range reviews {
		result[i] = ReviewResponse{
			ID:          r.ID,
			BookingID:   r.BookingID,
			StudentID:   r.StudentID,
			MentorID:    r.MentorID,
			Rating:      r.Rating,
			Comment:     r.Comment,
			StudentName: r.StudentName,
			CreatedAt:   r.CreatedAt,
		}
	}

	return result, total, nil
}
