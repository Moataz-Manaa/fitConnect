import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Admin } from '../Entity/Admin.Entity';
import { CrudService } from '../service/crud.service';
import { isSuperAdmin } from '../service/session';

@Component({ selector: 'app-modifier-admin', templateUrl: './modifier-admin.component.html' })
export class ModifierAdminComponent implements OnInit {
  @Input() mode: 'create' | 'edit' | 'profile' = 'edit';

  private readonly destroyRef = inject(DestroyRef);
  readonly form = inject(FormBuilder).nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    mp: [''],
  });
  private id?: number;
  busy = false;
  loading = false;
  ready = false;
  loadError = '';
  error = '';
  success = '';

  constructor(private service: CrudService, private route: ActivatedRoute, private router: Router) {}

  get title(): string {
    return this.mode === 'profile' ? 'Mon compte' : this.mode === 'create' ? 'Ajouter un administrateur' : 'Modifier un administrateur';
  }

  get canEdit(): boolean { return isSuperAdmin(); }

  ngOnInit(): void {
    if (this.mode === 'create') {
      this.form.controls.mp.addValidators(Validators.required);
      this.form.controls.mp.updateValueAndValidity();
      this.ready = true;
    } else {
      this.load();
    }
  }

  load(): void {
    this.id = this.mode === 'profile' ? this.service.userDetails()?.id : Number(this.route.snapshot.paramMap.get('id'));
    this.ready = false;
    if (!this.id) {
      this.loadError = 'Ce compte est introuvable.';
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.service.findAdminById(this.id).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)
    ).subscribe({
      next: admin => {
        if (!admin?.id) {
          this.loadError = 'Ce compte est introuvable.';
          return;
        }
        this.form.reset({ nom: admin.nom ?? '', prenom: admin.prenom ?? '', email: admin.email ?? '', role: admin.role ?? '' });
        this.ready = true;
      },
      error: () => this.loadError = 'Impossible de charger ce compte.',
    });
  }

  save(): void {
    if (!this.ready || this.busy || !this.canEdit) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Vérifiez les champs du formulaire.';
      return;
    }
    const { nom, prenom, email, role, mp } = this.form.getRawValue();
    const admin = new Admin(this.id, nom.trim(), prenom.trim(), email.trim(), mp || undefined, role);
    const request = this.id ? this.service.updateAdmin(this.id, admin) : this.service.addadmin(admin);
    this.busy = true;
    this.error = '';
    this.success = '';
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.busy = false)).subscribe({
      next: () => {
        if (this.id && this.id === this.service.userDetails()?.id) {
          localStorage.setItem('role', role);
        }
        if (this.mode === 'profile') {
          this.form.controls.mp.reset();
          this.success = 'Votre compte a été mis à jour.';
        } else {
          void this.router.navigate(['/listeAdmin'], { state: { adminSaved: this.mode } });
        }
      },
      error: error => this.error = error.status === 403
        ? 'Votre compte ne dispose pas de cette autorisation.'
        : error.status === 409 || (this.mode === 'create' && error.status === 404)
          ? 'Cette adresse e-mail est déjà utilisée.' : 'Impossible d’enregistrer le compte. Réessayez.',
    });
  }
}
