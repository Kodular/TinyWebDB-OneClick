import { TinyWebDBService } from '../../domain/services';
import { HttpRequest, HttpResponse, ErrorResponse } from './types.js';

/**
 * Handler for POST /deleteentry
 *
 * Deletes an entry by its tag.
 * Expects 'tag' in the request body.
 */
export class DeleteEntryHandler {
  constructor(private readonly service: TinyWebDBService) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const tag = this.extractString(request.body, 'tag');

      const deleted = await this.service.deleteEntry(tag);

      return this.jsonResponse(200, {
        deleted,
        tag,
      });
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
