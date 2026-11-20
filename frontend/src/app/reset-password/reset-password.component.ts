import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-reset-password', templateUrl: './reset-password.component.html' })
export class ResetPasswordComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  newPassword = '';
  token = '';
  complete = false;
  busy = false;
  error = '';

  constructor(private service: CrudService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.error = 'Le lien de réinitialisation est incomplet. Demandez un nouveau lien depuis la page de connexion.';
  }

  onResetPassword(): void {
    if (!this.token || this.busy || this.complete) return;
    if (!this.newPassword.trim()) {
      this.error = 'Saisissez votre nouveau mot de passe.';
      return;
    }
    this.error = '';
    this.busy = true;
    this.service.resetPassword(this.token, this.newPassword).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)
    ).subscribe({
      next: () => {
        this.complete = true;
        this.newPassword = '';
      },
      error: error => this.error = error.status === 400
        ? 'Ce lien est invalide ou a expiré. Demandez un nouveau lien depuis la page de connexion.'
        : 'Impossible de réinitialiser votre mot de passe. Veuillez réessayer.',
    });
  }
}
