import "../styles/globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import RouterErrorBoundary from "../components/RouterErrorBoundary";

export const metadata = {
  title: "LinkMind - Organize suas ideias",
  description: "LinkMind - A plataforma inteligente para capturar, organizar e encontrar as suas melhores ideias",
  icons: {
    icon: "/vector.png",
    apple: "/vector.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7B4BFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <RouterErrorBoundary>
          <AuthProvider>
            <ServiceWorkerRegister />
            {children}
          </AuthProvider>
        </RouterErrorBoundary>
      </body>
    </html>
  );
}
