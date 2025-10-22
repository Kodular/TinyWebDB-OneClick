import { TinyWebDBService } from '../domain/services';
import { StoragePort } from '../domain/ports';
import {
  StoreValueHandler,
  GetValueHandler,
  DeleteEntryHandler,
  HttpRequest,
  HttpResponse,
} from './handlers';

/**
 * Main Application class
 *
 * Orchestrates routing and dependency injection.
 * Cloud-agnostic - can be adapted to any HTTP platform.
 */
export class Application {
  private readonly service: TinyWebDBService;
  private readonly storeHandler: StoreValueHandler;
  private readonly getHandler: GetValueHandler;
  private readonly deleteHandler: DeleteEntryHandler;

  constructor(storage: StoragePort) {
    this.service = new TinyWebDBService(storage);
    this.storeHandler = new StoreValueHandler(this.service);
    this.getHandler = new GetValueHandler(this.service);
    this.deleteHandler = new DeleteEntryHandler(this.service);
  }

  /**
   * Routes an HTTP request to the appropriate handler
   *
   * @param request - Cloud-agnostic HTTP request
   * @returns HTTP response
   */
  async handleRequest(request: HttpRequest): Promise<HttpResponse> {
    const path = this.normalizePath(request.path);

    switch (path) {
      case '':
      case '/':
        return this.welcomeResponse();

      case '/storeavalue':
        return await this.storeHandler.handle(request);

      case '/getvalue':
        return await this.getHandler.handle(request);

      case '/deleteentry':
        return await this.deleteHandler.handle(request);

      default:
        return this.notFoundResponse();
    }
  }

  private normalizePath(path: string): string {
    // Remove trailing slash and convert to lowercase
    return path.toLowerCase().replace(/\/$/, '');
  }

  private welcomeResponse(): HttpResponse {
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'TinyWebDB',
        version: '1.0',
        endpoints: {
          '/storeavalue': 'POST - Store a tag-value pair',
          '/getvalue': 'POST - Get a value by tag',
          '/deleteentry': 'POST - Delete an entry by tag',
        },
        documentation: 'https://ai2.appinventor.mit.edu/reference/other/tinywebdb.html',
      }),
    };
  }

  private notFoundResponse(): HttpResponse {
    return {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
      }),
    };
  }
}
