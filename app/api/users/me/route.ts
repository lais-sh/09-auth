export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { logErrorResponse } from '../../_utils/utils';
import { isAxiosError } from 'axios';

function serializeCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const parts = cookieStore.getAll().map(c => `${c.name}=${c.value}`);
  return parts.join('; ');
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const res = await api.get('/users/me', {
      headers: { Cookie: serializeCookieHeader(cookieStore) },
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;            
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status }                                              
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const res = await api.patch('/users/me', body, {
      headers: { Cookie: serializeCookieHeader(cookieStore) }, 
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;             
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status }                                              
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
