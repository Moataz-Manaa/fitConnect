import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-pack-detail',
  templateUrl: './pack-detail.component.html',
  styleUrls: ['./pack-detail.component.css'],
})
export class PackDetailComponent {
  messageCommande: string = '';
  pack: any = {};
  paymentHandler: any = null;
  dateActivation: string | null = null; // Store dateActivation as string (from input)

  constructor(
    private service: CrudService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getPack();
    this.invokeStripe(); // Initialize Stripe
  }

  getPack() {
    let id = this.activateRoute.snapshot.params['id'];
    this.service.getPackByIdApi(id).subscribe((data: any) => {
      this.pack = data;
      console.log(data);
    });
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
            this.handlePaymentSuccess(stripeToken); // Process reservation after payment
          },
        });
      };
      window.document.body.appendChild(script);
    }
  }

  // Optional: Validate or log date change
  onDateChange() {
    if (this.dateActivation) {
      const selectedDate = new Date(this.dateActivation);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight
      if (selectedDate < today) {
        this.messageCommande = `<div class="alert alert-warning" role="alert">
        La date d'activation ne peut pas être dans le passé.
      </div>`;
        this.dateActivation = null; // Reset invalid date
        setTimeout(() => {
          this.messageCommande = '';
        }, 3000);
      } else {
        console.log('Selected Activation Date:', this.dateActivation);
      }
    }
  }
  reserver(event: any) {
    this.messageCommande = `<div class="alert alert-primary" role="alert">
      Veuillez patienter ...
    </div>`;

    // Validate dateActivation
    if (!this.dateActivation) {
      this.messageCommande = `<div class="alert alert-warning" role="alert">
        Veuillez sélectionner une date d'activation.
      </div>`;
      setTimeout(() => {
        this.messageCommande = '';
      }, 3000);
      return;
    }

    // Open Stripe Checkout
    if (this.paymentHandler) {
      this.paymentHandler.open({
        name: this.pack.nom,
        description: this.pack.description,
        amount: this.pack.prix * 100, // Convert to cents for Stripe
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

  handlePaymentSuccess(stripeToken: any) {
    const rq: any = {
      idClient: this.service.userDetails()?.id,
      idPack: this.pack.id,
      paymentDate: new Date(), // Set payment date
      prix: this.pack.prix, // Include the pack's prix
      dateActivation: this.dateActivation
        ? new Date(this.dateActivation)
        : new Date(), // Include dateActivation
    };

    console.log('Reservation Request:', rq);

    this.service.reserverFromApi(rq).subscribe(
      (data: any) => {
        const id = data.id;
        this.messageCommande = `<div class="alert alert-success" role="alert">
          Réservé avec succès! Paiement effectué.
        </div>`;
        this.router.navigate([`/facture/${id}`]);
      },
      (err) => {
        this.messageCommande = `<div class="alert alert-warning" role="alert">
          Erreur lors de la réservation. Veuillez réessayer.
        </div>`;
      }
    );

    setTimeout(() => {
      this.messageCommande = '';
    }, 3000);
  }
}
