import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize, map, switchMap } from 'rxjs';
import { Plan } from '../Entity/Plan.Entity';
import { canBookSession, sessionTime } from '../customer/customer-booking';
import { CustomerData, customerData } from '../customer/customer-data';
import { CheckoutService, checkoutErrorMessage } from '../service/checkout.service';
import { CrudService } from '../service/crud.service';
import { activeSession } from '../service/session';

interface ScheduledSession { plan: Plan; startsAt: number; }

@Component({ selector: 'app-seance-client', templateUrl: './seance-client.component.html' })
export class SeanceClientComponent implements OnInit {
  data$!: Observable<CustomerData<ScheduledSession[]>>;
  coachId = '';
  page = 1;
  pendingPlanId?: number;
  checkoutError = '';
  readonly canBook = canBookSession;

  constructor(private service: CrudService, private checkout: CheckoutService, private route: ActivatedRoute) {}

  get isMember(): boolean { return activeSession()?.role === 'client'; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = this.route.paramMap.pipe(switchMap(params => {
      this.coachId = params.get('id') ?? '';
      this.page = 1;
      this.checkoutError = '';
      const plans = this.service.getPlanningC(Number(this.coachId)).pipe(map(items => {
        const now = Date.now();
        return (items ?? []).filter(plan => plan?.id && plan.coach?.etat !== false)
          .map(plan => ({ plan, startsAt: sessionTime(plan.date, plan.debut) }))
          .filter(session => session.startsAt > now)
          .sort((a, b) => a.startsAt - b.startsAt);
      }));
      return customerData(plans, 'Impossible de charger les séances.');
    }));
  }

  startCheckout(session: ScheduledSession): void {
    const id = session.plan.id;
    if (!id || !this.isMember || this.pendingPlanId !== undefined) return;
    if (!this.canBook(session.startsAt)) {
      this.checkoutError = 'Les réservations sont closes pour cette séance.';
      return;
    }
    this.checkoutError = '';
    this.pendingPlanId = id;
    this.checkout.start('SESSION', id).pipe(
      finalize(() => this.pendingPlanId = undefined)
    ).subscribe({ error: error => this.checkoutError = checkoutErrorMessage(error) });
  }
}
