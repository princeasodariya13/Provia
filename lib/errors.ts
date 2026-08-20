export class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
  }
}

export class ValidationError extends APIError {
  errors: unknown;
  
  constructor(message: string, errors?: unknown) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends APIError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
