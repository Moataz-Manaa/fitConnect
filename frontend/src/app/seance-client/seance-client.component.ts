import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Plan } from '../Entity/Plan.Entity';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seance-client',
  templateUrl: './seance-client.component.html',
  styleUrls: ['./seance-client.component.css'],
})
export class SeanceClientComponent implements OnInit {
  listeplanningC: Plan[] = [];
  p: number = 1;
  collection: any[];
  id: number;
  messageCommande: string = '';
  paymentHandler: any = null;

  constructor(
    private service: CrudService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let idEvent = this.route.snapshot.params['id'];
    this.id = idEvent;
    console.log('Coach ID:', this.id);
    this.loadPlanningC();
    this.invokeStripe(); // Initialize Stripe
  }

  invokeStripe() {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement('script');
      script.id = 'stripe-script';
      script.type = 'text/javascript';
      script.src = 'https://checkout.stripe.com/checkout.js';
      script.onload = () => {
        this.paymentHandler = (<any>window).StripeCheckout.configure({
          key: 'pk_test_51ORfw8CGCz5RXlZeoe3XDe37HmmqpZVdoHzeTdv6BwUbc2FN7TshEC3TQJeGrDQPE1oBRYJHeXUPDPqoUvwRZsAb00g0HXBiwp',
          locale: 'auto',
          token: (stripeToken: any) => {
            console.log('Stripe Token:', stripeToken);
            // Pass the planning ID to handlePaymentSuccess
            const planning = this.listeplanningC.find(
              (p) => p.id === this.currentPlanningId
            );
            if (planning) {
              this.handlePaymentSuccess(stripeToken, planning);
            }
          },
        });
      };
      window.document.body.appendChild(script);
    }
  }

  // Store the current planning ID for payment processing
  private currentPlanningId: number;

  confirmReservation(idPlanningC: number) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Voulez-vous réserver cette séance?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, réserver!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.currentPlanningId = idPlanningC; // Store the planning ID
        this.reserver(idPlanningC);
      }
    });
  }

  reserver(idPlanningC: number) {
    this.messageCommande = `<div class="alert alert-primary" role="alert">
      Veuillez patienter ...
    </div>`;

    let datas = this.service.userDetails();
    if (!datas) {
      this.connexion();
      return;
    }

    // Find the planning details for session info
    const planning = this.listeplanningC.find((p) => p.id === idPlanningC);
    if (!planning) {
      this.messageCommande = `<div class="alert alert-warning" role="alert">
        Erreur: Séance non trouvée. Veuillez réessayer.
      </div>`;
      setTimeout(() => {
        this.messageCommande = '';
      }, 3000);
      return;
    }

    // Open Stripe Checkout with hardcoded amount for testing
    if (this.paymentHandler) {
      this.paymentHandler.open({
        name: planning.category.nom,
        description: `Réservation pour la séance du ${planning.date}`,
        amount: 1000, // Hardcoded to $10.00 (1000 cents) for testing
        currency: 'usd', // Adjust currency as needed
      });
    } else {
      this.messageCommande = `<div class="alert alert-warning" role="alert">
        Erreur: Stripe non initialisé. Veuillez réessayer.
      </div>`;
      setTimeout(() => {
        this.messageCommande = '';
      }, 3000);
    }
  }

  handlePaymentSuccess(stripeToken: any, planning: Plan) {
    let rq: any = {
      idPlan: planning.id,
      idClient: this.service.userDetails()?.id,
      paymentDate: new Date(), // Set payment date
    };

    console.log('Reservation Request:', rq);

    this.service.reserverseanceFromApi(rq).subscribe(
      (data: any) => {
        this.messageCommande = `<div class="alert alert-success" role="alert">
          Réservé avec succès! Paiement effectué.
        </div>`;
        Swal.fire({
          icon: 'success',
          title: 'Félicitations !',
          text: 'Réservé avec succès',
        });
        // Optionally redirect to a confirmation page
        this.router.navigate([`/facture/${data.id}`]); // Adjust route as needed
      },
      (error: any) => {
        this.messageCommande = `<div class="alert alert-warning" role="alert">
          Erreur lors de la réservation. Veuillez réessayer.
        </div>`;
        if (error.status === 409) {
          if (error.error === 'Client has already reserved this planning.') {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Vous avez déjà réservé ce planning !',
            });
          } else if (
            error.error ===
            'This planning has already been reserved the maximum number of times.'
          ) {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Ce planning a atteint sa capacité maximale de réservations !',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Problème de serveur',
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Problème de serveur',
          });
        }
        setTimeout(() => {
          this.messageCommande = '';
        }, 3000);
      }
    );
  }

  connexion() {
    this.router.navigate(['/loginclient']).then(() => {
      window.location.reload();
    });
  }

  loadPlanningC(): void {
    this.service.getPlanningC(this.id).subscribe(
      (data) => {
        console.log('API Response:', data);
        if (!data || data.length === 0) {
          console.log('No planning data received');
          return;
        }

        const currentTime = new Date();
        const today = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate()
        );

        this.listeplanningC = data.filter((planning) => {
          if (!planning || !planning.date) {
            console.log('Invalid planning entry:', planning);
            return false;
          }

          const sessionDate = new Date(planning.date);
          if (isNaN(sessionDate.getTime())) {
            console.log('Invalid date format:', planning.date);
            return false;
          }

          const sessionDateOnly = new Date(
            sessionDate.getFullYear(),
            sessionDate.getMonth(),
            sessionDate.getDate()
          );

          if (sessionDateOnly.getTime() < today.getTime()) {
            console.log('Filtering out past session:', planning);
            return false;
          }

          if (sessionDateOnly.getTime() === today.getTime()) {
            const debutTime = new Date(sessionDate);
            let hours = 0,
              minutes = 0;
            if (typeof planning.debut === 'string') {
              const timeParts = planning.debut.split(':');
              hours = parseInt(timeParts[0], 10) || 0;
              minutes = parseInt(timeParts[1], 10) || 0;
            } else if (typeof planning.debut === 'number') {
              hours = planning.debut;
            }
            debutTime.setHours(hours, minutes, 0, 0);

            if (currentTime.getTime() >= debutTime.getTime()) {
              console.log('Filtering out session in progress:', planning);
              return false;
            }
          }

          if (!planning.category || !planning.category.nom) {
            console.log('Planning has no category or category name:', planning);
            return false;
          }

          console.log('Including planning:', planning);
          return true;
        });

        console.log('Final filtered listeplanningC:', this.listeplanningC);
      },
      (error) => {
        console.error('Error loading planning data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les séances. Veuillez réessayer plus tard.',
        });
      }
    );
  }
}
