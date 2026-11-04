import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { createSessionFetch } from "../src/infrastructure/http/session-fetch";
import { env } from "../src/shared/config/env";

const originalFetch = globalThis.fetch;
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const values = new Map<string, string>();
const redirects: string[] = [];
let path = "/admin/alumnos";
const kinds = [
  { kind: "staff", key: "gch_staff_token", root: "/admin", login: "/admin/login" },
  { kind: "student", key: "gch_student_token", root: "/mis-cursos", login: "/mis-cursos/login" },
  { kind: "company", key: "gch_company_token", root: "/empresa", login: "/empresa/login" },
] as const;

beforeEach(() => {
  values.clear(); redirects.length = 0; path = "/admin/alumnos";
  for (const { key } of kinds) values.set(key, "test-token");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: {
    origin: "http://localhost:3000", get pathname() { return path; }, replace: (url: string) => redirects.push(url),
  } } });
});
after(() => {
  globalThis.fetch = originalFetch;
  for (const [name, descriptor] of [["window", originalWindow], ["localStorage", originalStorage]] as const) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});
const url = `${env.apiUrl}/api/test`;
const init = { headers: { Authorization: "Bearer test-token" } };

for (const { kind, key, root, login } of kinds) {
  test(`${kind}: 401 limpia solo su token y redirige a su login`, async () => {
    path = `${root}/detalle`;
    globalThis.fetch = async () => new Response('{"error":{"code":"INVALID_TOKEN"}}', { status: 401 });
    const response = await createSessionFetch(kind)(url, init);
    assert.equal(values.has(key), false);
    for (const other of kinds.filter(k => k.key !== key)) assert.equal(values.get(other.key), "test-token");
    assert.deepEqual(redirects, [`${login}?reason=session-expired`]);
    assert.equal((await response.json()).error.code, "INVALID_TOKEN");
  });
  for (const status of [200, 403, 500]) test(`${kind}: HTTP ${status} conserva sesión`, async () => {
    path = root;
    globalThis.fetch = async () => new Response("body", { status });
    await createSessionFetch(kind)(url, init);
    assert.equal(values.get(key), "test-token");
    assert.deepEqual(redirects, []);
  });
  test(`${kind}: error de red conserva sesión`, async () => {
    globalThis.fetch = async () => { throw new TypeError("Network failure"); };
    await assert.rejects(createSessionFetch(kind)(url, init), /Network failure/);
    assert.equal(values.get(key), "test-token");
    assert.deepEqual(redirects, []);
  });
  test(`${kind}: credenciales incorrectas en login no cierran sesión`, async () => {
    globalThis.fetch = async () => new Response("", { status: 401 });
    await createSessionFetch(kind)(`${env.apiUrl}/api/auth/${kind}/login`, { method: "POST" });
    assert.equal(values.get(key), "test-token");
    assert.deepEqual(redirects, []);
  });
  test(`${kind}: respuesta tardía no borra token nuevo`, async () => {
    globalThis.fetch = async () => { values.set(key, "new-token"); return new Response("", { status: 401 }); };
    await createSessionFetch(kind)(url, init);
    assert.equal(values.get(key), "new-token");
    assert.deepEqual(redirects, []);
  });
}
test("401 concurrentes redirigen una sola vez", async () => {
  globalThis.fetch = async () => new Response("", { status: 401 });
  await Promise.all([createSessionFetch("staff")(url, init), createSessionFetch("staff")(url, init)]);
  assert.equal(redirects.length, 1);
});
test("401 externo no cierra sesión", async () => {
  globalThis.fetch = async () => new Response("", { status: 401 });
  await createSessionFetch("staff")("https://unrelated.invalid/api/test", init);
  assert.equal(values.get("gch_staff_token"), "test-token");
  assert.deepEqual(redirects, []);
});
test("401 de otro portal no cambia la página actual", async () => {
  globalThis.fetch = async () => new Response("", { status: 401 });
  await createSessionFetch("company")(url, init);
  assert.equal(values.has("gch_company_token"), false);
  assert.equal(values.get("gch_staff_token"), "test-token");
  assert.deepEqual(redirects, []);
});
test("Request y descargas mantienen encabezados y cuerpo", async () => {
  globalThis.fetch = async () => new Response("pdf-bytes", { headers: { "Content-Type": "application/pdf" } });
  const response = await createSessionFetch("staff")(new Request(url, init));
  assert.equal(response.headers.get("Content-Type"), "application/pdf");
  assert.equal(await response.text(), "pdf-bytes");
});
