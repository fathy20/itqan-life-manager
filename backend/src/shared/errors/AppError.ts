export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "SERVER_ERROR",
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(msg: string, code = "VALIDATION_ERROR") {
    return new AppError(msg, 400, code);
  }
  static unauthorized(msg = "Unauthorized") {
    return new AppError(msg, 401, "AUTH_ERROR");
  }
  static forbidden(msg: string, code = "FORBIDDEN") {
    return new AppError(msg, 403, code);
  }
  static notFound(msg: string) {
    return new AppError(msg, 404, "NOT_FOUND");
  }
  static planLimit(requiredPlan: string) {
    return new AppError(`This feature requires ${requiredPlan} plan`, 403, "PLAN_LIMIT");
  }
}
