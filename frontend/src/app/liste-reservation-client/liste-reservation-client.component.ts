import { Component, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Plan } from '../Entity/Plan.Entity';
import { sessionStatus, sessionTime } from '../customer/customer-booking';
import { CustomerData, customerData } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

interface MemberReservation { plan?: Plan; start: number; end: number; }

@Component({ selector: 'app-liste-reservation-client', templateUrl: './liste-reservation-client.component.html' })
export class ListeReservationClientComponent implements OnInit {
  data$!: Observable<CustomerData<MemberReservation[]>>;
  page = 1;

  constructor(private service: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.service.userDetails()?.id;
    if (!id) {
      this.data$ = of({ loading: false, error: 'Connectez-vous pour consulter vos réservations.', value: null });
      return;
    }
    const reservations = this.service.getReservationByIdclient(id).pipe(map(items => (items ?? [])
      .filter(item => item != null)
      .map(({ plan }) => ({ plan, start: sessionTime(plan?.date, plan?.debut), end: sessionTime(plan?.date, plan?.fin) }))));
    this.data$ = customerData(reservations, 'Impossible de charger vos réservations.');
  }

  status({ start, end }: MemberReservation): 'upcoming' | 'live' | 'ended' | 'unknown' {
    return sessionStatus(start, end);
  }
}
