import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import { Observable, finalize } from 'rxjs';
import { Category } from '../Entity/Category.Entity';
import { sessionTime } from '../customer/customer-booking';
import { CustomerData, customerData } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-calendar', templateUrl: './calendar.component.html' })
export class CalendarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly form = inject(FormBuilder).nonNullable.group({
    idCategory: new FormControl<number | null>(null, Validators.required),
    description: ['', Validators.required],
    date: ['', Validators.required],
    debut: ['', Validators.required],
    fin: ['', Validators.required],
    prix: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });
  readonly viewOptions = [
    { value: CalendarView.Month, label: 'Mois' },
    { value: CalendarView.Week, label: 'Semaine' },
    { value: CalendarView.Day, label: 'Jour' },
  ];
  readonly CalendarView = CalendarView;
  view = CalendarView.Month;
  viewDate = new Date();
  events: CalendarEvent[] = [];
  selectedEvent?: CalendarEvent;
  activeDayIsOpen = false;
  categories$!: Observable<CustomerData<Category[]>>;
  loading = false;
  loadError = '';
  saving = false;
  error = '';
  success = '';

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadCalendar();
  }

  loadCategories(): void {
    this.categories$ = customerData(this.service.getCategory(), 'Impossible de charger les activités.');
  }

  loadCalendar(): void {
    const coachId = this.service.userDetails()?.id;
    if (!coachId) {
      this.loadError = 'Connectez-vous pour consulter le calendrier.';
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.service.getPlanningC(coachId).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)
    ).subscribe({
      next: plans => {
        this.events = (plans ?? []).flatMap(plan => {
          const start = sessionTime(plan?.date, plan?.debut);
          const end = sessionTime(plan?.date, plan?.fin);
          if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
          const title = [plan.category?.nom || 'Séance', plan.description].filter(Boolean).join(' · ');
          return [{ start: new Date(start), end: new Date(end), title,
            color: { primary: '#335840', secondary: '#e5efde' } }];
        });
        this.selectedEvent = undefined;
      },
      error: () => this.loadError = 'Impossible de charger le calendrier.',
    });
  }

  publish(): void {
    if (this.saving || this.loading) return;
    this.success = '';
    const coachId = this.service.userDetails()?.id;
    const { idCategory, description, date, debut, fin, prix } = this.form.getRawValue();
    const start = sessionTime(date, debut);
    const end = sessionTime(date, fin);
    if (!coachId || this.form.invalid || !description.trim() || !idCategory || prix == null) {
      this.form.markAllAsTouched();
      this.error = 'Renseignez l’activité, la description, les horaires et un prix positif.';
      return;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      this.error = 'L’heure de fin doit être après l’heure de début, le même jour.';
      return;
    }
    this.error = '';
    this.saving = true;
    this.service.addPlanningC({ idCoach: coachId, idCategory, description: description.trim(), date, debut, fin, prix }).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.saving = false)
    ).subscribe({
      next: () => {
        this.viewDate = new Date(start);
        this.activeDayIsOpen = true;
        this.form.reset();
        this.success = 'Créneau publié.';
        this.loadCalendar();
      },
      error: error => this.error = error.status === 409 ? 'Un créneau existe déjà à ces horaires.' : 'Impossible de publier le créneau. Réessayez.',
    });
  }

  dayClicked(date: Date, events: CalendarEvent[]): void {
    if (!isSameMonth(date, this.viewDate)) return;
    this.activeDayIsOpen = events.length > 0 && !(isSameDay(this.viewDate, date) && this.activeDayIsOpen);
    this.viewDate = date;
    this.selectedEvent = undefined;
  }

  closeDay(): void {
    this.activeDayIsOpen = false;
    this.selectedEvent = undefined;
  }
}
