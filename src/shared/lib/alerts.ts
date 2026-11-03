import Swal from "sweetalert2";

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (popup) => {
    popup.addEventListener("mouseenter", Swal.stopTimer);
    popup.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const modalDefaults = {
  // Los modales solo se cierran con sus botones (no con clic fuera ni Escape).
  allowOutsideClick: false,
  allowEscapeKey: false,
  confirmButtonColor: "#111827",
  cancelButtonColor: "#6b7280",
  confirmButtonText: "Entendido",
  customClass: {
    confirmButton: "rounded-lg px-4 py-2 text-sm font-semibold",
    cancelButton: "rounded-lg px-4 py-2 text-sm font-medium",
  },
} as const;

export function showSuccess(message: string, title = "¡Listo!") {
  return toast.fire({ icon: "success", title, text: message });
}

export function showError(message: string, title = "No se pudo completar") {
  const text = message.trim() || "Ocurrió un problema. Inténtalo de nuevo.";
  // El back junta varios errores de campo con "; ": se muestran como lista.
  const parts = text.split("; ").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    const list = parts.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
    return Swal.fire({
      ...modalDefaults,
      icon: "error",
      title: "Revisa estos campos",
      html: `<ul class="text-left text-sm text-gray-700 space-y-1 list-disc pl-5">${list}</ul>`,
    });
  }
  return toast.fire({ icon: "error", title, text });
}

/** Lista de errores por campo que devuelve el back ({ field, label, message }). */
export function showFieldErrors(
  fields: { label: string; message: string }[] | undefined,
  fallback: string,
) {
  if (!fields || fields.length === 0) return showError(fallback);
  const list = fields
    .map((f) => `<li><strong>${escapeHtml(f.label)}</strong>: ${escapeHtml(f.message)}</li>`)
    .join("");
  return Swal.fire({
    ...modalDefaults,
    icon: "error",
    title: "Revisa estos campos",
    html: `<ul class="text-left text-sm text-gray-700 space-y-1 list-disc pl-5">${list}</ul>`,
  });
}

export function showUploadError(message: string) {
  return showError(message, "No se pudo subir el archivo");
}

const STUDENT_FIELD_LABELS: Record<string, string> = {
  paternalLastName: "Apellido paterno",
  maternalLastName: "Apellido materno",
  firstNames: "Nombre(s)",
  email: "Correo electrónico",
  password: "Contraseña",
  phone: "Teléfono",
  notes: "Notas internas",
  curp: "CURP",
  gender: "Sexo",
  age: "Edad",
  residenceLocation: "Ciudad / Estado de residencia",
  educationLevel: "Nivel de estudios",
  professionArea: "Profesión / área de formación",
  educationInstitution: "Institución educativa",
  currentlyEmployed: "¿Actualmente trabaja?",
  jobType: "Tipo de puesto",
  currentPosition: "Puesto actual",
  industrySector: "Sector / giro de la empresa",
  yearsExperience: "Años de experiencia",
  timeInCurrentPosition: "Tiempo en el puesto actual",
  stpsOccupationCode: "Puesto (catálogo STPS)",
  companyId: "Empresa",
  alumnoType: "Tipo de alumno",
};

function translateValidationMessage(message: string) {
  if (message.includes("expected string, received null")) {
    return "Este campo no puede ir vacío.";
  }
  if (message.includes("Invalid")) {
    return message;
  }
  return message;
}

export function showValidationError(
  details?: Record<string, string[] | undefined>,
  fallback = "Datos inválidos",
  fields?: { label: string; message: string }[],
) {
  if (fields && fields.length > 0) return showFieldErrors(fields, fallback);
  const entries = Object.entries(details ?? {}).flatMap(([field, messages]) =>
    (messages ?? []).map((message) => ({
      field,
      label: STUDENT_FIELD_LABELS[field] ?? field,
      message: translateValidationMessage(message),
    })),
  );

  if (entries.length === 0) {
    return showError(fallback);
  }

  const list = entries
    .map(
      (entry) =>
        `<li><strong>${escapeHtml(entry.label)}</strong>: ${escapeHtml(entry.message)}</li>`,
    )
    .join("");

  return Swal.fire({
    ...modalDefaults,
    icon: "error",
    title: "Revisa estos campos",
    html: `<ul class="text-left text-sm text-gray-700 space-y-1 list-disc pl-5">${list}</ul>`,
  });
}

export function showWarning(message: string, title = "Atención") {
  return toast.fire({ icon: "warning", title, text: message });
}

export function showInfo(message: string, title = "Información") {
  return toast.fire({ icon: "info", title, text: message });
}

export function showSaved(message = "Cambios guardados correctamente.") {
  return showSuccess(message);
}

export function showCredentialsCreated(params: {
  title: string;
  email: string;
  password: string;
}) {
  return Swal.fire({
    ...modalDefaults,
    icon: "success",
    title: params.title,
    html: `
      <div class="text-left text-sm text-gray-700 space-y-2">
        <p>Correo: <strong>${escapeHtml(params.email)}</strong></p>
        <p>Contraseña: <strong>${escapeHtml(params.password)}</strong></p>
      </div>
    `,
    confirmButtonText: "Entendido",
  });
}

export async function confirmAction(options: {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question";
  confirmButtonColor?: string;
}): Promise<boolean> {
  const result = await Swal.fire({
    ...modalDefaults,
    title: options.title,
    text: options.text,
    icon: options.icon ?? "warning",
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Sí, confirmar",
    cancelButtonText: options.cancelText ?? "Cancelar",
    confirmButtonColor: options.confirmButtonColor ?? modalDefaults.confirmButtonColor,
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Confirmación del envío de accesos. Avisa que se genera contraseña nueva y, si hay
 * inactivos, ofrece activarlos (por defecto se omiten). Solo cierra con botones.
 */
export async function confirmSendAccess(info: {
  total: number;
  inactive: number;
  withoutEmail: number;
}): Promise<{ confirmed: boolean; activateInactive: boolean }> {
  const n = info.total;
  const notes: string[] = [];
  if (info.inactive > 0) {
    notes.push(
      `${info.inactive} ${info.inactive === 1 ? "empleado está inactivo y se omitirá" : "empleados están inactivos y se omitirán"} (a menos que marques la casilla).`,
    );
  }
  if (info.withoutEmail > 0) {
    notes.push(`${info.withoutEmail} sin correo válido no ${info.withoutEmail === 1 ? "recibirá" : "recibirán"} nada.`);
  }
  const result = await Swal.fire({
    ...modalDefaults,
    icon: "warning",
    title: n === 1 ? "¿Enviar accesos a 1 empleado?" : `¿Enviar accesos a ${n} empleados?`,
    html: `<p style="margin:0 0 8px"><strong>Se generará una nueva contraseña y la anterior dejará de funcionar.</strong></p>
      <p style="margin:0">Cada empleado recibirá un correo con su usuario y su nueva contraseña.</p>
      ${notes.map((t) => `<p style="margin:8px 0 0;font-size:0.9em;color:#6b7280">${escapeHtml(t)}</p>`).join("")}`,
    ...(info.inactive > 0
      ? { input: "checkbox" as const, inputValue: 0, inputPlaceholder: "Activar a los inactivos y enviarles también" }
      : {}),
    showCancelButton: true,
    confirmButtonText: "Sí, enviar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });
  return { confirmed: result.isConfirmed, activateInactive: info.inactive > 0 && result.value === 1 };
}

export async function showSendAccessSummary(r: {
  sent: number;
  skipped: number;
  failed: number;
  activated: number;
  results: { name: string; email: string; status: string; reason?: string }[];
}) {
  const issues = r.results.filter((x) => x.status !== "sent");
  const list = issues.length
    ? `<ul style="margin:12px 0 0;padding-left:18px;text-align:left;font-size:0.9em;max-height:200px;overflow:auto">${issues
        .map(
          (x) =>
            `<li><strong>${escapeHtml(x.name)}</strong>${x.email ? ` (${escapeHtml(x.email)})` : ""}: ${escapeHtml(
              x.status === "skipped" ? "omitido" : "fallido",
            )}${x.reason ? ` · ${escapeHtml(x.reason)}` : ""}</li>`,
        )
        .join("")}</ul>`
    : "";
  await Swal.fire({
    ...modalDefaults,
    icon: r.failed > 0 ? "warning" : "success",
    title: "Envío de accesos",
    html: `<p style="margin:0">Enviados: <strong>${r.sent}</strong> · Omitidos: <strong>${r.skipped}</strong> · Fallidos: <strong>${r.failed}</strong></p>
      ${r.activated > 0 ? `<p style="margin:6px 0 0;font-size:0.9em">${r.activated} activado(s).</p>` : ""}${list}`,
  });
}
