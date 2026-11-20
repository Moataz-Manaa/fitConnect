import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { deleteAction } from '../management/management-actions';
import { accountStatus, TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-liste-client', templateUrl: './liste-client.component.html' })
export class ListeClientComponent {
  constructor(private service: CrudService) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getClient().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      const label = [row.prenom, row.nom].filter(Boolean).join(' ') || row.email || String(id);
      return [{
        id,
        cells: [id, row.nom, row.prenom, row.email, row.telephone, row.age],
        status: accountStatus(row.etat),
        actions: [deleteAction(label, () => this.service.onDeleteClient(id))],
      }];
    })
  ));
}
