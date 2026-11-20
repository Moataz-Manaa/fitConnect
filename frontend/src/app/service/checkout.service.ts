import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export type CheckoutKind = 'SESSION' | 'PACK' | 'RENEWAL';

export interface Checkout {
  id: string;
  kind: CheckoutKind;
  state: 'OPEN' | 'COMPLETED' | 'EXPIRED';
  description: string;
  amount: number;
  currency: string;
  activationDate: string | null;
  checkoutUrl: string | null;
  resultId: number | null;
  confirmedAt: string | null;
}

export function isCheckoutId(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}

export function checkoutErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400: return 'Vérifiez les informations de votre achat.';
    case 401: return 'Connectez-vous pour continuer.';
    case 403: return 'Votre compte ne peut pas effectuer cet achat.';
    case 404: return 'Ce paiement ou ce produit est introuvable.';
    case 409: return 'Cet achat est indisponible. Si vous avez déjà réservé, consultez vos réservations.';
    case 503: return 'Le paiement est temporairement indisponible.';
    default: return 'Impossible de joindre le service de paiement. Veuillez réessayer.';
  }
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(private http: HttpClient, private router: Router) {}

  start(kind: CheckoutKind, productId: number, activationDate?: string) {
    return this.http.post<Checkout>('/api/checkout', { kind, productId, activationDate }).pipe(
      tap(checkout => { void this.router.navigate(['/checkout', checkout.id]); })
    );
  }

  confirm(id: string) {
    return this.http.post<Checkout>(`/api/checkout/${id}/confirm`, {});
  }

  cancel(id: string) {
    return this.http.post<Checkout>(`/api/checkout/${id}/cancel`, {});
  }
}
