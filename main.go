package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

const (
	ZOOM_ACCOUNT_ID    = "-XHcyJIIRhCnN1dbeulp6w"
	ZOOM_CLIENT_ID     = "DZsvSdV1TM29fUfUSceWlw"
	ZOOM_CLIENT_SECRET = "TRL5s2aY6ARWoWiObwl2HzQI0elF58m7"
)

type ZoomTokenResponse struct {
	AccessToken string `json:"access_token"`
}

type BookingRequest struct {
	UserName    string `json:"userName"`
	MentorName  string `json:"mentorName"`
	MentorEmail string `json:"mentorEmail"`
	StartTime   string `json:"startTime"`
	Duration    int    `json:"duration"`
}

type CreateMeetingRequest struct {
	Topic     string `json:"topic"`
	Type      int    `json:"type"`
	StartTime string `json:"start_time"`
	Duration  int    `json:"duration"`
	Timezone  string `json:"timezone"`
}

type ZoomMeetingResponse struct {
	ID        int64  `json:"id"`
	StartURL  string `json:"start_url"`
	JoinURL   string `json:"join_url"`
	Password  string `json:"password"`
	StartTime string `json:"start_time"`
	HostEmail string `json:"host_email"`
}

func GetZoomAccessToken() (string, error) {

	url := fmt.Sprintf(
		"https://zoom.us/oauth/token?grant_type=account_credentials&account_id=%s",
		ZOOM_ACCOUNT_ID,
	)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return "", err
	}

	auth := base64.StdEncoding.EncodeToString(
		[]byte(ZOOM_CLIENT_ID + ":" + ZOOM_CLIENT_SECRET),
	)

	req.Header.Set("Authorization", "Basic "+auth)

	log.Printf("URL: %s\n", url)

	client := &http.Client{}

	res, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)

	var token ZoomTokenResponse

	err = json.Unmarshal(body, &token)
	if err != nil {
		return "", err
	}

	return token.AccessToken, nil
}

func CreateMeeting(
	token string,
	mentorName string,
	mentorEmail string,
	startTime string,
	duration int,
) (*ZoomMeetingResponse, error) {

	body := CreateMeetingRequest{
		Topic:     "Mentorship Session with " + mentorName,
		Type:      2,
		StartTime: startTime,
		Duration:  duration,
		Timezone:  "Asia/Kolkata",
	}

	jsonBody, _ := json.Marshal(body)

	url := fmt.Sprintf(
		"https://api.zoom.us/v2/users/%s/meetings",
		mentorEmail,
	)

	req, err := http.NewRequest(
		"POST",
		url,
		bytes.NewBuffer(jsonBody),
	)

	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	responseBody, _ := io.ReadAll(res.Body)

	var meeting ZoomMeetingResponse

	err = json.Unmarshal(responseBody, &meeting)
	if err != nil {
		return nil, err
	}

	return &meeting, nil
}

func main() {

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Zoom Multi Mentor API Running")
	})

	app.Post("/book-session", func(c *fiber.Ctx) error {

		var req BookingRequest

		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid request",
			})
		}

		token, err := GetZoomAccessToken()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		meeting, err := CreateMeeting(
			token,
			req.MentorName,
			req.MentorEmail,
			req.StartTime,
			req.Duration,
		)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		booking := fiber.Map{
			"userName":    req.UserName,
			"mentorName":  req.MentorName,
			"mentorEmail": req.MentorEmail,

			"meetingId": meeting.ID,
			"hostEmail": meeting.HostEmail,

			"mentorUrl": meeting.StartURL,
			"userUrl":   meeting.JoinURL,

			"password":  meeting.Password,
			"startTime": meeting.StartTime,
			"duration":  req.Duration,
		}

		return c.JSON(booking)
	})

	app.Listen(":3000")
}
