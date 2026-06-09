// The trainer dashboard is a light workspace in both site themes. Forcing the
// `theme-light` token scope here keeps every panel readable even when the site
// is in dark mode — otherwise inherited `text-content` (bone) and token-based
// panels render light-on-light and vanish. `text-content` sets a dark base color
// so uncolored headings inherit ink instead of bone.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-light text-content">{children}</div>;
}
