import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { Category } from '../Entity/Category.Entity';
import { SavePack } from '../Entity/SavePack.Entity';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-edit-pack', templateUrl: './edit-pack.component.html' })
export class EditPackComponent implements OnInit {
  @Input() creating = false;

  private readonly destroyRef = inject(DestroyRef);
  private id = 0;
  readonly form = inject(FormBuilder).nonNullable.group({
    nom: ['', Validators.required],
    description: ['', Validators.required],
    prix: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    idCategory: new FormControl<number | null>(null, Validators.required),
  });
  categories: Category[] = [];
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
      this.loadError = 'Ce pack est introuvable.';
      return;
    }
    this.loading = true;
    this.ready = false;
    const request = forkJoin({
      categories: this.service.getCategory(),
      pack: this.creating ? of(null) : this.service.getPackByIdApi(this.id),
    });
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)).subscribe({
      next: ({ categories, pack }) => {
        this.categories = (categories ?? []).filter(category => category?.id);
        if (!this.creating && (!pack?.id || pack.salle?.id !== this.service.userDetails()?.id)) {
          this.loadError = 'Ce pack est indisponible dans votre espace.';
          return;
        }
        if (pack) {
          this.form.patchValue({ nom: pack.nom ?? '', description: pack.description ?? '', prix: pack.prix ?? null, idCategory: pack.category?.id ?? null });
          this.image = pack.image ?? '';
        }
        this.ready = true;
      },
      error: error => this.loadError = error.status === 403 || error.status === 404
        ? 'Ce pack est indisponible dans votre espace.' : 'Impossible de charger le formulaire.',
    });
  }

  save(): void {
    if (!this.ready || this.saving || this.reading) return;
    const idSalle = this.service.userDetails()?.id;
    const { nom, description, prix, idCategory } = this.form.getRawValue();
    if (!idSalle || this.form.invalid || !nom.trim() || !description.trim() || prix == null || !idCategory || (this.creating && !this.image)) {
      this.form.markAllAsTouched();
      this.error = 'Vérifiez les champs obligatoires, le prix et l’image.';
      return;
    }
    const payload: SavePack = {
      nom: nom.trim(), description: description.trim(), prix, idCategory, idSalle, image: this.image,
    };
    this.error = '';
    this.saving = true;
    const request = this.creating ? this.service.addPack(payload) : this.service.updatePack(this.id, payload);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving = false)).subscribe({
      next: () => void this.router.navigate(['/mesPacks'], { state: { gymSaved: 'Pack enregistré.' } }),
      error: error => this.error = error.status === 403 ? 'Cette action n’est pas autorisée dans votre espace.' : 'Impossible d’enregistrer le pack. Réessayez.',
    });
  }
}
