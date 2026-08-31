"use client";

import { useCallback, useEffect, useState } from "react";
import type { StaffListItem } from "@/core/domain/staff/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import {
  createStaff,
  listStaff,
  StaffApiError,
  updateStaffStatus,
} from "@/infrastructure/http/staff-api";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CreateStaffForm } from "@/presentation/components/admin/staff/create-staff-form";
import { StaffTable } from "@/presentation/components/admin/staff/staff-table";
import { useAuth } from "@/presentation/providers/auth-provider";

type FilterValue = "all" | "active" | "inactive";
type RoleFilter = "all" | "admin" | "teacher";
const PAGE_SIZE = 10;

export function StaffPageContent() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const loadStaff = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const active = filter === "all" ? undefined : filter === "active";
      const result = await listStaff(token, {
        search: debouncedSearch || undefined,
        active,
        role: roleFilter === "all" ? undefined : roleFilter,
        page,
        limit: PAGE_SIZE,
      });
      setStaff(result.staff);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof StaffApiError ? err.message : "Error al cargar el staff");
    } finally {
      setIsLoading(false);
    }
  }, [filter, roleFilter, debouncedSearch, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  async function handleToggleStatus(member: StaffListItem) {
    const token = authStorage.getToken();
    if (!token) return;

    try {
      await updateStaffStatus(token, member.id, !member.active);
      await loadStaff();
    } catch (err) {
      setError(err instanceof StaffApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Solo los administradores pueden gestionar el staff.
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Staff"
        description="Da de alta administradores y maestros que pueden acceder al panel."
        action={
          <button
            type="button"
            onClick={() => {
              setShowCreate(true);
              setCreatedCredentials(null);
            }}
            className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
          >
            Nuevo usuario
          </button>
        }
      />

      {createdCredentials && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Usuario creado. Credenciales:</p>
          <p className="mt-2 text-sm text-emerald-900">
            Correo: <strong>{createdCredentials.email}</strong>
          </p>
          <p className="text-sm text-emerald-900">
            Contraseña: <strong>{createdCredentials.password}</strong>
          </p>
        </div>
      )}

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Nuevo usuario del staff</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Crea una cuenta de administrador o maestro y comparte las credenciales.
          </p>
          <div className="mt-6">
            <CreateStaffForm
              onCancel={() => setShowCreate(false)}
              onSubmit={async (input) => {
                const token = authStorage.getToken();
                if (!token) return;
                await createStaff(token, input);
                setCreatedCredentials({ email: input.email, password: input.password });
                setShowCreate(false);
                setPage(1);
                await loadStaff();
              }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-col gap-4 border-b border-brand-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full max-w-sm rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue lg:w-72"
          />
          <div className="flex flex-wrap gap-2">
            {(["all", "admin", "teacher"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRoleFilter(value);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  roleFilter === value
                    ? "bg-brand-blue text-white"
                    : "bg-brand-light text-brand-gray"
                }`}
              >
                {value === "all" ? "Todos los roles" : value === "admin" ? "Admins" : "Maestros"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-brand-line px-4 py-3">
          {(["all", "active", "inactive"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === value ? "bg-brand-gray text-white" : "bg-brand-light text-brand-gray"
              }`}
            >
              {value === "all" ? "Todos" : value === "active" ? "Activos" : "Inactivos"}
            </button>
          ))}
        </div>

        {error && (
          <div className="border-b border-brand-line px-6 py-3 text-sm text-red-600">{error}</div>
        )}

        <StaffTable
          staff={staff}
          currentUserId={user.id}
          isLoading={isLoading}
          onToggleStatus={(member) => void handleToggleStatus(member)}
        />

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
