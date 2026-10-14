package org.example.ai_media_workbench.common.error;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    INVALID_PARAMETERS(HttpStatus.UNPROCESSABLE_CONTENT, "Invalid parameter value"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Username or password is incorrect"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "Please sign in"),
    CSRF_INVALID(HttpStatus.FORBIDDEN, "Refresh the security token and retry"),
    CURRENT_PASSWORD_INVALID(HttpStatus.FORBIDDEN, "Current password is incorrect"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    ACCOUNT_ALREADY_EXISTS(HttpStatus.CONFLICT, "Username or email is unavailable"),
    PASSWORD_UNCHANGED(HttpStatus.UNPROCESSABLE_CONTENT, "New password must be different"),
    WEAK_PASSWORD(HttpStatus.UNPROCESSABLE_CONTENT, "Choose a stronger passphrase"),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Too many requests; try again later"),
    REGISTRATION_DISABLED(HttpStatus.SERVICE_UNAVAILABLE, "Registration is unavailable"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() { return status; }
    public String message() { return message; }
}
