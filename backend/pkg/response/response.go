package response

import (
	"encoding/json"
	"net/http"
)

// Response is the standard API JSON structure.
type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Error   any    `json:"error,omitempty"`
}

// send is a private helper that writes the JSON to the response writer.
func send(w http.ResponseWriter, code int, payload Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

// Success is the base helper for all successful (2xx) responses.
func Success(w http.ResponseWriter, code int, msg string, data any) {
	send(w, code, Response{
		Success: true,
		Message: msg,
		Data:    data,
	})
}

// OK sends a standard 200 OK response.
func OK(w http.ResponseWriter, msg string, data any) {
	Success(w, http.StatusOK, msg, data)
}

// Created sends a 201 Created response for new resources.
func Created(w http.ResponseWriter, msg string, data any) {
	Success(w, http.StatusCreated, msg, data)
}

// Error is the base helper for all failure (4xx/5xx) responses.
func Error(w http.ResponseWriter, code int, err string) {
	send(w, code, Response{
		Success: false,
		Error:   err,
	})
}

// --- Semantic Error Helpers ---

func BadRequest(w http.ResponseWriter, err string)   { Error(w, http.StatusBadRequest, err) }
func Unauthorized(w http.ResponseWriter, err string) { Error(w, http.StatusUnauthorized, err) }
func Forbidden(w http.ResponseWriter, err string)    { Error(w, http.StatusForbidden, err) }
func NotFound(w http.ResponseWriter, err string)     { Error(w, http.StatusNotFound, err) }

// InternalError sends a 500 error with a generic message for security.
func InternalError(w http.ResponseWriter) {
	Error(w, http.StatusInternalServerError, "Internal server error")
}

// ValidationError sends a 422 Unprocessable Entity with field-specific details.
func ValidationError(w http.ResponseWriter, errors any) {
	send(w, http.StatusUnprocessableEntity, Response{
		Success: false,
		Message: "Validation failed",
		Error:   errors,
	})
}
