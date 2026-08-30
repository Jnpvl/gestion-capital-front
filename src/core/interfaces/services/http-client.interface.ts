export interface HttpRequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
}

export interface IHttpClient {
  get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  post<T>(
    url: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>>;
  put<T>(
    url: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>>;
  delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}
