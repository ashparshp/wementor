package response

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse is the standard error response format.
type ErrorResponse struct {
	Error   string            `json:"error"`
	Details map[string]string `json:"details,omitempty"`
}

// Pagination metadata for paginated responses.
type Pagination struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	TotalCount int `json:"total_count"`
	TotalPages int `json:"total_pages"`
}

// PaginatedResponse wraps data with pagination metadata.
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

// JSON writes a JSON response with the given status code.
func JSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

// OK sends a 200 response with the given data.
func OK(w http.ResponseWriter, data interface{}) {
	JSON(w, http.StatusOK, data)
}

// Created sends a 201 response with the given data.
func Created(w http.ResponseWriter, data interface{}) {
	JSON(w, http.StatusCreated, data)
}

// NoContent sends a 204 response with no body.
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Error sends an error response with the given status code and message.
func Error(w http.ResponseWriter, status int, message string) {
	JSON(w, status, ErrorResponse{Error: message})
}

// ErrorWithDetails sends an error response with field-level detail messages.
func ErrorWithDetails(w http.ResponseWriter, status int, message string, details map[string]string) {
	JSON(w, status, ErrorResponse{Error: message, Details: details})
}

// Paginated sends a 200 response with data wrapped in pagination metadata.
func Paginated(w http.ResponseWriter, data interface{}, page, perPage, totalCount int) {
	totalPages := totalCount / perPage
	if totalCount%perPage > 0 {
		totalPages++
	}

	JSON(w, http.StatusOK, PaginatedResponse{
		Data: data,
		Pagination: Pagination{
			Page:       page,
			PerPage:    perPage,
			TotalCount: totalCount,
			TotalPages: totalPages,
		},
	})
}

// Message sends a simple JSON message response.
func Message(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, map[string]string{"message": msg})
}
