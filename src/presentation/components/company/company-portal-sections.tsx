"use client";

import { CompanyCoursesTab } from "@/presentation/components/admin/companies/company-courses-tab";
import { CompanyDashboardTab } from "@/presentation/components/admin/companies/company-dashboard-tab";
import { CompanyEmployeesSection } from "@/presentation/components/admin/companies/company-employees-section";
import { CompanyProfileReadOnly } from "@/presentation/components/admin/companies/company-profile-fields";
import { usePortalCompany } from "@/presentation/components/company/company-portal-shell";

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 font-display text-2xl font-bold text-brand-gray">{children}</h1>;
}

export function CompanyPortalDashboard() {
  const company = usePortalCompany();
  return (
    <>
      <Title>NOM-035</Title>
      <CompanyDashboardTab companyId={company.id} readOnly />
    </>
  );
}

export function CompanyPortalGeneral() {
  const company = usePortalCompany();
  return (
    <>
      <Title>Datos generales</Title>
      <div className="rounded-2xl border border-brand-line bg-white p-6">
        <CompanyProfileReadOnly
          values={{
            name: company.name,
            rfc: company.rfc ?? "",
            employerRepresentative: company.employerRepresentative ?? "",
            workersRepresentative: company.workersRepresentative ?? "",
            workersCount: company.workersCount != null ? String(company.workersCount) : "",
          }}
        />
      </div>
    </>
  );
}

export function CompanyPortalEmployees() {
  const company = usePortalCompany();
  return (
    <>
      <Title>Empleados</Title>
      <CompanyEmployeesSection company={company} readOnly />
    </>
  );
}

export function CompanyPortalCourses() {
  const company = usePortalCompany();
  return (
    <>
      <Title>Cursos</Title>
      <CompanyCoursesTab
        companyId={company.id}
        companyRfc={company.rfc}
        employeesCount={company.workersCount ?? 0}
        readOnly
      />
    </>
  );
}
