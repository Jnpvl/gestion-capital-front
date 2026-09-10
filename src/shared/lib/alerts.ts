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

export function showError(message: string, title = "Error") {
  return toast.fire({ icon: "error", title, text: message });
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
) {
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
}): Promise<boolean> {
  const result = await Swal.fire({
    ...modalDefaults,
    title: options.title,
    text: options.text,
    icon: options.icon ?? "warning",
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Sí, confirmar",
    cancelButtonText: options.cancelText ?? "Cancelar",
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
