import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reservation } from '../Entity/Reservation.Entity';
import { CrudService } from '../service/crud.service';
import { Plan } from '../Entity/Plan.Entity';

@Component({
  selector: 'app-liste-reservation-coach',
  templateUrl: './liste-reservation-coach.component.html',
  styleUrls: ['./liste-reservation-coach.component.css'],
})
export class ListeReservationCoachComponent implements OnInit {
  listePlanning: Plan[];
  p: number = 1;

  constructor(private service: CrudService, private router: Router) {
    this.listePlanning = [];
  }

  ngOnInit(): void {
    const coach = this.service.userDetails();
    console.log('Coach details:', coach);
    this.service.getPlanningC(coach.id).subscribe(
      (plannings) => {
        this.listePlanning = plannings;
        console.log('Planning list:', this.listePlanning);
      },
      (error) => {
        console.error('Error fetching planning:', error);
      }
    );
  }

  isSessionCompleted(planningDate: Date, debut: string, fin: string): string {
    const today = new Date();
    const sessionDate = new Date(planningDate);

    // Create proper time objects
    const [debutHour, debutMinute] = debut.split(':').map(Number);
    const [finHour, finMinute] = fin.split(':').map(Number);

    const debutTime = new Date(sessionDate);
    debutTime.setHours(debutHour, debutMinute, 0, 0);

    const finTime = new Date(sessionDate);
    finTime.setHours(finHour, finMinute, 0, 0);

    if (today < debutTime) {
      return 'Séance en attente';
    } else if (today >= debutTime && today <= finTime) {
      return 'Séance en cours';
    } else {
      return 'Séance terminée';
    }
  }

  getSessionStatus(
    planningDate: Date,
    debut: string,
    fin: string
  ): { status: string; icon: string; color: string } {
    const status = this.isSessionCompleted(planningDate, debut, fin);

    switch (status) {
      case 'Séance en attente':
        return { status, icon: 'fa-clock', color: 'orange' };
      case 'Séance en cours':
        return { status, icon: 'fa-play-circle', color: 'blue' };
      case 'Séance terminée':
        return { status, icon: 'fa-check-circle', color: 'green' };
      default:
        return { status, icon: 'fa-question', color: 'gray' };
    }
  }

  canContact(planningDate: Date, debut: string, fin: string): boolean {
    const status = this.isSessionCompleted(planningDate, debut, fin);
    return status === 'Séance en cours' || status === 'Séance en attente';
  }

  deletePlanning(planId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      // Assuming you have a delete method in your service
      // this.service.deletePlanning(planId).subscribe(
      //   () => {
      //     this.listePlanning = this.listePlanning.filter(plan => plan.id !== planId);
      //     console.log('Planning deleted successfully');
      //   },
      //   (error) => {
      //     console.error('Error deleting planning:', error);
      //   }
      // );
      console.log('Delete planning with ID:', planId);
    }
  }

  editPlanning(planId: number): void {
    // Navigate to edit page or open edit modal
    // this.router.navigate(['/edit-planning', planId]);
    console.log('Edit planning with ID:', planId);
  }
}
