import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Constants ────────────────────────────────────────────────────

const HEADER_COLOR: [number, number, number] = [17, 24, 39];
const LOCALE = "en-PH";

const STATUS_COLORS: Record<string, [number, number, number]> = {
  APPROVED: [22, 101, 52],
  REJECTED: [185, 28, 28],
  PENDING: [146, 64, 14],
};

// ─── Types ────────────────────────────────────────────────────────

interface EventRecord {
  activity_title: string;
  date: string;
  time_start: string;
  time_end: string;
  number_of_days: number;
  requested_by: string;
  status: string;
  venue?: { venue_name: string };
  department?: { department_name: string };
}

interface UserRecord {
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix_name?: string;
  username: string;
  email: string;
  created_at: string;
  role?: { role_name: string };
  department?: { department_name: string };
}

interface ActivityLog {
  created_at: string;
  action: string;
  module: string;
  description: string;
  ip_address?: string;
  user?: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix_name?: string;
    role?: { role_name: string };
  };
}

interface EventFilters {
  dateFrom?: string;
  dateTo?: string;
  venue?: string;
  department?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────

function addHeader(doc: jsPDF, title: string): void {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 105, 16, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleString(LOCALE)}`, 14, 24);
  doc.setTextColor(0);
}

function formatFullName(person: {
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix_name?: string;
}): string {
  const middle = person.middle_name ? ` ${person.middle_name.charAt(0)}.` : "";
  const suffix = person.suffix_name ? ` ${person.suffix_name}` : "";
  return `${person.last_name}, ${person.first_name}${middle}${suffix}`;
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusColor(status: string): [number, number, number] {
  return STATUS_COLORS[status.toUpperCase()] ?? [146, 64, 14];
}

function buildFilterSummary(filters: EventFilters): string[] {
  const lines: string[] = [];

  if (filters.dateFrom || filters.dateTo) {
    lines.push(`Date: ${filters.dateFrom ?? "—"} to ${filters.dateTo ?? "—"}`);
  }
  if (filters.venue) lines.push(`Venue: ${filters.venue}`);
  if (filters.department) lines.push(`Department: ${filters.department}`);

  return lines;
}

function groupByKey<T>(
  items: T[],
  getKey: (item: T) => string,
  getStatus: (item: T) => string,
): Record<string, { approved: number; rejected: number; pending: number }> {
  const groups: Record<
    string,
    { approved: number; rejected: number; pending: number }
  > = {};

  for (const item of items) {
    const key = getKey(item);
    groups[key] ??= { approved: 0, rejected: 0, pending: 0 };

    const status = getStatus(item);
    if (status === "approved") groups[key].approved++;
    else if (status === "rejected") groups[key].rejected++;
    else groups[key].pending++;
  }

  return groups;
}

// ─── 1. Events Report ─────────────────────────────────────────────

export function exportEventsReport(
  events: EventRecord[],
  filters: EventFilters = {},
): void {
  const doc = new jsPDF({ orientation: "landscape" });
  addHeader(doc, "Events Report");

  const filterLines = buildFilterSummary(filters);
  let startY = 30;

  if (filterLines.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Filters: ${filterLines.join("  |  ")}`, 14, startY);
    doc.setTextColor(0);
    startY += 6;
  }

  autoTable(doc, {
    startY,
    head: [
      [
        "#",
        "Title",
        "Date",
        "Time",
        "Days",
        "Requested By",
        "Venue",
        "Department",
        "Status",
      ],
    ],
    body: events.map((event, index) => [
      index + 1,
      event.activity_title,
      event.date,
      `${event.time_start} – ${event.time_end}`,
      event.number_of_days,
      event.requested_by,
      event.venue?.venue_name ?? "—",
      event.department?.department_name ?? "—",
      event.status.toUpperCase(),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: HEADER_COLOR },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 8) {
        data.cell.styles.textColor = getStatusColor(String(data.cell.raw));
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save("events_report.pdf");
}

// ─── 2. Users Report ──────────────────────────────────────────────

export function exportUsersReport(users: UserRecord[]): void {
  const doc = new jsPDF();
  addHeader(doc, "Users Report");

  autoTable(doc, {
    startY: 30,
    head: [
      [
        "#",
        "Full Name",
        "Username",
        "Email",
        "Role",
        "Department",
        "Date Created",
      ],
    ],
    body: users.map((user, index) => [
      index + 1,
      formatFullName(user),
      user.username,
      user.email,
      user.role?.role_name ?? "—",
      user.department?.department_name ?? "—",
      new Date(user.created_at).toLocaleDateString(LOCALE),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: HEADER_COLOR },
  });

  doc.save("users_report.pdf");
}

// ─── 3. Booking Summary Report ────────────────────────────────────

export function exportBookingSummaryReport(events: EventRecord[]): void {
  const doc = new jsPDF();
  addHeader(doc, "Booking Summary Report");

  const total = events.length;
  const approved = events.filter((e) => e.status === "approved").length;
  const rejected = events.filter((e) => e.status === "rejected").length;
  const pending = events.filter((e) => e.status === "pending").length;

  // Overall summary table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Summary", 14, 32);

  autoTable(doc, {
    startY: 36,
    head: [["Total", "Approved", "Rejected", "Pending"]],
    body: [[total, approved, rejected, pending]],
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: HEADER_COLOR },
  });

  // By Department table
  const byDepartment = groupByKey(
    events,
    (e) => e.department?.department_name ?? "No Department",
    (e) => e.status,
  );

  const deptStartY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("By Department", 14, deptStartY);

  autoTable(doc, {
    startY: deptStartY + 4,
    head: [["Department", "Approved", "Rejected", "Pending", "Total"]],
    body: Object.entries(byDepartment).map(([dept, counts]) => [
      dept,
      counts.approved,
      counts.rejected,
      counts.pending,
      counts.approved + counts.rejected + counts.pending,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: HEADER_COLOR },
  });

  // By Venue table
  const byVenue = groupByKey(
    events,
    (e) => e.venue?.venue_name ?? "No Venue",
    (e) => e.status,
  );

  const venueStartY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("By Venue", 14, venueStartY);

  autoTable(doc, {
    startY: venueStartY + 4,
    head: [["Venue", "Approved", "Rejected", "Pending", "Total"]],
    body: Object.entries(byVenue).map(([venue, counts]) => [
      venue,
      counts.approved,
      counts.rejected,
      counts.pending,
      counts.approved + counts.rejected + counts.pending,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: HEADER_COLOR },
  });

  doc.save("booking_summary_report.pdf");
}

// ─── 4. Activity Log Report ───────────────────────────────────────

export function exportActivityLogReport(logs: ActivityLog[]): void {
  const doc = new jsPDF({ orientation: "landscape" });
  addHeader(doc, "Activity Log Report");

  autoTable(doc, {
    startY: 30,
    head: [
      [
        "#",
        "Date & Time",
        "User",
        "Role",
        "Action",
        "Module",
        "Description",
        "IP",
      ],
    ],
    body: logs.map((log, index) => [
      index + 1,
      new Date(log.created_at).toLocaleString(LOCALE),
      log.user ? formatFullName(log.user) : "System",
      log.user?.role?.role_name ?? "—",
      formatAction(log.action),
      capitalize(log.module),
      log.description,
      log.ip_address ?? "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: HEADER_COLOR },
    columnStyles: { 6: { cellWidth: 70 } },
  });

  doc.save("activity_log_report.pdf");
}
