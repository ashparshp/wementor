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

type AdminBookingResponse struct {
	ID             string  `json:"id"`
	StudentID      string  `json:"student_id"`
	StudentName    string  `json:"student_name"`
	MentorID       string  `json:"mentor_id"`
	MentorName     string  `json:"mentor_name"`
	PlanID         string  `json:"plan_id"`
	PlanTitle      string  `json:"plan_title"`
	SessionDate    string  `json:"session_date"`
	StartTime      string  `json:"start_time"`
	EndTime        string  `json:"end_time"`
	GoogleMeetLink *string `json:"google_meet_link,omitempty"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
}
