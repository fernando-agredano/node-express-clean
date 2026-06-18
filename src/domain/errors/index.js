class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} con id "${id}" no encontrado`, 404)
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 422)
    this.details = details
  }
}

class BusinessRuleError extends AppError {
  constructor(message) {
    super(message, 409)
  }
}

module.exports = { AppError, NotFoundError, ValidationError, BusinessRuleError }
