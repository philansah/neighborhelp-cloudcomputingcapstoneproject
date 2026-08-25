import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isSecure = forwardedProto === 'https' || request.url.startsWith('https://');

  return NextResponse.json({
    diagnostics: {
      timestamp: new Date().toISOString(),
      codeVersion: "dynamic-cookie-fix-v2",
      nodeEnv: process.env.NODE_ENV || 'not set',
      isRequestSecureDetected: isSecure,
      requestUrl: request.url,
      hasTokenCookie: !!tokenCookie,
      tokenCookieDetails: tokenCookie ? {
        name: tokenCookie.name,
        valueLength: tokenCookie.value?.length || 0,
      } : null,
      headers: headersObj,
    }
  });
}
