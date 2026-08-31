import type { StaffRole } from "@/core/domain/auth/types";

export interface AdminNavItem {
  label: string;
  href: string;
  description?: string;
  icon: "dashboard" | "courses" | "students" | "staff";
  badge?: string;
  adminOnly?: boolean;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNavigation: AdminNavSection[] = [
  {
    title: "Principal",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "dashboard",
      },
    ],
  },
  {
    title: "Contenido",
    items: [
      {
        label: "Cursos",
        href: "/admin/cursos",
        description: "Cursos con clases y materiales",
        icon: "courses",
      },
    ],
  },
  {
    title: "Equipo",
    items: [
      {
        label: "Staff",
        href: "/admin/staff",
        description: "Administradores y maestros",
        icon: "staff",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Alumnos",
    items: [
      {
        label: "Estudiantes",
        href: "/admin/estudiantes",
        description: "Alta, edición y acceso",
        icon: "students",
      },
    ],
  },
];

export const courseStructurePreview = {
  title: "Estructura de un curso",
  levels: [
    {
      title: "Curso",
      description: "Programa completo (ej. NOM-035, Liderazgo, Cumplimiento STPS).",
    },
    {
      title: "Secciones",
      description: "Agrupa el contenido en módulos o unidades (ej. Introducción, Módulo 1, Evaluación).",
    },
    {
      title: "Clases",
      description: "Lecciones dentro de cada sección, en orden.",
    },
    {
      title: "Contenido",
      description: "Cada clase puede incluir uno o más bloques:",
      items: ["Video (YouTube)", "Texto", "Imagen", "Presentación (PDF)", "Quiz (opción múltiple)", "Archivo PDF"],
    },
  ],
} as const;

export function getAdminNavigation(role: StaffRole) {
  return adminNavigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || role === "admin"),
    }))
    .filter((section) => section.items.length > 0);
}
