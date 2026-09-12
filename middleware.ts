import { NextRequest, NextResponse } from 'next/server';

const ADMIN_REALM = 'CPLP Fashion Week CMS prototype';

function unauthorizedResponse() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'Cache-Control': 'no-store',
      'WWW-Authenticate': `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
    },
  });
}

function unavailableResponse() {
  return new NextResponse('CMS authentication is not configured.', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function hasValidCredentials(request: NextRequest) {
  const expectedUser = process.env.CPLP_ADMIN_USER;
  const expectedPassword = process.env.CPLP_ADMIN_PASSWORD;

  // Fail closed when protection is enabled but deployment credentials are missing.
  if (!expectedUser || !expectedPassword) {
    return null;
  }

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) {
    return false;
  }

  try {
    const decoded = atob(authorization.slice('Basic '.length));
    const separator = decoded.indexOf(':');

    if (separator < 0) {
      return false;
    }

    return (
      decoded.slice(0, separator) === expectedUser &&
      decoded.slice(separator + 1) === expectedPassword
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  // Local development stays convenient by default. Vercel production deployments
  // are protected automatically; previews can opt in with CPLP_ADMIN_AUTH=true.
  const protectionEnabled =
    process.env.CPLP_ADMIN_AUTH === 'true' || process.env.VERCEL_ENV === 'production';

  if (!protectionEnabled) {
    return NextResponse.next();
  }

  const credentialsValid = hasValidCredentials(request);

  if (credentialsValid === null) {
    return unavailableResponse();
  }

  if (!credentialsValid) {
    return unauthorizedResponse();
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
