import { Component, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Plan } from '../Entity/Plan.Entity';
import { sessionStatus, sessionTime } from '../customer/customer-booking';
import { CustomerData, customerData } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

interface CoachSession { plan: Plan; start: number; end: number; }

@Component({ selector: 'app-liste-reservation-coach', templateUrl: './liste-reservation-coach.component.html' })
export class ListeReservationCoachComponent implements OnInit {
  data$!: Observable<CustomerData<CoachSession[]>>;
  selection: 'upcoming' | 'past' | 'all' = 'upcoming';
  page = 1;
  readonly status = sessionStatus;

  constructor(private service: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.service.userDetails()?.id;
    if (!id) {
      this.data$ = of({ loading: false, error: 'Connectez-vous pour consulter vos séances.', value: null });
      return;
    }
    const sessions = this.service.getPlanningC(id).pipe(map(items => (items ?? []).filter(Boolean).map(plan => ({
      plan,
      start: sessionTime(plan.date, plan.debut),
      end: sessionTime(plan.date, plan.fin),
    })).sort((a, b) => (a.start || Infinity) - (b.start || Infinity))));
    this.data$ = customerData(sessions, 'Impossible de charger vos séances.');
  }

  filtered(sessions: CoachSession[]): CoachSession[] {
    if (this.selection === 'all') return sessions;
    if (this.selection === 'past') return sessions.filter(item => this.status(item.start, item.end) === 'ended').reverse();
    return sessions.filter(item => {
      const state = this.status(item.start, item.end);
      return state === 'upcoming' || state === 'live';
    });
  }
}
