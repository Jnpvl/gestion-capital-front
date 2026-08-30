import type {
  HttpRequestOptions,
  HttpResponse,
  IHttpClient,
} from "@/core/interfaces/services/http-client.interface";

export class FetchHttpClient implements IHttpClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(
    method: string,
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const data = (await response.json()) as T;

    return { data, status: response.status };
  }

  get<T>(url: string, options?: HttpRequestOptions) {
    return this.request<T>("GET", url, options);
  }

  post<T>(url: string, body: unknown, options?: HttpRequestOptions) {
    return this.request<T>("POST", url, { ...options, body });
  }

  put<T>(url: string, body: unknown, options?: HttpRequestOptions) {
    return this.request<T>("PUT", url, { ...options, body });
  }

  delete<T>(url: string, options?: HttpRequestOptions) {
    return this.request<T>("DELETE", url, options);
  }
}
