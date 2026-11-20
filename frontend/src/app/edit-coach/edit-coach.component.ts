import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SaveCoach } from '../Entity/SaveCoach.Entity';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-edit-coach', templateUrl: './edit-coach.component.html' })
export class EditCoachComponent implements OnInit {
  @Input() creating = false;

  private readonly destroyRef = inject(DestroyRef);
  private id = 0;
  readonly form = inject(FormBuilder).nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    activity: ['', Validators.required],
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
  });
  image = '';
  reading = false;
  ready = false;
  loading = false;
  saving = false;
  loadError = '';
  error = '';

  constructor(private service: CrudService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.id = this.creating ? 0 : Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    if (this.loading) return;
    this.loadError = '';
    if (!this.creating && (!Number.isSafeInteger(this.id) || this.id < 1)) {
      this.loadError = 'Ce profil est introuvable.';
      return;
    }
    if (this.creating) {
      this.ready = true;
      return;
    }
    this.loading = true;
    this.ready = false;
    const request = this.service.getGymCoach(this.id);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)).subscribe({
      next: (coach) => {
        if (!coach?.id) {
          this.loadError = 'Ce profil est indisponible dans votre espace.';
          return;
        }
        this.form.patchValue({ nom: coach.nom ?? '', prenom: coach.prenom ?? '', activity: coach.activity ?? '', age: coach.age ?? null });
        this.image = coach.image ?? '';
        this.ready = true;
      },
      error: error => this.loadError = error.status === 403 || error.status === 404
        ? 'Ce profil est indisponible dans votre espace.' : 'Impossible de charger le formulaire.',
    });
  }

  save(): void {
    if (!this.ready || this.saving || this.reading) return;
    const idSalle = this.service.userDetails()?.id;
    const { nom, prenom, activity, age } = this.form.getRawValue();
    if (!idSalle || this.form.invalid || !nom.trim() || !prenom.trim() || !activity.trim() || age == null || (this.creating && !this.image)) {
      this.form.markAllAsTouched();
      this.error = 'Vérifiez les champs obligatoires et l’image.';
      return;
    }
    const payload: SaveCoach = {
      nom: nom.trim(), prenom: prenom.trim(), activity: activity.trim(), age, idSalle, image: this.image,
    };
    this.error = '';
    this.saving = true;
    const request = this.creating ? this.service.addCoach(payload) : this.service.updateCoachSalle(this.id, payload);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving = false)).subscribe({
      next: () => void this.router.navigate(['/mes-coach'], { state: { gymSaved: 'Profil enregistré.' } }),
      error: error => this.error = error.status === 403 ? 'Cette action n’est pas autorisée dans votre espace.' : 'Impossible d’enregistrer le profil. Réessayez.',
    });
  }
}
