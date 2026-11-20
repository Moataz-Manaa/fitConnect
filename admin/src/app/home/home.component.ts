import { Component } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-home', templateUrl: './home.component.html' })
export class HomeComponent {
  overview$ = this.loadOverview();

  constructor(private service: CrudService) {}

  reload(): void { this.overview$ = this.loadOverview(); }

  private loadOverview() {
    return this.service.getOverview().pipe(
      map(value => ({ value, loading: false, error: false })),
      startWith({ value: null, loading: true, error: false }),
      catchError(() => of({ value: null, loading: false, error: true }))
    );
  }
}
