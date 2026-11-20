import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { Observable, finalize, map } from 'rxjs';
import { CustomerData, customerData, matchesSearch } from '../customer/customer-data';
import { PageStateComponent } from '../customer/page-state.component';
import { LayoutModule } from '../layout.module';
import { CrudService } from '../service/crud.service';
import { WorkspaceNavComponent } from './workspace-nav.component';

interface DirectoryItem {
  id: number;
  name: string;
  image?: string;
  detail?: string;
  description?: string;
  price?: number;
}

@Component({
  selector: 'app-gym-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, PageStateComponent, LayoutModule, WorkspaceNavComponent],
  templateUrl: './gym-directory.component.html',
})
export class GymDirectoryComponent implements OnInit {
  @Input() mode: 'packs' | 'coaches' = 'packs';

  private readonly destroyRef = inject(DestroyRef);
  data$!: Observable<CustomerData<DirectoryItem[]>>;
  query = '';
  page = 1;
  pendingId?: number;
  deleting = false;
  actionError = '';
  success = typeof history.state?.gymSaved === 'string' ? history.state.gymSaved : '';

  constructor(private service: CrudService) {}

  get isPacks(): boolean { return this.mode === 'packs'; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.pendingId = undefined;
    const request = this.isPacks
      ? this.service.getMyPacks().pipe(map(items => (items ?? []).flatMap(item => item?.id ? [{
        id: item.id, name: item.nom || 'Pack', image: item.image, detail: item.category?.nom,
        description: item.description, price: item.prix,
      }] : [])))
      : this.service.getMyCoach().pipe(map(items => (items ?? []).flatMap(item => item?.id ? [{
        id: item.id, name: [item.prenom, item.nom].filter(Boolean).join(' ') || 'Coach',
        image: item.image, detail: item.activity, description: item.age ? `${item.age} ans` : undefined,
      }] : [])));
    this.data$ = customerData<DirectoryItem[]>(request, 'Impossible de charger cette liste.');
  }

  search(items: DirectoryItem[]): DirectoryItem[] {
    return items.filter(item => matchesSearch(this.query, item.name, item.detail, item.description));
  }

  deleteItem(item: DirectoryItem): void {
    if (this.deleting || this.pendingId !== item.id) return;
    this.actionError = '';
    this.success = '';
    this.deleting = true;
    const request = this.isPacks ? this.service.deletePack(item.id) : this.service.deleteCoach(item.id);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.deleting = false)).subscribe({
      next: () => {
        this.page = 1;
        this.success = this.isPacks ? 'Pack supprimé.' : 'Profil supprimé.';
        this.load();
      },
      error: error => this.actionError = error.status === 409
        ? 'Cet élément ne peut pas être supprimé car il possède des données associées.'
        : 'Impossible d’effectuer la suppression. Réessayez.',
    });
  }
}
