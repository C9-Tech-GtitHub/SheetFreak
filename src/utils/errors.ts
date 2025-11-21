// Error handling utilities

export class SheetFreakError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SheetFreakError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }

  static authenticationError(details?: any): SheetFreakError {
    return new SheetFreakError(
      'AUTHENTICATION_ERROR',
      'Failed to authenticate with Google APIs. Check your credentials.',
      details
    );
  }

  static invalidRange(provided: string): SheetFreakError {
    return new SheetFreakError(
      'INVALID_RANGE',
      'Range must be in A1 notation',
      { provided, expected: 'A1, A1:B2, Sheet1!A1:B2' }
    );
  }

  static notFound(resource: string, id: string): SheetFreakError {
    return new SheetFreakError(
      'NOT_FOUND',
      `${resource} not found`,
      { id }
    );
  }

  static permissionDenied(operation: string): SheetFreakError {
    return new SheetFreakError(
      'PERMISSION_DENIED',
      `Permission denied for operation: ${operation}`,
      { operation }
    );
  }

  static quotaExceeded(): SheetFreakError {
    return new SheetFreakError(
      'QUOTA_EXCEEDED',
      'API quota exceeded. Please try again later.'
    );
  }
}

export function handleGoogleAPIError(error: any): never {
  if (error.code === 401 || error.code === 403) {
    throw SheetFreakError.authenticationError(error.message);
  } else if (error.code === 404) {
    throw SheetFreakError.notFound('Resource', 'unknown');
  } else if (error.code === 429) {
    throw SheetFreakError.quotaExceeded();
  } else {
    throw new SheetFreakError(
      'API_ERROR',
      error.message || 'An error occurred while calling Google API',
      error
    );
  }
}
