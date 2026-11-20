import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

const workspaceLinks = {
  coach: [
    { url: '/listeReservationCoach', label: 'Mes séances' },
    { url: '/calendar', label: 'Disponibilités' },
    { url: '/mes-clients-coach', label: 'Mes clients' },
  ],
  salle: [
    { url: '/espace-salle', label: 'Vue d’ensemble' },
    { url: '/mesPacks', label: 'Packs' },
    { url: '/mes-clients', label: 'Membres' },
    { url: '/revenue', label: 'Revenus' },
    { url: '/mes-coach', label: 'Équipe' },
  ],
};

@Component({
  selector: 'app-workspace-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fc-workspace-nav" [attr.aria-label]="role === 'coach' ? 'Espace coach' : 'Espace salle'">
      <a *ngFor="let link of links" [routerLink]="link.url" routerLinkActive="fc-workspace-current"
        ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: true }">{{ link.label }}</a>
    </nav>
  `,
})
export class WorkspaceNavComponent {
  @Input() role: 'coach' | 'salle' = 'coach';
  get links() { return workspaceLinks[this.role]; }
}
