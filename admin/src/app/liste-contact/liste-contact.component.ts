import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { deleteAction } from '../management/management-actions';
import { TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-liste-contact', templateUrl: './liste-contact.component.html' })
export class ListeContactComponent {
  constructor(private service: CrudService) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getContact().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      const label = row.sujet || row.email || String(id);
      return [{
        id,
        cells: [id, row.nom, row.telephone, row.email, row.sujet, row.message],
        actions: [deleteAction(label, () => this.service.onDeleteContact(id))],
      }];
    })
  ));
}
