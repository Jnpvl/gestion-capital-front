import { authStorage } from "../auth/auth-storage";
import { studentAuthStorage } from "../auth/student-auth-storage";
import { companyAuthStorage } from "../auth/company-auth-storage";
import { env } from "../../shared/config/env";

const sessions = {
  staff: { storage: authStorage, root: "/admin", login: "/admin/login" },
  student: { storage: studentAuthStorage, root: "/mis-cursos", login: "/mis-cursos/login" },
  company: { storage: companyAuthStorage, root: "/empresa", login: "/empresa/login" },
};
export type SessionKind = keyof typeof sessions;

/** Only authenticated responses from our API can invalidate their own session.
 * Comparing the request token prevents a delayed 401 from deleting a newer login.
 * Full navigation also discards cached user data and mounted protected screens.
 */
export function createSessionFetch(kind: SessionKind): typeof fetch {
  return async (input, init) => {
    const response = await globalThis.fetch(input, init);
    if (typeof window === "undefined" || response.status !== 401) return response;
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
    const api = new URL(env.apiUrl, window.location.origin);
    if (url.origin !== api.origin || !url.pathname.startsWith(`${api.pathname.replace(/\/$/, "")}/api/`)) return response;
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    const authorization = headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return response; // Bad login credentials aren't session expiry.
    const token = authorization.slice(7);
    const session = sessions[kind];
    if (!token || session.storage.getToken() !== token) return response;
    session.storage.clearToken();
    const path = window.location.pathname;
    if (path === session.root || path.startsWith(`${session.root}/`)) {
      window.location.replace(`${session.login}?reason=session-expired`);
    }
    return response;
  };
}

export const staffFetch = createSessionFetch("staff");
export const studentFetch = createSessionFetch("student");
export const companyFetch = createSessionFetch("company");
