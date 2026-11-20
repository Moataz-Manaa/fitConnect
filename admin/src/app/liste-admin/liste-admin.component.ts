import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { deleteAction } from '../management/management-actions';
import { TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';
import { isSuperAdmin } from '../service/session';

@Component({ selector: 'app-liste-admin', templateUrl: './liste-admin.component.html' })
export class ListeAdminComponent {
  readonly saveMessage = history.state?.adminSaved === 'create' ? 'Administrateur ajouté.'
    : history.state?.adminSaved === 'edit' ? 'Administrateur mis à jour.' : '';

  get canManage(): boolean { return isSuperAdmin(); }
  get currentAdminId(): number | undefined { return this.service.userDetails()?.id; }

  constructor(private service: CrudService, private router: Router) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getAdmin().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      const label = [row.prenom, row.nom].filter(Boolean).join(' ') || row.email || String(id);
      return [{
        id,
        cells: [id, row.nom, row.prenom, row.email],
        status: { label: row.role || 'Inconnu', tone: row.role === 'Super Administrateur' ? 'attention' : 'neutral' },
        ...(this.canManage ? {
          editLink: ['/modifierAdmin', id],
          actions: [deleteAction(label, () => this.service.onDeleteAdmin(id).pipe(tap(() => {
            if (id === this.currentAdminId) {
              localStorage.removeItem('myToken');
              localStorage.removeItem('role');
              void this.router.navigate(['/login'], { replaceUrl: true });
            }
          })))],
        } : {}),
      }];
    })
  ));
}
