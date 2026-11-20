import { GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { Client } from '../Entity/Client.Entity';
import { customerLoginDestination } from '../customer/customer-booking';
import { isCheckoutId } from '../service/checkout.service';
import { CrudService } from '../service/crud.service';
import { saveSession } from '../service/session';

@Component({ selector: 'app-login-client', templateUrl: './login-client.component.html' })
export class LoginClientComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly forms = inject(FormBuilder).nonNullable;
  readonly loginForm = this.forms.group({
    email: ['', [Validators.required, Validators.email]],
    mp: ['', Validators.required],
  });
  readonly forgotPasswordForm = this.forms.group({ email: ['', [Validators.required, Validators.email]] });
  activeTab: 'login' | 'reset' = 'login';
  passwordVisible = false;
  busy = false;
  error = '';
  resetSent = false;

  constructor(
    private service: CrudService,
    private router: Router,
    private route: ActivatedRoute,
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    let listening = false;
    this.socialAuthService.authState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      // The provider replays its last credential. Only accept a new Google interaction on this page.
      if (!listening || user?.provider !== GoogleLoginProvider.PROVIDER_ID || !user.idToken || this.activeTab !== 'login') return;
      this.authenticate(this.service.signInWithGoogle(user.idToken), true);
    });
    listening = true;
  }

  switchTab(tab: 'login' | 'reset'): void {
    this.activeTab = tab;
    this.error = '';
    this.resetSent = false;
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.error = 'Saisissez une adresse e-mail valide et votre mot de passe.';
      return;
    }
    const { email, mp } = this.loginForm.getRawValue();
    const client = new Client(undefined, undefined, undefined, undefined, undefined, email, mp);
    this.authenticate(this.service.loginClient(client));
  }

  forgotPassword(): void {
    if (this.busy) return;
    this.resetSent = false;
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.error = 'Saisissez une adresse e-mail valide.';
      return;
    }
    this.error = '';
    this.busy = true;
    this.service.forgotPassword(this.forgotPasswordForm.getRawValue().email).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)
    ).subscribe({
      next: () => {
        this.resetSent = true;
        this.forgotPasswordForm.reset();
      },
      error: () => this.error = 'Impossible d’envoyer le lien de réinitialisation. Veuillez réessayer.',
    });
  }

  private authenticate(request: Observable<{ token: string }>, viaGoogle = false): void {
    if (this.busy) return;
    this.error = '';
    this.busy = true;
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)).subscribe({
      next: ({ token }) => this.completeLogin(token),
      error: (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.error = 'Votre compte est inactif. Si vous venez de vous inscrire, confirmez votre adresse e-mail.';
        } else if (error.status === 401 && !viaGoogle) {
          this.error = 'Adresse e-mail ou mot de passe incorrect.';
        } else {
          this.error = viaGoogle ? 'Impossible de se connecter avec Google.' : 'Impossible de se connecter. Veuillez réessayer.';
        }
      },
    });
  }

  private completeLogin(token: string): void {
    saveSession('client', token);
    const params = this.route.snapshot.queryParamMap;
    const checkoutId = params.get('checkout');
    const destination = customerLoginDestination(checkoutId, params.get('returnTo'));
    const queryParams = isCheckoutId(checkoutId) ? {
      returned: params.get('returned') === 'true' ? true : null,
      cancelled: params.get('cancelled') === 'true' ? true : null,
    } : {};
    void this.router.navigate(destination, { queryParams });
  }
}
