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
import { confirmAction, showCredentialsCreated, showError, showSuccess } from "@/shared/lib/alerts";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { AdminPagination } from "@/presentation/components/admin/admin-pagination";
import { CreateStaffForm } from "@/presentation/components/admin/staff/create-staff-form";
import { StaffTable } from "@/presentation/components/admin/staff/staff-table";
import { useAuth } from "@/presentation/providers/auth-provider";
import { isElevatedStaffRole } from "@/core/domain/auth/types";

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
  const [showCreate, setShowCreate] = useState(false);

  const loadStaff = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setIsLoading(true);

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
      showError(err instanceof StaffApiError ? err.message : "Error al cargar el staff");
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

    const nextActive = !member.active;
    const confirmed = await confirmAction({
      title: nextActive ? "Activar usuario" : "Desactivar usuario",
      text: nextActive
        ? `¿Activar el acceso de ${member.name}?`
        : `¿Desactivar el acceso de ${member.name}?`,
      confirmText: nextActive ? "Sí, activar" : "Sí, desactivar",
      icon: "question",
    });
    if (!confirmed) return;

    try {
      await updateStaffStatus(token, member.id, !member.active);
      await loadStaff();
      showSuccess(member.active ? "Usuario desactivado" : "Usuario activado");
    } catch (err) {
      showError(err instanceof StaffApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  if (!user) return null;

  if (!isElevatedStaffRole(user.role)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Solo los administradores pueden gestionar el staff.
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Instructores"
        description="Administra el perfil de capacitadores, administradores y su acceso al panel."
        action={
          !showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gray"
            >
              Nuevo instructor
            </button>
          ) : undefined
        }
      />

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-gray">Nuevo instructor</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Registra un capacitador o administrador con su perfil STPS.
          </p>
          <div className="mt-6">
            <CreateStaffForm
              onCancel={() => setShowCreate(false)}
              onSubmit={async (input) => {
                const token = authStorage.getToken();
                if (!token) throw new StaffApiError("Debes iniciar sesión", 401);
                return createStaff(token, input);
              }}
              onCreated={async (input) => {
                setShowCreate(false);
                setPage(1);
                await loadStaff();
                await showCredentialsCreated({
                  title: "Usuario creado",
                  email: input.email,
                  password: input.password,
                });
              }}
            />
          </div>
        </div>
      )}

      {!showCreate && (
      <div className="rounded-2xl border border-brand-line bg-white">
        <div className="flex flex-col gap-4 border-b border-brand-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellidos o correo..."
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
                {value === "all" ? "Todos los roles" : value === "admin" ? "Admins" : "Instructores"}
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
      )}
    </>
  );
}
