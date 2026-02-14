import { Component, OnInit } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liste-abonnement-client',
  templateUrl: './liste-abonnement-client.component.html',
  styleUrls: ['./liste-abonnement-client.component.css'],
})
export class ListeAbonnementClientComponent implements OnInit {
  p: number = 1;
  listeAbonnements: any[] = [];
  clientId: number | null = null;
  errorMessage: string = '';
  renewalMessage: string = '';
  renewalFormMessage: string = '';
  isRenewing: boolean = false;
  isProcessingPayment: boolean = false;
  selectedAbonnement: any = null;
  showRenewalForm: boolean = false;
  paymentHandler: any = null;

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.loadClientIdFromToken();
    if (this.clientId) {
      this.loadAbonnements();
    } else {
      this.errorMessage = 'No client ID found. Please log in.';
    }
    this.invokeStripe(); // Initialize Stripe for payments
  }

  private loadClientIdFromToken(): void {
    const token = localStorage.getItem('myTokenClient');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.clientId = decoded.data.id;
        console.log('Decoded clientId:', this.clientId);
      } catch (error) {
        console.error('Error decoding token:', error);
        this.errorMessage = 'Error decoding token. Please log in again.';
      }
    } else {
      console.error('No token found in localStorage');
      this.errorMessage = 'No token found. Please log in.';
    }
  }

  private loadAbonnements(): void {
    if (this.clientId) {
      this.service.getAbonnementsByClientId(this.clientId).subscribe({
        next: (data: any[]) => {
          this.listeAbonnements = data;
          console.log('Abonnements:', data);
        },
        error: (err) => {
          console.error('Error fetching abonnements:', err);
          this.errorMessage = 'Error loading abonnements. Please try again.';
        },
      });
    }
  }

  // Calculate expiration date (30 days from activation)
  getExpirationDate(dateActivation: string): Date {
    const activationDate = new Date(dateActivation);
    const expirationDate = new Date(activationDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    return expirationDate;
  }

  // Calculate new expiration date for renewal (60 days from original activation)
  getNewExpirationDate(dateActivation: string): Date {
    const activationDate = new Date(dateActivation);
    const newExpirationDate = new Date(activationDate);
    newExpirationDate.setDate(newExpirationDate.getDate() + 60);
    return newExpirationDate;
  }

  // Initialize Stripe
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
            this.handleRenewalPaymentSuccess(stripeToken); // Handle renewal payment success
          },
        });
      };
      window.document.body.appendChild(script);
    }
  }

  // Show renewal form (similar to pack detail)
  renouvelerAbonnement(abonnement: any): void {
    this.selectedAbonnement = abonnement;
    this.showRenewalForm = true;
    this.renewalFormMessage = '';
  }

  // Cancel renewal and hide form
  cancelRenewal(): void {
    this.showRenewalForm = false;
    this.selectedAbonnement = null;
    this.renewalFormMessage = '';
    this.isProcessingPayment = false;
  }

  // Process renewal payment (similar to pack detail reserver method)
  processRenewalPayment(): void {
    if (!this.selectedAbonnement) return;

    this.renewalFormMessage = `<div class="alert alert-primary" role="alert">
      Veuillez patienter pendant que nous traitons votre paiement...
    </div>`;

    this.isProcessingPayment = true;

    // Open Stripe Checkout (same as pack detail component)
    if (this.paymentHandler) {
      this.paymentHandler.open({
        name: `Renouvellement - ${this.selectedAbonnement.pack.nom}`,
        description: `${this.selectedAbonnement.pack.salle.nom} - Renouvellement abonnement`,
        amount: this.selectedAbonnement.prix * 100, // Convert to cents for Stripe
        currency: 'usd',
      });
    } else {
      this.isProcessingPayment = false;
      this.renewalFormMessage = `<div class="alert alert-danger" role="alert">
        Erreur: Stripe non initialisé. Veuillez réessayer.
      </div>`;
      setTimeout(() => {
        this.renewalFormMessage = '';
      }, 3000);
    }
  }

  // Handle successful payment (similar to pack detail handlePaymentSuccess)
  handleRenewalPaymentSuccess(stripeToken: any): void {
    if (!this.selectedAbonnement) return;

    // Calculate the new activation date (when current subscription expires)
    const newActivationDate = this.getExpirationDate(
      this.selectedAbonnement.dateActivation
    );

    const renewalRequest = {
      idClient: this.clientId,
      idPack: this.selectedAbonnement.pack.id,
      paymentDate: new Date(),
      prix: this.selectedAbonnement.prix,
      dateActivation: newActivationDate,
    };

    console.log('Renewal Request:', renewalRequest);

    this.service.reserverFromApi(renewalRequest).subscribe({
      next: (data: any) => {
        this.isProcessingPayment = false;
        const renewalId = data.id;

        this.renewalFormMessage = `<div class="alert alert-success" role="alert">
          <i class="fa fa-check-circle"></i> 
          Renouvellement effectué avec succès! Paiement confirmé.
        </div>`;

        // Redirect to invoice page (similar to pack detail)
        setTimeout(() => {
          this.router.navigate([`/facture/${renewalId}`]);
        }, 2000);

        // Refresh the subscriptions list
        this.loadAbonnements();
      },
      error: (err) => {
        console.error('Error processing renewal:', err);
        this.isProcessingPayment = false;
        this.renewalFormMessage = `<div class="alert alert-danger" role="alert">
          <i class="fa fa-exclamation-triangle"></i>
          Erreur lors du renouvellement. Veuillez réessayer.
        </div>`;

        setTimeout(() => {
          this.renewalFormMessage = '';
        }, 5000);
      },
    });
  }
}
