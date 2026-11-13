import assert from "node:assert/strict";
import { test, after } from "node:test";
import { createDeduplicatedFetch } from "../src/infrastructure/http/deduplicated-fetch";

const original = globalThis.fetch;
after(() => { globalThis.fetch = original; });

test("concurrent reads share transport, own their bodies, and are not cached", async () => {
  let calls = 0;
  let release!: (response: Response) => void;
  globalThis.fetch = async () => { calls++; return new Promise<Response>(resolve => { release = resolve; }); };
  const fetch = createDeduplicatedFetch();
  const a = fetch("https://example.test/data");
  const b = fetch("https://example.test/data");
  assert.equal(calls, 1);
  release(Response.json({ value: 1 }));
  assert.deepEqual(await (await a).json(), { value: 1 });
  assert.deepEqual(await (await b).json(), { value: 1 });
  const c = fetch("https://example.test/data");
  assert.equal(calls, 2);
  release(Response.json({ value: 2 }));
  assert.deepEqual(await (await c).json(), { value: 2 });
});

test("credentials, mutations and independently cancellable requests stay separate", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}); };
  const fetch = createDeduplicatedFetch();
  await Promise.all([
    fetch("https://example.test/data", { headers: { Authorization: "Bearer a" } }),
    fetch("https://example.test/data", { headers: { Authorization: "Bearer b" } }),
    fetch("https://example.test/data", { method: "POST" }),
    fetch("https://example.test/data", { method: "POST" }),
    fetch("https://example.test/data", { signal: new AbortController().signal }),
    fetch("https://example.test/data", { signal: new AbortController().signal }),
  ]);
  assert.equal(calls, 6);
});

test("failed reads can be retried", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("offline"); };
  const fetch = createDeduplicatedFetch();
  await assert.rejects(fetch("https://example.test/data"), /offline/);
  await assert.rejects(fetch("https://example.test/data"), /offline/);
  assert.equal(calls, 2);
});

test("a mutation prevents new reads from joining an older read", async () => {
  const releases: ((response: Response) => void)[] = [];
  globalThis.fetch = async () => new Promise<Response>(resolve => { releases.push(resolve); });
  const fetch = createDeduplicatedFetch();
  const old = fetch("https://example.test/data");
  const save = fetch("https://example.test/data", { method: "PATCH" });
  const fresh = fetch("https://example.test/data");
  assert.equal(releases.length, 3);
  releases.forEach(release => release(Response.json({})));
  await Promise.all([old, save, fresh]);
});
