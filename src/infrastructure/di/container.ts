import { FetchHttpClient } from "@/infrastructure/http/fetch-http-client";
import { env } from "@/shared/config/env";

export const httpClient = new FetchHttpClient(env.apiUrl);
