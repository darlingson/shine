import { apiJson, getApiUrl } from "@/lib/api";
import type { SortOrder } from "@/lib/sorting";

export interface StaffMember {
  staffMemberId: number;
  fullName: string;
  knownAs?: string | null;
  nationality: string;
  playerId?: number | null;
  sourceUrl?: string | null;
}

export interface StaffMemberForm {
  fullName: string;
  knownAs?: string;
  nationality: string;
  playerId?: number;
  sourceUrl?: string;
}

/** Canonical role codes (see the API's StaffRoles). Codes travel through the
 * API, search and exports, so they never change — labels are display only. */
export const STAFF_ROLES = [
  "head_coach",
  "manager",
  "assistant_coach",
  "goalkeeper_coach",
  "fitness_coach",
  "caretaker",
  "technical_director",
  "other",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<string, string> = {
  head_coach: "Head coach",
  manager: "Manager",
  assistant_coach: "Assistant coach",
  goalkeeper_coach: "Goalkeeper coach",
  fitness_coach: "Fitness coach",
  caretaker: "Caretaker",
  technical_director: "Technical director",
  other: "Other",
};

export function staffRoleLabel(role: string): string {
  return STAFF_ROLE_LABELS[role] ?? role;
}

/** The coach role priority used to answer "who is the coach of this team":
 * head_coach beats manager beats caretaker; anything else never counts. */
const COACH_ROLE_PRIORITY: Record<string, number> = {
  head_coach: 0,
  manager: 1,
  caretaker: 2,
};

export interface StaffAppointment {
  staffAppointmentId: number;
  staffMemberId: number;
  staffMemberName?: string | null;
  role: string;
  clubId?: number | null;
  clubName?: string | null;
  nationalTeamId?: number | null;
  nationalTeamName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  sourceUrl?: string | null;
}

export interface StaffAppointmentForm {
  staffMemberId: number;
  role: string;
  clubId?: number;
  nationalTeamId?: number;
  startDate?: string;
  endDate?: string;
  sourceUrl?: string;
}

export function listStaffMembers(): Promise<StaffMember[]> {
  return apiJson<StaffMember[]>("/api/staffmembers");
}

export const STAFF_MEMBER_SORTS = [
  "name",
  "nationality",
  "createdAt",
] as const;

export type StaffMemberSort = (typeof STAFF_MEMBER_SORTS)[number];

export interface StaffMemberQuery {
  q?: string;
  nationality?: string;
  /** Appointments at this club or national team, any time. */
  clubId?: number;
  nationalTeamId?: number;
  sort?: StaffMemberSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface StaffMemberPage {
  items: StaffMember[];
  total: number;
  page: number;
  pageSize: number;
}

/** Filtered, sorted, paged staff list for a data browser. */
export function queryStaffMembers(
  query: StaffMemberQuery,
): Promise<StaffMemberPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.nationality) params.set("nationality", query.nationality);
  if (query.clubId !== undefined) params.set("clubId", String(query.clubId));
  if (query.nationalTeamId !== undefined)
    params.set("nationalTeamId", String(query.nationalTeamId));
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<StaffMemberPage>(
    `/api/staffmembers/query?${params.toString()}`,
  );
}

export interface StaffMemberFilterOptions {
  nationalities: string[];
}

export function getStaffMemberFilterOptions(): Promise<StaffMemberFilterOptions> {
  return apiJson<StaffMemberFilterOptions>("/api/staffmembers/filter-options");
}

export function getStaffMember(id: number): Promise<StaffMember> {
  return apiJson<StaffMember>(`/api/staffmembers/${id}`);
}

export function createStaffMember(
  dto: StaffMemberForm,
): Promise<StaffMember> {
  return apiJson<StaffMember>("/api/staffmembers", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateStaffMember(
  id: number,
  dto: StaffMemberForm,
): Promise<StaffMember> {
  return apiJson<StaffMember>(`/api/staffmembers/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteStaffMember(id: number): Promise<void> {
  return apiJson<void>(`/api/staffmembers/${id}`, { method: "DELETE" });
}

/** Download URL for the full staff list (format: csv or json). */
export function staffMembersExportHref(format: "csv" | "json"): string {
  return `${getApiUrl()}/api/staffmembers/export?format=${format}`;
}

/** Every appointment across both team kinds — the whole staffing history. */
export function listStaffAppointments(): Promise<StaffAppointment[]> {
  return apiJson<StaffAppointment[]>("/api/staffappointments");
}

export const STAFF_APPOINTMENT_SORTS = [
  "startDate",
  "role",
  "createdAt",
] as const;

export type StaffAppointmentSort = (typeof STAFF_APPOINTMENT_SORTS)[number];

export interface StaffAppointmentQuery {
  q?: string;
  staffMemberId?: number;
  clubId?: number;
  nationalTeamId?: number;
  role?: string;
  ongoing?: boolean;
  sort?: StaffAppointmentSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface StaffAppointmentPage {
  items: StaffAppointment[];
  total: number;
  page: number;
  pageSize: number;
}

/** Filtered, sorted, paged appointment list for browsers and team pages. */
export function queryStaffAppointments(
  query: StaffAppointmentQuery,
): Promise<StaffAppointmentPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.staffMemberId !== undefined)
    params.set("staffMemberId", String(query.staffMemberId));
  if (query.clubId !== undefined) params.set("clubId", String(query.clubId));
  if (query.nationalTeamId !== undefined)
    params.set("nationalTeamId", String(query.nationalTeamId));
  if (query.role) params.set("role", query.role);
  if (query.ongoing !== undefined)
    params.set("ongoing", String(query.ongoing));
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<StaffAppointmentPage>(
    `/api/staffappointments/query?${params.toString()}`,
  );
}

export function getStaffAppointment(id: number): Promise<StaffAppointment> {
  return apiJson<StaffAppointment>(`/api/staffappointments/${id}`);
}

export function createStaffAppointment(
  dto: StaffAppointmentForm,
): Promise<StaffAppointment> {
  return apiJson<StaffAppointment>("/api/staffappointments", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateStaffAppointment(
  id: number,
  dto: StaffAppointmentForm,
): Promise<StaffAppointment> {
  return apiJson<StaffAppointment>(`/api/staffappointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteStaffAppointment(id: number): Promise<void> {
  return apiJson<void>(`/api/staffappointments/${id}`, { method: "DELETE" });
}

/** Download URL for every appointment at every team (format: csv or json). */
export function staffAppointmentsExportHref(format: "csv" | "json"): string {
  return `${getApiUrl()}/api/staffappointments/export?format=${format}`;
}

/** What a person is called on screen: known-as, else full name. */
export function staffMemberLabel(m: StaffMember): string {
  return m.knownAs || m.fullName;
}

/** The team an appointment sits at — resolved name beside the ids. */
export function appointmentTeamName(a: StaffAppointment): string | undefined {
  return a.clubName ?? a.nationalTeamName ?? undefined;
}

/** An appointment with no end date is still running. */
export function isOngoing(afc: StaffAppointment): boolean {
  return afc.endDate === null || afc.endDate === undefined;
}

/** A human period: "2023 → 2025", "2023 → ongoing" or "dates unknown". */
export function appointmentPeriod(a: StaffAppointment): string {
  if (!a.startDate && !a.endDate) return "—";
  return `${a.startDate ?? "?"} → ${a.endDate ?? "ongoing"}`;
}

/** Who answers to "the coach of this team": the role priority among ongoing
 * appointments, newest start date winning ties. Falls back to undefined so
 * callers can show the team's legacy coach value instead. */
export function derivedCoach(
  appointments: StaffAppointment[] | undefined,
): string | undefined {
  const coachRoles = (appointments ?? [])
    .filter((a) => isOngoing(a) && COACH_ROLE_PRIORITY[a.role] !== undefined)
    .sort(
      (a, b) =>
        COACH_ROLE_PRIORITY[a.role] - COACH_ROLE_PRIORITY[b.role] ||
        (b.startDate ?? "").localeCompare(a.startDate ?? ""),
    );
  return coachRoles[0]?.staffMemberName ?? undefined;
}
