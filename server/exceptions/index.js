// HttpException: Base class for HTTP exceptions.
// Use this when you want to create a custom exception with an HTTP status code and message.
class HttpException extends Error {
  constructor(status, message, source = null) {
    super(message); // Call the base class constructor
    this.status = status; // HTTP status code (e.g., 404, 500)
    this.message = message; // Error message
    this.source = source; // Additional details about the error source (optional)
  }
}

// AuthException: For Authentication or Authorization errors.
// Use this when user fail to authenticate or are unauthorized to access certain resources.
class AuthException extends HttpException {
  constructor(message = "Authentication/Authorization error", source = null) {
    super(401, message, source); // 401 - Unauthorized by default
  }
}

// ValidationException: For Input validation errors.
// Use this when the user provides invalid data that doesn't meet validation criteria.
class ValidationException extends HttpException {
  constructor(message = "Validation failed", source = null) {
    super(400, message, source); // 400 - Bad Request
  }
}

// DatabaseException: For Database-related errors.
// Use this when there are database errors such as connection issues, query failures, or transaction errors.
class DatabaseException extends HttpException {
  constructor(message = "Database error", source = null) {
    super(500, message, source); // 500 - Internal Server Error
  }
}

// NotFoundException: For when a requested resource is not found.
// Use this for 404 errors, for example, when a database query returns no results.
class NotFoundException extends HttpException {
  constructor(message = "Resource not found", source = null) {
    super(404, message, source); // 404 - Not Found
  }
}

// ForbiddenException: For when a user is authenticated but lacks permissions.
// Use this for 403 errors when a user attempts to access a resource they don’t have rights to.
class ForbiddenException extends HttpException {
  constructor(message = "Access denied", source = null) {
    super(403, message, source); // 403 - Forbidden
  }
}

// ConflictException: For data conflicts, like duplicate resources.
// Use this for 409 errors when a conflict arises, such as trying to create a record that already exists.
class ConflictException extends HttpException {
  constructor(message = "Conflict occurred", source = null) {
    super(409, message, source); // 409 - Conflict
  }
}

// BadGatewayException: For issues with external services or APIs.
// Use this for 502 errors when your app is acting as a gateway and an upstream service fails.
class BadGatewayException extends HttpException {
  constructor(message = "Bad Gateway", source = null) {
    super(502, message, source); // 502 - Bad Gateway
  }
}

// ServiceUnavailableException: For when the server or an external service is unavailable.
// Use this for 503 errors when a service is temporarily down or overloaded.
class ServiceUnavailableException extends HttpException {
  constructor(message = "Service Unavailable", source = null) {
    super(503, message, source); // 503 - Service Unavailable
  }
}

// Exporting all exceptions
export {
  HttpException,
  AuthException,
  ValidationException,
  DatabaseException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadGatewayException,
  ServiceUnavailableException,
};
