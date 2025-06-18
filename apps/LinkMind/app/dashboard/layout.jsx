// This is a server component for handling layout and metadata
export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "cover",
};

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}
