import type { CompanyDetail } from "./types";

export function formatCompanyAddress(company: CompanyDetail): string {
  const street = [company.addressStreet, company.addressExteriorNumber,
    company.addressInteriorNumber ? `Int. ${company.addressInteriorNumber}` : null].filter(Boolean).join(" ");
  const locality = [company.addressNeighborhood,
    company.addressPostalCode ? `C.P. ${company.addressPostalCode}` : null,
    company.addressCity, company.addressMunicipality, company.addressState, company.addressCountry].filter(Boolean).join(", ");
  const between = [company.addressBetweenStreet1, company.addressBetweenStreet2].filter(Boolean).join(" y ");
  return [street, locality, between ? `Entre calles: ${between}` : null].filter(Boolean).join("\n") || company.address || "";
}
