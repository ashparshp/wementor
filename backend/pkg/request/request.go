package request

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// Decode reads JSON from the request body into dst and validates it.
func Decode(r *http.Request, dst interface{}) error {
	if r.Body == nil {
		return fmt.Errorf("request body is empty")
	}

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}

	return validate.Struct(dst)
}

// IsValidationError checks if an error is a validation error.
func IsValidationError(err error) bool {
	_, ok := err.(validator.ValidationErrors)
	return ok
}

// ValidationErrorDetails extracts human-readable field-level details from a validation error.
func ValidationErrorDetails(err error) map[string]string {
	details := make(map[string]string)

	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		return details
	}

	for _, e := range validationErrors {
		field := strings.ToLower(e.Field())
		switch e.Tag() {
		case "required":
			details[field] = fmt.Sprintf("%s is required", e.Field())
		case "email":
			details[field] = "invalid email format"
		case "min":
			details[field] = fmt.Sprintf("%s must be at least %s characters", e.Field(), e.Param())
		case "max":
			details[field] = fmt.Sprintf("%s must be at most %s characters", e.Field(), e.Param())
		case "len":
			details[field] = fmt.Sprintf("%s must be exactly %s characters", e.Field(), e.Param())
		case "oneof":
			details[field] = fmt.Sprintf("%s must be one of: %s", e.Field(), e.Param())
		case "gte":
			details[field] = fmt.Sprintf("%s must be greater than or equal to %s", e.Field(), e.Param())
		case "lte":
			details[field] = fmt.Sprintf("%s must be less than or equal to %s", e.Field(), e.Param())
		default:
			details[field] = fmt.Sprintf("%s is invalid", e.Field())
		}
	}

	return details
}

// PaginationParams holds parsed pagination query parameters.
type PaginationParams struct {
	Page    int
	PerPage int
	Offset  int
}

// ParsePagination extracts page and per_page from URL query parameters.
// Defaults: page=1, per_page=20, max per_page=100.
func ParsePagination(r *http.Request) PaginationParams {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	return PaginationParams{
		Page:    page,
		PerPage: perPage,
		Offset:  (page - 1) * perPage,
	}
}
