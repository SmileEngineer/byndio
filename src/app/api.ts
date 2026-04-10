export const AUTH_STORAGE_KEY = 'byndio.auth.session';

type LoginInput = {
  identifier: string;
  password: string;
};

type SignupInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role?: 'buyer' | 'seller';
};

type GoogleAuthInput = {
  idToken: string;
  role?: 'buyer' | 'seller';
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  referralCode?: string;
  createdAt?: string;
  emailVerified?: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  wallet?: {
    points: number;
  };
};

export type AuthSession = AuthResponse;

type ApiError = Error & {
  statusCode?: number;
  details?: unknown;
};

type RequestOptions = {
  auth?: boolean;
};

function resolveApiBase() {
  const configured = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }
  }

  return '/api';
}

const API_BASE = resolveApiBase();

export function loadAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (session) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore local storage failures
  }
}

export function clearAuthSession() {
  saveAuthSession(null);
}

export function getAuthToken() {
  return loadAuthSession()?.token || null;
}

async function request<T>(
  path: string,
  init: RequestInit,
  { auth = false }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  if (auth) {
    const token = getAuthToken();
    if (!token) {
      const error = new Error('Authentication required.') as ApiError;
      error.statusCode = 401;
      throw error;
    }
    headers.set('authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || 'Request failed.') as ApiError;
    error.statusCode = response.status;
    error.details = payload?.details;
    throw error;
  }

  return payload as T;
}

export async function login(input: LoginInput) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: input.identifier,
      password: input.password,
    }),
  });
}

export async function signup(input: SignupInput) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      confirmPassword: input.confirmPassword,
      role: input.role || 'buyer',
    }),
  });
}

export async function googleAuth(input: GoogleAuthInput) {
  return request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      idToken: input.idToken,
      role: input.role || 'buyer',
    }),
  });
}

export async function getMe() {
  return request<{ user: AuthUser; wallet?: { points: number } }>(
    '/auth/me',
    {
      method: 'GET',
    },
    { auth: true },
  );
}

export async function authRequest<T>(path: string, init: RequestInit) {
  return request<T>(path, init, { auth: true });
}
