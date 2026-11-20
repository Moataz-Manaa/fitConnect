import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Contact } from '../Entity/Contact.Entity';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-contact', templateUrl: './contact.component.html' })
export class ContactComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly forms = inject(FormBuilder).nonNullable;
  readonly contactForm = this.forms.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    sujet: ['', Validators.required],
    message: ['', Validators.required],
  });
  error = '';
  busy = false;
  sent = false;

  constructor(private service: CrudService) {}

  addNewContact(): void {
    if (this.busy) return;
    this.sent = false;
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.error = 'Vérifiez que tous les champs sont renseignés et que votre adresse e-mail est valide.';
      return;
    }
    const { nom, email, telephone, sujet, message } = this.contactForm.getRawValue();
    this.error = '';
    this.busy = true;
    this.service.submitContact(new Contact(undefined, nom, email, telephone, sujet, message)).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)
    ).subscribe({
      next: () => {
        this.sent = true;
        this.contactForm.reset();
      },
      error: () => this.error = 'Impossible d’envoyer votre message. Vous pouvez réessayer.',
    });
  }
}
