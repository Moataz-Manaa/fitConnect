import { Component, OnInit } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';
import { Reservation } from '../Entity/Reservation.Entity';

@Component({
  selector: 'app-liste-reservation-client',
  templateUrl: './liste-reservation-client.component.html',
  styleUrls: ['./liste-reservation-client.component.css'],
})
export class ListeReservationClientComponent implements OnInit {
  listeReseravtion: Reservation[] = []; // Initialize as empty array
  error: string = '';
  loading: boolean = true;

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    try {
      const userDetails = this.service.userDetails();

      if (!userDetails || !userDetails.id) {
        console.error('User details not found or missing ID');
        this.error = 'Unable to load user details. Please log in again.';
        this.loading = false;
        return;
      }

      console.log('Loading reservations for client ID:', userDetails.id);

      this.service.getReservationByIdclient(userDetails.id).subscribe(
        (reservations) => {
          console.log('API Response (Reservations):', reservations);

          if (!reservations || reservations.length === 0) {
            console.log('No reservations found for this client');
            this.listeReseravtion = [];
            this.loading = false;
            return;
          }

          // Filter out invalid reservations
          this.listeReseravtion = reservations.filter((reservation) => {
            if (!reservation) {
              console.log('Found null/undefined reservation');
              return false;
            }

            // Check if plan exists and has required properties
            if (!reservation.plan) {
              console.log('Reservation missing plan:', reservation);
              return false;
            }

            // Validate plan date and time properties
            if (
              !reservation.plan.date ||
              !reservation.plan.debut ||
              !reservation.plan.fin
            ) {
              console.log('Plan missing date or time info:', reservation.plan);
              return false;
            }

            return true;
          });

          console.log('Processed reservations:', this.listeReseravtion);
          this.loading = false;
        },
        (error) => {
          console.error('Error loading reservations:', error);
          this.error = 'Failed to load reservations. Please try again later.';
          this.loading = false;
        }
      );
    } catch (err) {
      console.error('Exception in loadReservations:', err);
      this.error = 'An unexpected error occurred. Please try again.';
      this.loading = false;
    }
  }

  isSessionCompleted(planningDate: Date, debut: string, fin: string): string {
    try {
      const today = new Date();
      console.log('Checking session status for:', { planningDate, debut, fin });

      // Ensure we're working with a proper date object
      let sessionDate: Date;
      if (planningDate instanceof Date) {
        sessionDate = new Date(planningDate);
      } else {
        sessionDate = new Date(planningDate);
      }

      // Check if the date is valid
      if (isNaN(sessionDate.getTime())) {
        console.error('Invalid date format:', planningDate);
        return 'Statut inconnu';
      }

      // Parse time values properly
      let startHours = 0,
        startMinutes = 0;
      let endHours = 0,
        endMinutes = 0;

      // Handle different time formats (HH:MM or just HH)
      if (typeof debut === 'string' && debut.includes(':')) {
        const [hours, minutes] = debut.split(':').map(Number);
        startHours = hours || 0;
        startMinutes = minutes || 0;
      } else if (typeof debut === 'string') {
        startHours = parseInt(debut, 10) || 0;
      } else if (typeof debut === 'number') {
        startHours = debut;
      }

      if (typeof fin === 'string' && fin.includes(':')) {
        const [hours, minutes] = fin.split(':').map(Number);
        endHours = hours || 0;
        endMinutes = minutes || 0;
      } else if (typeof fin === 'string') {
        endHours = parseInt(fin, 10) || 0;
      } else if (typeof fin === 'number') {
        endHours = fin;
      }

      // Create proper Date objects for start and end times
      const debutTime = new Date(sessionDate);
      debutTime.setHours(startHours, startMinutes, 0, 0);

      const finTime = new Date(sessionDate);
      finTime.setHours(endHours, endMinutes, 0, 0);

      console.log('Computed times:', {
        today: today.toISOString(),
        debutTime: debutTime.toISOString(),
        finTime: finTime.toISOString(),
      });

      // Determine session status
      if (today < debutTime) {
        return 'Séance en attente';
      } else if (today >= debutTime && today <= finTime) {
        return 'Séance en cours';
      } else {
        return 'Séance terminée';
      }
    } catch (err) {
      console.error('Error calculating session status:', err);
      return 'Statut inconnu';
    }
  }
}
