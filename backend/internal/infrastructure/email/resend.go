package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// Client sends transactional emails via the Resend API.
type Client struct {
	apiKey     string
	fromEmail  string
	httpClient *http.Client
}

type sendRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

// NewClient creates a Resend email client.
func NewClient(apiKey, fromEmail string) *Client {
	return &Client{
		apiKey:     apiKey,
		fromEmail:  fromEmail,
		httpClient: &http.Client{},
	}
}

// Send dispatches an email through the Resend API.
func (c *Client) Send(to, subject, html string) error {
	body := sendRequest{
		From:    c.fromEmail,
		To:      []string{to},
		Subject: subject,
		HTML:    html,
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API returned status %d", resp.StatusCode)
	}

	return nil
}

// ──────────────────────────────────────────────
// Template-based email helpers
// ──────────────────────────────────────────────

// SendOTP sends a 6-digit OTP for email verification or password reset.
func (c *Client) SendOTP(to, otp, purpose string) error {
	subject := "Your WeMentor Verification Code"
	if purpose == "password_reset" {
		subject = "Reset Your WeMentor Password"
	}

	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF;margin-bottom:24px">WeMentor</h2>
		<p style="font-size:16px;color:#333">Your verification code is:</p>
		<div style="font-size:36px;letter-spacing:10px;font-weight:700;color:#1a1a2e;background:#f0f0f5;padding:24px;text-align:center;border-radius:12px;margin:24px 0">%s</div>
		<p style="font-size:14px;color:#888">This code expires in 10 minutes. Do not share it with anyone.</p>
	</div>`, otp)

	return c.Send(to, subject, html)
}

// SendMentorInvite sends the approved mentor their invite code and admin panel link.
func (c *Client) SendMentorInvite(to, inviteCode, adminPanelURL string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">Welcome to WeMentor! 🎉</h2>
		<p style="font-size:16px;color:#333">Your mentor application has been approved!</p>
		<p style="font-size:16px;color:#333">Use this invite code to create your mentor account:</p>
		<div style="font-size:36px;letter-spacing:10px;font-weight:700;color:#1a1a2e;background:#f0f0f5;padding:24px;text-align:center;border-radius:12px;margin:24px 0">%s</div>
		<a href="%s/mentor/register" style="display:inline-block;background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Set Up Your Account →</a>
		<p style="font-size:14px;color:#888;margin-top:24px">This invite code expires in 7 days.</p>
	</div>`, inviteCode, adminPanelURL)

	return c.Send(to, "You're Approved as a WeMentor Mentor!", html)
}

// SendBookingConfirmation notifies the student of a confirmed booking.
func (c *Client) SendBookingConfirmation(to, mentorName, planTitle, date, timeSlot, meetLink string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">Booking Confirmed! 🎉</h2>
		<p style="font-size:16px;color:#333">Your mentorship session has been booked.</p>
		<div style="background:#f0f0f5;padding:24px;border-radius:12px;margin:24px 0">
			<p style="margin:8px 0"><strong>Mentor:</strong> %s</p>
			<p style="margin:8px 0"><strong>Plan:</strong> %s</p>
			<p style="margin:8px 0"><strong>Date:</strong> %s</p>
			<p style="margin:8px 0"><strong>Time:</strong> %s</p>
		</div>
		<a href="%s" style="display:inline-block;background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Join Google Meet →</a>
	</div>`, mentorName, planTitle, date, timeSlot, meetLink)

	return c.Send(to, "Your WeMentor Session is Confirmed!", html)
}

// SendMentorBookingNotification notifies the mentor of a new booking.
func (c *Client) SendMentorBookingNotification(to, studentName, planTitle, date, timeSlot string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">New Booking! 📅</h2>
		<p style="font-size:16px;color:#333">A student has booked a session with you.</p>
		<div style="background:#f0f0f5;padding:24px;border-radius:12px;margin:24px 0">
			<p style="margin:8px 0"><strong>Student:</strong> %s</p>
			<p style="margin:8px 0"><strong>Plan:</strong> %s</p>
			<p style="margin:8px 0"><strong>Date:</strong> %s</p>
			<p style="margin:8px 0"><strong>Time:</strong> %s</p>
		</div>
	</div>`, studentName, planTitle, date, timeSlot)

	return c.Send(to, "New WeMentor Session Booking", html)
}

// SendRateSession sends a post-session rating prompt to the student.
func (c *Client) SendRateSession(to, mentorName, planTitle, frontendURL, bookingID string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">How was your session? ⭐</h2>
		<p style="font-size:16px;color:#333">Your session with <strong>%s</strong> for <strong>%s</strong> has been completed.</p>
		<p style="font-size:16px;color:#333">We'd love to hear your feedback!</p>
		<a href="%s/bookings/%s/review" style="display:inline-block;background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Rate Your Session →</a>
	</div>`, mentorName, planTitle, frontendURL, bookingID)

	return c.Send(to, "Rate Your WeMentor Session", html)
}

// SendApplicationReceived confirms receipt of a mentor application.
func (c *Client) SendApplicationReceived(to string) error {
	html := `
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">Application Received! 📝</h2>
		<p style="font-size:16px;color:#333">Thank you for applying to become a WeMentor mentor.</p>
		<p style="font-size:16px;color:#333">Our team will review your application and get back to you shortly.</p>
		<p style="font-size:14px;color:#888">This usually takes 1–3 business days.</p>
	</div>`

	return c.Send(to, "WeMentor Mentor Application Received", html)
}

// SendApplicationRejected notifies the applicant of rejection.
func (c *Client) SendApplicationRejected(to, reason string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">Application Update</h2>
		<p style="font-size:16px;color:#333">Thank you for your interest in becoming a WeMentor mentor.</p>
		<p style="font-size:16px;color:#333">After careful review, we're unable to approve your application at this time.</p>
		<p style="font-size:16px;color:#333"><strong>Reason:</strong> %s</p>
		<p style="font-size:14px;color:#888">You're welcome to reapply in the future.</p>
	</div>`, reason)

	return c.Send(to, "WeMentor Mentor Application Update", html)
}

// SendPlanApproved notifies the mentor their plan is live.
func (c *Client) SendPlanApproved(to, planTitle string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">Plan Approved! 🎉</h2>
		<p style="font-size:16px;color:#333">Your mentorship plan <strong>"%s"</strong> has been approved and is now live.</p>
		<p style="font-size:16px;color:#333">Students can now discover and book sessions with you!</p>
	</div>`, planTitle)

	return c.Send(to, "Your WeMentor Plan is Live!", html)
}

// SendPlanRejected notifies the mentor their plan was not approved.
func (c *Client) SendPlanRejected(to, planTitle, reason string) error {
	html := fmt.Sprintf(`
	<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
		<h2 style="color:#6C63FF">Plan Review Update</h2>
		<p style="font-size:16px;color:#333">Your mentorship plan <strong>"%s"</strong> was not approved.</p>
		<p style="font-size:16px;color:#333"><strong>Reason:</strong> %s</p>
		<p style="font-size:14px;color:#888">Please update your plan and resubmit for review.</p>
	</div>`, planTitle, reason)

	return c.Send(to, "WeMentor Plan Review Update", html)
}
