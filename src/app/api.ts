type LoginInput = {
  identifier: string;
  password: string;
};

type SignupInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
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
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  wallet?: {
    points: number;
  };
};

type ApiError = Error & {
  statusCode?: number;
  details?: unknown;
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

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
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
      role: input.role || 'buyer',
    }),
  });
}
