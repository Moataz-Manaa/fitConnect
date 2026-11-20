import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Client } from '../Entity/Client.Entity';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-register-client', templateUrl: './register-client.component.html' })
export class RegisterClientComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly forms = inject(FormBuilder).nonNullable;
  readonly clientForm = this.forms.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', Validators.required],
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    email: ['', [Validators.required, Validators.email]],
    mp: ['', Validators.required],
  });
  error = '';
  busy = false;
  registered = false;

  constructor(private service: CrudService) {}

  addNewClient(): void {
    if (this.busy || this.registered) return;
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.error = 'Vérifiez les champs du formulaire, dont votre âge et votre adresse e-mail.';
      return;
    }
    const { nom, prenom, telephone, age, email, mp } = this.clientForm.getRawValue();
    const client = new Client(undefined, nom, prenom, telephone, age ?? undefined, email, mp);
    this.error = '';
    this.busy = true;
    this.service.registerClient(client).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)
    ).subscribe({
      next: () => {
        this.registered = true;
        this.clientForm.reset();
      },
      error: error => this.error = error.status === 400 || error.status === 409
        ? 'Cette adresse e-mail est peut-être déjà utilisée. Vérifiez vos informations ou connectez-vous.'
        : 'Impossible de créer votre compte. Veuillez réessayer.',
    });
  }
}
