import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { Observable, finalize } from 'rxjs';

export interface TableStatus {
  label: string;
  tone: 'positive' | 'neutral' | 'attention';
}

export interface TableAction {
  label: string;
  run: () => Observable<unknown>;
  confirmation: string;
  success: string;
  destructive?: boolean;
}

export interface TableRow {
  id: number;
  cells: (string | number | null | undefined)[];
  status?: TableStatus;
  editLink?: (string | number)[];
  actions?: TableAction[];
}

export function accountStatus(active: boolean | undefined): TableStatus {
  return active ? { label: 'Actif', tone: 'positive' } : { label: 'Inactif', tone: 'neutral' };
}

function searchText(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
}

@Component({
  selector: 'app-management-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './management-table.component.html',
})
export class ManagementTableComponent implements OnInit {
  @Input() title = '';
  @Input() columns: string[] = [];
  @Input() statusColumn = '';
  @Input() hasActions = false;
  @Input() actionsDisabled = false;
  @Input() loadRows!: () => Observable<TableRow[]>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  rows: TableRow[] = [];
  matches: TableRow[] = [];
  page = 1;
  query = '';
  status = '';
  statuses: string[] = [];
  loading = false;
  saving = false;
  loadError = '';
  actionError = '';
  message = '';
  pending?: { row: TableRow; action: TableAction };

  ngOnInit(): void {
    if (this.statusColumn) {
      this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        this.status = params.get('status') === 'Inactif' ? 'Inactif' : '';
        this.applyFilters();
      });
    }
    this.reload();
  }

  reload(): void {
    if (this.loading || this.saving) return;
    this.loadError = '';
    this.pending = undefined;
    this.loading = true;
    this.loadRows().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading = false)
    ).subscribe({
      next: rows => {
        this.rows = rows;
        this.statuses = [...new Set(rows.flatMap(row => row.status ? [row.status.label] : []))].sort();
        this.applyFilters(false);
      },
      error: () => this.loadError = 'Impossible de charger ces données. Réessayez.',
    });
  }

  applyFilters(resetPage = true): void {
    const query = searchText(this.query).trim().split(/\s+/);
    this.matches = this.rows.filter(row => {
      const text = searchText(row.cells.join(' '));
      return (!this.status || row.status?.label === this.status) && query.every(word => text.includes(word));
    });
    const lastPage = Math.max(1, Math.ceil(this.matches.length / 10));
    this.page = resetPage ? 1 : Math.min(this.page, lastPage);
  }

  selectAction(row: TableRow, action: TableAction): void {
    if (this.saving || this.actionsDisabled) return;
    this.actionError = '';
    this.message = '';
    this.pending = { row, action };
  }

  confirmAction(): void {
    const pending = this.pending;
    if (!pending || this.saving || this.actionsDisabled) return;
    this.saving = true;
    this.actionError = '';
    pending.action.run().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving = false)
    ).subscribe({
      next: () => {
        this.saving = false;
        this.message = pending.action.success;
        this.reload();
      },
      error: error => this.actionError = error.status === 409
        ? 'Cette action est impossible tant que des données associées existent.'
        : error.status === 403 ? 'Votre compte ne dispose pas de cette autorisation.' : 'L’action a échoué. Réessayez.',
    });
  }
}
