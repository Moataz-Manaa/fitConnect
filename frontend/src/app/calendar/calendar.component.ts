import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { isSameMonth, isSameDay } from 'date-fns';
import { Subject } from 'rxjs';
import { CrudService } from '../service/crud.service';
import { SavePlan } from '../Entity/SavePlan.Entity';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  PlanningCForm: FormGroup;
  categories: any[] = [];

  constructor(
    private service: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    let formControls = {
      idCategory: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      debut: new FormControl('', [Validators.required]),
      fin: new FormControl('', [Validators.required]),
      prix: new FormControl('', [Validators.required, Validators.min(0)]),
    };
    this.PlanningCForm = this.fb.group(formControls);
  }

  get idCategory() {
    return this.PlanningCForm.get('idCategory');
  }
  get description() {
    return this.PlanningCForm.get('description');
  }
  get date() {
    return this.PlanningCForm.get('date');
  }
  get debut() {
    return this.PlanningCForm.get('debut');
  }
  get fin() {
    return this.PlanningCForm.get('fin');
  }
  get prix() {
    return this.PlanningCForm.get('prix');
  }

  addNewPlanningC() {
    let datas = this.service.userDetails();
    let data = this.PlanningCForm.value;
    console.log('Form data:', data);
    let model: SavePlan = new SavePlan();
    model.id = null;
    model.description = data.description;
    model.date = data.date;
    model.debut = data.debut;
    model.fin = data.fin;
    model.prix = data.prix;
    model.idCoach = datas?.id;
    model.idCategory = data.idCategory;

    if (
      !data.description ||
      !data.date ||
      !data.debut ||
      !data.fin ||
      !data.idCategory ||
      data.prix == null
    ) {
      Swal.fire({
        title: 'Erreur',
        text: 'Tous les champs sont obligatoires.',
        icon: 'error',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    this.service.addPlanningC(model).subscribe(
      (res) => {
        console.log('Add planning response:', res);
        Swal.fire({
          title: 'Succès !',
          text: 'Planning ajouté avec succès.',
          icon: 'success',
          showConfirmButton: false,
          timer: 3000,
        });

        this.viewDate = new Date(data.date);
        this.fetchAndDisplayPlanningData();
        this.PlanningCForm.reset();
      },
      (error) => {
        console.log('Add planning error:', error);
        Swal.fire({
          title: 'Erreur',
          text: error.error.message || 'Problème de serveur.',
          icon: 'error',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    );
  }

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = true;

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log('Event clicked:', action, event);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log('Event times changed:', event, newStart, newEnd);
  }

  fetchAndDisplayPlanningData() {
    let datas = this.service.userDetails();
    console.log('Fetching planning data for user:', datas?.id);

    this.service.getPlanningC(datas.id).subscribe(
      (planningData: any[]) => {
        console.log('Planning data received:', planningData);
        this.events = [];
        const today = new Date();

        planningData.forEach((data, index) => {
          console.log(`Processing planning item ${index}:`, data);

          if (!data.date || !data.debut || !data.fin) {
            console.warn('Invalid planning data:', data);
            return;
          }

          try {
            let datePart: string;
            if (data.date.includes('T')) {
              datePart = data.date.split('T')[0];
            } else {
              datePart = data.date;
            }

            const startDateTime = `${datePart}T${data.debut}:00`;
            const endDateTime = `${datePart}T${data.fin}:00`;

            console.log('DateTime strings:', { startDateTime, endDateTime });

            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.error('Invalid dates created:', { startDate, endDate });
              return;
            }

            const color = endDate < today ? '#ff0000' : '#1e90ff';
            const categoryName = data.category?.nom || 'No Category';

            const event: CalendarEvent = {
              start: startDate,
              end: endDate,
              title: `${categoryName}: ${data.description} (Prix: ${data.prix}d)`,
              color: {
                primary: color,
                secondary: color + '80',
              },
              meta: {
                planningId: data.id,
                categoryId: data.idCategory,
                coachId: data.idCoach,
              },
            };

            console.log('Created event:', event);
            this.events.push(event);
          } catch (error) {
            console.error('Error processing planning item:', error, data);
          }
        });

        console.log('Final events array:', this.events);
        this.refresh.next(null);
      },
      (err) => {
        console.error('Error fetching planning data:', err);
      }
    );
  }

  fetchCategories() {
    this.service.getCategory().subscribe(
      (res: any[]) => {
        console.log('Categories loaded:', res);
        this.categories = res;
      },
      (err) => {
        console.error('Error fetching categories:', err);
      }
    );
  }

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchAndDisplayPlanningData();
  }
}
