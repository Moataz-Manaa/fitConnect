import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { activationAction, deleteAction } from '../management/management-actions';
import { accountStatus, TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-liste-salle-de-sport', templateUrl: './liste-salle-de-sport.component.html' })
export class ListeSalleDeSportComponent {
  constructor(private service: CrudService) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getSalleDeSport().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      const label = row.nom || String(id);
      return [{
        id,
        cells: [id, row.nom, row.email, row.adresse, row.telephone],
        status: accountStatus(row.etat),
        actions: [
          activationAction(label, row.etat === true, etat => this.service.updateSalleDeSport({ etat }, id)),
          deleteAction(label, () => this.service.onDeleteSalleDeSport(id)),
        ],
      }];
    })
  ));
}
