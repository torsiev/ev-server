import { StatusCodes } from 'types/server';

/**
 * Error class for REST API errors
 * @property status - HTTP status code
 * @property details - Additional error details
 */
export class RestError<T> extends Error {
  status: StatusCodes;
  details: T | undefined;

  constructor(status: StatusCodes, message: string, details?: T) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
