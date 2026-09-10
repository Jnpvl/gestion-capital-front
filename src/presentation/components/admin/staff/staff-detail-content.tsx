"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { StaffDetail } from "@/core/domain/staff/types";
import { STAFF_GENDER_LABELS } from "@/core/domain/staff/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { getStaff, StaffApiError, updateStaffStatus } from "@/infrastructure/http/staff-api";
import { confirmAction, showError, showSuccess } from "@/shared/lib/alerts";
import { resolveAssetUrl } from "@/shared/lib/resolve-asset-url";
import { StaffAccessSection } from "@/presentation/components/admin/staff/staff-access-section";
import { StaffEditForm } from "@/presentation/components/admin/staff/staff-edit-form";
import { StaffRoleBadge } from "@/presentation/components/admin/staff/staff-role-badge";
import { StudentStatusBadge } from "@/presentation/components/admin/students/student-status-badge";
import { useAuth } from "@/presentation/providers/auth-provider";
import { isElevatedStaffRole } from "@/core/domain/auth/types";

export function StaffDetailContent() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadStaff = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token || !params.id) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getStaff(token, params.id);
      setStaff(result.staff);
    } catch (err) {
      const message =
        err instanceof StaffApiError ? err.message : "Error al cargar el instructor";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  async function handleToggleStatus() {
    if (!staff || !user) return;
    const token = authStorage.getToken();
    if (!token) return;

    const nextActive = !staff.active;
    const confirmed = await confirmAction({
      title: nextActive ? "Activar instructor" : "Desactivar instructor",
      text: nextActive
        ? `¿Activar el acceso de ${staff.name}?`
        : `¿Desactivar el acceso de ${staff.name}?`,
      confirmText: nextActive ? "Sí, activar" : "Sí, desactivar",
      icon: "question",
    });
    if (!confirmed) return;

    try {
      await updateStaffStatus(token, staff.id, nextActive);
      await loadStaff();
      showSuccess(nextActive ? "Instructor activado" : "Instructor desactivado");
    } catch (err) {
      showError(err instanceof StaffApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  if (!user || !isElevatedStaffRole(user.role)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Solo los administradores pueden gestionar instructores.
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-brand-muted">Cargando instructor...</p>;
  }

  if (!staff) {
    return (
      <div className="rounded-xl border border-brand-line bg-brand-light p-6 text-sm text-brand-muted">
        {loadError || "Instructor no encontrado"}
      </div>
    );
  }

  const isSelf = staff.id === user.id;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/staff" className="text-sm font-medium text-brand-blue hover:underline">
          ← Volver a instructores
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {staff.photoUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-line bg-brand-light">
                <Image
                  src={resolveAssetUrl(staff.photoUrl)}
                  alt={staff.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-light text-xs text-brand-muted">
                Sin foto
              </div>
            )}
            {staff.logoUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-line bg-white">
                <Image
                  src={resolveAssetUrl(staff.logoUrl)}
                  alt={`Logo de ${staff.name}`}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-light text-xs font-medium text-brand-muted">
                Logo
              </div>
            )}
            {staff.signatureUrl ? (
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-brand-line bg-white">
                <Image
                  src={resolveAssetUrl(staff.signatureUrl)}
                  alt={`Firma de ${staff.name}`}
                  fill
                  className="object-contain p-2"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-light text-xs font-medium text-brand-muted">
                Firma
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-gray">{staff.name}</h1>
              <p className="mt-1 text-sm text-brand-muted">{staff.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StaffRoleBadge role={staff.role} />
                <StudentStatusBadge active={staff.active} />
              </div>
            </div>
          </div>
          {!isSelf && (
            <button
              type="button"
              onClick={() => void handleToggleStatus()}
              className="rounded-lg border border-brand-line px-4 py-2 text-sm font-medium text-brand-gray hover:bg-white"
            >
              {staff.active ? "Desactivar acceso" : "Activar acceso"}
            </button>
          )}
        </div>
      </div>

      <StaffAccessSection staffId={staff.id} email={staff.email} />

            <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-line bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-brand-gray">Resumen</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {staff.age && (
              <div>
                <dt className="text-brand-muted">Edad</dt>
                <dd className="font-medium text-brand-gray">{staff.age} años</dd>
              </div>
            )}
            {staff.gender && (
              <div>
                <dt className="text-brand-muted">Sexo</dt>
                <dd className="font-medium text-brand-gray">{STAFF_GENDER_LABELS[staff.gender]}</dd>
              </div>
            )}
            {staff.aceStpsRegistration && (
              <div>
                <dt className="text-brand-muted">Registro ACE STPS</dt>
                <dd className="font-medium text-brand-gray">{staff.aceStpsRegistration}</dd>
              </div>
            )}
            {staff.renapConocer && (
              <div>
                <dt className="text-brand-muted">RENAP / CONOCER</dt>
                <dd className="font-medium text-brand-gray">{staff.renapConocer}</dd>
              </div>
            )}
            {staff.professionalLicense && (
              <div>
                <dt className="text-brand-muted">Cédula profesional</dt>
                <dd className="font-medium text-brand-gray">{staff.professionalLicense}</dd>
              </div>
            )}
            {staff.career && (
              <div>
                <dt className="text-brand-muted">Carrera / profesión</dt>
                <dd className="font-medium text-brand-gray">{staff.career}</dd>
              </div>
            )}
            {staff.professionalArea && (
              <div>
                <dt className="text-brand-muted">Área de desarrollo</dt>
                <dd className="font-medium text-brand-gray">{staff.professionalArea}</dd>
              </div>
            )}
          </dl>
          {staff.professionalBio && (
            <div className="mt-4 border-t border-brand-line pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                Perfil profesional
              </p>
              <p className="mt-2 text-sm text-brand-gray">{staff.professionalBio}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-brand-line bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-brand-gray">Editar perfil</h2>
          <div className="mt-4">
            <StaffEditForm staff={staff} onUpdated={setStaff} />
          </div>
        </div>
      </div>
    </div>
  );
}
