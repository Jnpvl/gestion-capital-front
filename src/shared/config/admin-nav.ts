import type { StaffRole } from "@/core/domain/auth/types";

export interface AdminNavItem {
  label: string;
  href: string;
  description?: string;
  icon: "dashboard" | "courses" | "students" | "staff" | "companies" | "subscribers" | "events";
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
      {
        label: "Eventos",
        href: "/admin/eventos",
        description: "Tarjetas de la página /eventos",
        icon: "events",
      },
    ],
  },
  {
    title: "Equipo",
    items: [
      {
        label: "Instructores",
        href: "/admin/staff",
        description: "Capacitadores y administradores",
        icon: "staff",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Alumnos",
    items: [
      {
        label: "Alumnos",
        href: "/admin/alumnos",
        description: "Estudiantes, particulares y trabajadores",
        icon: "students",
      },
      {
        label: "Empresas",
        href: "/admin/empresas",
        description: "Datos de empleadores y expediente STPS",
        icon: "companies",
      },
    ],
  },
  {
    title: "Sitio",
    items: [
      {
        label: "Suscritos",
        href: "/admin/suscritos",
        description: "Newsletter y novedades del sitio",
        icon: "subscribers",
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
      items: section.items.filter(
        (item) => !item.adminOnly || role === "admin" || role === "super_admin",
      ),
    }))
    .filter((section) => section.items.length > 0);
}
