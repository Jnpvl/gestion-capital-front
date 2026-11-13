/** Share concurrent GETs only. Each caller owns its response body; nothing is cached after completion. */
export function createDeduplicatedFetch(): typeof fetch {
  const pending = new Map<string, Promise<Response>>();
  return async (input, init) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    if (method !== "GET") pending.clear();
    // Requests with independent cancellation or Request bodies keep native fetch semantics.
    if (method !== "GET" || input instanceof Request || init?.signal || init?.body) {
      return globalThis.fetch(input, init);
    }
    const headers = [...new Headers(init?.headers).entries()].sort(([a], [b]) => a.localeCompare(b));
    const key = JSON.stringify([String(input), { ...init, method, headers }]);
    let request = pending.get(key);
    if (!request) {
      request = globalThis.fetch(input, init);
      pending.set(key, request);
      const clear = () => { if (pending.get(key) === request) pending.delete(key); };
      void request.then(clear, clear);
    }
    return (await request).clone();
  };
}
