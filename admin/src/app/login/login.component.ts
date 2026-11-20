import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Admin } from '../Entity/Admin.Entity';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    mp: ['', Validators.required],
  });
  busy = false;
  error = '';

  constructor(private service: CrudService, private router: Router) {}

  login(): void {
    if (this.busy) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Saisissez votre adresse e-mail et votre mot de passe.';
      return;
    }
    this.error = '';
    this.busy = true;
    const { email, mp } = this.form.getRawValue();
    this.service.loginAdmin(new Admin(undefined, undefined, undefined, email, mp)).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)
    ).subscribe({
      next: ({ token, role }) => {
        localStorage.setItem('myToken', token);
        localStorage.setItem('role', role);
        void this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: error => this.error = error.status === 401
        ? 'Adresse e-mail ou mot de passe incorrect.' : 'Connexion indisponible. Réessayez.',
    });
  }
}
