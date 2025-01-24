export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("An unexpected error occurred.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "please, contact support.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "This service is currently unavailable.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Please, verify the service status.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("This endpoint does not support that method.");
    this.name = "MethodNotAllowedError";
    this.action =
      "Check in the documentation the allowed methods for this endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
