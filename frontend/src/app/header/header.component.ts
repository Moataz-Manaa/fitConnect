import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { activeSession, clearSession } from '../service/session';

const accountLinks = {
  client: [
    { url: '/listeReservationClient', label: 'Mes réservations' },
    { url: '/listeAbonnementClient', label: 'Mes abonnements' },
  ],
  coach: [
    { url: '/listeReservationCoach', label: 'Mes séances' },
    { url: '/calendar', label: 'Mes disponibilités' },
    { url: '/mes-clients-coach', label: 'Mes clients' },
  ],
  salle: [
    { url: '/espace-salle', label: 'Espace salle' },
    { url: '/mesPacks', label: 'Mes packs' },
    { url: '/mes-clients', label: 'Mes membres' },
    { url: '/revenue', label: 'Mes revenus' },
    { url: '/ajouterPack', label: 'Ajouter un pack' },
    { url: '/mes-coach', label: 'Mes coachs' },
    { url: '/ajouter-coach', label: 'Ajouter un coach' },
  ],
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  menuOpen = false;
  accountOpen = false;

  constructor(private router: Router) {}

  get role() { return activeSession()?.role; }

  get links() {
    const role = this.role;
    return role ? accountLinks[role] : [];
  }

  closeMenus(): void {
    this.menuOpen = false;
    this.accountOpen = false;
  }

  logout(): void {
    clearSession();
    this.closeMenus();
    void this.router.navigateByUrl('/');
  }
}
