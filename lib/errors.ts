export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || String(statusCode);
    this.name = 'ApiError';
  }

  static parse(error: unknown): {
    status: number;
    message: string;
    code: string;
  } {
    if (error instanceof ApiError) {
      return {
        status: error.statusCode,
        message: error.message,
        code: error.code,
      };
    }

    if (error instanceof Error) {
      return {
        status: 500,
        message: error.message,
        code: '500',
      };
    }

    return {
      status: 500,
      message: 'Internal Server Error',
      code: '500',
    };
  }
}

export function createErrorResponse(error: unknown) {
  const { status, message, code } = ApiError.parse(error);
  return Response.json({ error: { code, message } }, { status });
}
