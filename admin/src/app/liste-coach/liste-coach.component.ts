import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { activationAction, deleteAction } from '../management/management-actions';
import { accountStatus, TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-liste-coach', templateUrl: './liste-coach.component.html' })
export class ListeCoachComponent {
  constructor(private service: CrudService) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getCoach().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      const label = [row.prenom, row.nom].filter(Boolean).join(' ') || row.email || String(id);
      return [{
        id,
        cells: [id, row.nom, row.prenom, row.email, row.telephone],
        status: accountStatus(row.etat),
        actions: [
          activationAction(label, row.etat === true, etat => this.service.updateCoach({ etat }, id)),
          deleteAction(label, () => this.service.onDeleteCoach(id)),
        ],
      }];
    })
  ));
}
