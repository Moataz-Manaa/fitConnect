import { JwtHelperService } from '@auth0/angular-jwt';

const jwt = new JwtHelperService();
const storageKeys = {
  client: 'myTokenClient',
  coach: 'myTokenCoach',
  salle: 'myTokenSalle',
} as const;

type Role = keyof typeof storageKeys;

interface SessionClaims {
  role: Role;
  exp: number;
  data: { id: number; nom?: string; prenom?: string };
}

export function activeSession() {
  for (const role of Object.keys(storageKeys) as Role[]) {
    const token = localStorage.getItem(storageKeys[role]);
    if (!token) {
      continue;
    }
    try {
      const claims = jwt.decodeToken<SessionClaims>(token);
      if (claims?.role === role && Number.isSafeInteger(claims.data?.id) &&
          typeof claims.exp === 'number' && claims.exp * 1000 > Date.now()) {
        return { token, claims, role };
      }
    } catch {
      // An unreadable token cannot represent an active session.
    }
  }
  return null;
}

export function clearSession(): void {
  for (const key of Object.values(storageKeys)) {
    localStorage.removeItem(key);
  }
}

export function saveSession(role: Role, token: string): void {
  clearSession();
  localStorage.setItem(storageKeys[role], token);
}
