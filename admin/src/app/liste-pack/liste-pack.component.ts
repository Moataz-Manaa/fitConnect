import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TableRow } from '../management/management-table.component';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-liste-pack', templateUrl: './liste-pack.component.html' })
export class ListePackComponent {
  constructor(private service: CrudService) {}

  readonly loadRows = (): Observable<TableRow[]> => this.service.getPack().pipe(map(items =>
    (items ?? []).flatMap(row => {
      const id = row?.id;
      if (id == null) return [];
      return [{
        id,
        cells: [id, row.nom, row.description, row.prix, row.category?.nom, row.salle?.nom],
      }];
    })
  ));
}
