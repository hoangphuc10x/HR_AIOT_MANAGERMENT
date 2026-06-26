import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATH = [
  '/',
  '/login',
  '/forgot-password',
  '/confirm-code',
  '/active-account',
  '/reset-password',
  '/socket',
];

export interface JwtPayload {
  userId: number;
  code: string;
  role: number[];
  expireAt: number;
}

const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const secret = new globalThis.TextEncoder().encode(
      process.env.NEXT_PUBLIC_JWT_SECRET,
    );
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload === 'object' &&
      typeof payload.userId === 'number' &&
      Array.isArray(payload.role) && // check array
      (typeof payload.expireAt === 'string' ||
        typeof payload.expireAt === 'number')
    ) {
      return {
        userId: payload.userId,
        code: payload.code as string,
        role: payload.role as number[],
        expireAt: new Date(payload.expireAt).getTime(),
      };
    }

    return null;
  } catch (err) {
    console.log('error verify token: ', err);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATH.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;
  const url = request.nextUrl.clone();

  if (!token && pathname.startsWith('/admin')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (!token) {
    if (
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/active-account')
    ) {
      return NextResponse.next();
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  console.log('token:', token);

  const payload = await verifyToken(token);

  if (!payload || !payload.role) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
