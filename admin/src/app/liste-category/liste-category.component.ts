import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category } from '../Entity/Category.Entity';
import { Observable, finalize, map } from 'rxjs';
import { deleteAction } from '../management/management-actions';
import { ManagementTableComponent, TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-liste-category', templateUrl: './liste-category.component.html' })
export class ListeCategoryComponent {
  private readonly destroyRef = inject(DestroyRef);
  name = '';
  saving = false;
  error = '';

  constructor(private service: CrudService) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getCategory().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      const label = row.nom || String(id);
      return [{
        id,
        cells: [id, row.nom],
        actions: [deleteAction(label, () => this.service.onDeleteCategory(id))],
      }];
    })
  ));

  addCategory(table: ManagementTableComponent): void {
    if (this.saving || table.loading || table.saving) return;
    const name = this.name.trim();
    if (!name) {
      this.error = 'Saisissez le nom de la catégorie.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.service.addCategory(new Category(undefined, name)).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.saving = false)
    ).subscribe({
      next: () => {
        this.name = '';
        table.message = 'Catégorie ajoutée.';
        table.reload();
      },
      error: () => this.error = 'Impossible d’ajouter la catégorie. Réessayez.',
    });
  }
}
