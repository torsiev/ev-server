import { StatusCodes } from 'types/server';

/**
 * Error class for REST API errors
 * @property status - HTTP status code
 * @property details - Additional error details
 */
export class RestError extends Error {
  status: StatusCodes;
  details: Record<string, unknown> | undefined;

  constructor(
    status: StatusCodes,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
