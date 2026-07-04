package admin

// ───── Responses ─────

type DashboardStats struct {
	TotalUsers        int64 `json:"total_users"`
	TotalStudents     int64 `json:"total_students"`
	TotalMentors      int64 `json:"total_mentors"`
	TotalBookings     int64 `json:"total_bookings"`
	CompletedSessions int64 `json:"completed_sessions"`
	PendingPlans      int64 `json:"pending_plans"`
	PendingApps       int64 `json:"pending_applications"`
	TotalRevenuePaise int64 `json:"total_revenue_paise"`
}

type CreateCouponRequest struct {
	StudentID          string `json:"student_id" validate:"required,uuid"`
	DiscountPercentage int32  `json:"discount_percentage" validate:"required,min=1,max=100"`
	ExpiresInDays      *int   `json:"expires_in_days"`
}

type CouponResponse struct {
	ID                 string  `json:"id"`
	Code               string  `json:"code"`
	StudentID          string  `json:"student_id"`
	DiscountPercentage int32   `json:"discount_percentage"`
	ExpiresAt          *string `json:"expires_at"`
}
