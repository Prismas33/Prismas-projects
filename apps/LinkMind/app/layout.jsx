import "../styles/globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <title>LinkMind - Organize suas ideias</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="LinkMind - A plataforma inteligente para capturar, organizar e encontrar as suas melhores ideias" />
        <link rel="icon" href="/vector.png" />
        <link rel="apple-touch-icon" href="/vector.png" />
        <meta name="theme-color" content="#7B4BFF" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <ServiceWorkerRegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
