import { SessionExpiredNotice } from "@/presentation/components/ui/session-expired-notice";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/presentation/components/admin/admin-login-form";
import { AdminLoginRedirect } from "@/presentation/components/admin/admin-login-redirect";
import { Logo } from "@/presentation/components/ui/logo";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <AdminLoginRedirect>
      <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-line bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-brand-gray">
            Panel administrativo
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Ingresa con tu cuenta de administrador o maestro.
          </p>
        </div>
        <SessionExpiredNotice visible={reason === "session-expired"} />
          <AdminLoginForm />
      </div>
    </div>
    </AdminLoginRedirect>
  );
}
