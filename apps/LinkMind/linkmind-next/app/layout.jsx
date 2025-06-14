import "../styles/variaveis.module.css";
import "../styles/globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="bg-[var(--prata)] min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="max-w-xl mx-auto p-4 w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
