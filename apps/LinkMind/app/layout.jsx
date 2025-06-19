import "../styles/globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import { I18nProvider } from "../lib/context/I18nContext";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import RouterErrorBoundary from "../components/RouterErrorBoundary";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata = {
  title: "LinkMind - O teu arquivo mental",
  description: "LinkMind - A tua segunda mente digital para guardar, conectar e explorar tudo o que passa pela tua mente.",
  icons: {
    icon: [
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/favicon.ico"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <RouterErrorBoundary>
          <AuthProvider>
            <I18nProvider>
              <ServiceWorkerRegister />
              {children}
            </I18nProvider>
          </AuthProvider>
        </RouterErrorBoundary>
      </body>
    </html>
  );
}
