// The student dashboard is a light workspace in both site themes — see the note
// in app/dashboard/layout.tsx. Scoping to `theme-light` keeps it readable when
// the site is in dark mode.
export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-light text-content">{children}</div>;
}
