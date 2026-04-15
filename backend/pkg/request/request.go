package request

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/ashparshp/wementor/backend/pkg/response"
	"github.com/go-playground/validator/v10"
)

// validate is a singleton instance of the validator.
// We create it once and reuse it for performance.
var validate = validator.New()

// Decode reads the JSON body, decodes it into dst, and runs validation.
func Decode(w http.ResponseWriter, r *http.Request, dst any) error {
	// 1. Decode JSON
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		response.BadRequest(w, "Invalid JSON format")
		return err
	}

	// 2. Validate Struct
	if err := validate.Struct(dst); err != nil {
		// If it's a validation error, parse it into a pretty map
		if ve, ok := err.(validator.ValidationErrors); ok {
			formatValidationErrors(w, ve)
			return err
		}

		// Otherwise, send a generic bad request
		response.BadRequest(w, err.Error())
		return err
	}

	return nil
}

// formatValidationErrors translates technical validator strings into user-friendly messages
func formatValidationErrors(w http.ResponseWriter, ve validator.ValidationErrors) {
	errors := make(map[string]string)

	for _, f := range ve {
		// Convert struct field name to lowercase for the response key
		field := strings.ToLower(f.Field())

		// Create friendly messages based on the tag triggered
		var msg string
		switch f.Tag() {
		case "required":
			msg = fmt.Sprintf("%s is required", field)
		case "email":
			msg = "invalid email format"
		case "min":
			msg = fmt.Sprintf("%s must be at least %s characters", field, f.Param())
		case "max":
			msg = fmt.Sprintf("%s must be at most %s characters", field, f.Param())
		case "url":
			msg = fmt.Sprintf("%s must be a valid URL", field)
		case "oneof":
			msg = fmt.Sprintf("%s must be one of [%s]", field, f.Param())
		case "numeric":
			msg = fmt.Sprintf("%s must be a numeric value", field)
		case "alphanum":
			msg = fmt.Sprintf("%s must contain only letters and numbers", field)
		default:
			msg = fmt.Sprintf("%s is invalid", field)
		}

		errors[field] = msg
	}

	response.ValidationError(w, errors)
}
