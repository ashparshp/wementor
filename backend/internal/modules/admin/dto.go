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
