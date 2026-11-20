import { JwtHelperService } from '@auth0/angular-jwt';

const jwt = new JwtHelperService();

interface AdminClaims {
  role: 'admin';
  exp: number;
  data: { id: number; nom?: string; prenom?: string };
}

export function adminSession() {
  const token = localStorage.getItem('myToken');
  if (!token) {
    return null;
  }
  try {
    const claims = jwt.decodeToken<AdminClaims>(token);
    if (claims?.role === 'admin' && Number.isSafeInteger(claims.data?.id) &&
        typeof claims.exp === 'number' && claims.exp * 1000 > Date.now()) {
      return { token, claims };
    }
  } catch {
    return null;
  }
  return null;
}

export function isSuperAdmin(): boolean {
  return adminSession() !== null && localStorage.getItem('role') === 'Super Administrateur';
}
