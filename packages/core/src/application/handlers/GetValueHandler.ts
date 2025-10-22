import { TinyWebDBService } from '../../domain/services';
import { HttpRequest, HttpResponse, ErrorResponse } from './types.js';

/**
 * Handler for POST /getvalue
 *
 * Retrieves a value by its tag.
 * Expects 'tag' in the request body.
 * Returns empty string if tag doesn't exist (per TinyWebDB protocol).
 */
export class GetValueHandler {
  constructor(private readonly service: TinyWebDBService) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const tag = this.extractString(request.body, 'tag');

      const result = await this.service.getValue(tag);

      return this.jsonResponse(200, [result.action, result.tag, result.value]);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  private extractString(body: Record<string, unknown>, key: string): string {
    const value = body[key];
    if (typeof value !== 'string') {
      throw new Error(`Missing or invalid '${key}' parameter`);
    }
    return value;
  }

  private jsonResponse(status: number, data: unknown): HttpResponse {
    return {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }

  private errorResponse(error: unknown): HttpResponse {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const errorBody: ErrorResponse = {
      error: 'Bad Request',
      message,
    };

    return {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorBody),
    };
  }
}
