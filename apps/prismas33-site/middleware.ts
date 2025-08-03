import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificar se é uma rota admin
  if (path.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // Para outras rotas admin, verificar se o usuário está autenticado
    // Nota: Em um middleware, não temos acesso direto ao Firebase Auth
    // Esta verificação seria feita no lado cliente ou através de cookies/tokens
    
    // Por enquanto, vamos permitir todas as rotas admin
    // pois a verificação de autenticação é feita nos componentes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
