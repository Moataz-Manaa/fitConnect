import { Component, OnInit } from '@angular/core';
import { Client } from '../Entity/Client.Entity';
import { CrudService } from '../service/crud.service';
import { ClientSubscription } from '../Entity/ClientSubscription.Entity';

@Component({
  selector: 'app-salle-clients',
  templateUrl: './salle-clients.component.html',
  styleUrls: ['./salle-clients.component.css'],
})
export class SalleClientsComponent implements OnInit {
  clientSubscriptions: ClientSubscription[] = [];
  errorMessage: string | null = null;
  p: number = 1;

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.crudService.getMyClients().subscribe({
      next: (clientSubscriptions) => {
        this.clientSubscriptions = clientSubscriptions;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load clients: ' + err.message;
        this.clientSubscriptions = [];
      },
    });
  }

  // Helper method to format date
  formatDate(date: Date): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  // Calculate expiration date (30 days from activation)
  getExpirationDate(dateActivation: Date): Date {
    if (!dateActivation) return new Date();
    const activationDate = new Date(dateActivation);
    const expirationDate = new Date(activationDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    return expirationDate;
  }

  // Get status badge class based on subscription state
  getStatusClass(etat: string): string {
    switch (etat) {
      case 'actif':
        return 'badge badge-success';
      case 'inactif':
        return 'badge badge-danger';
      case 'en_attente':
        return 'badge badge-warning';
      default:
        return 'badge badge-secondary';
    }
  }

  // Get status text in French
  getStatusText(etat: string): string {
    switch (etat) {
      case 'actif':
        return 'Actif';
      case 'inactif':
        return 'Inactif';
      case 'en_attente':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  }
}
