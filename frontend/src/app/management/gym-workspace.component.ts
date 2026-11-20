import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../layout.module';
import { WorkspaceNavComponent } from './workspace-nav.component';

@Component({
  standalone: true,
  imports: [RouterModule, LayoutModule, WorkspaceNavComponent],
  template: `
    <app-header></app-header>
    <main class="fc-page fc-wrap fc-section">
      <header class="fc-page-heading"><h1>Espace salle</h1><p>Gérez les offres, les abonnements et l’activité de votre salle.</p></header>
      <app-workspace-nav role="salle"></app-workspace-nav>
      <div class="fc-grid">
        <section class="fc-card fc-card-body">
          <h2>Packs</h2>
          <p class="fc-muted">Consultez vos offres et publiez de nouveaux abonnements.</p>
          <div class="fc-actions">
            <a class="fc-button fc-button-primary" routerLink="/mesPacks">Gérer les packs</a>
            <a class="fc-text-link" routerLink="/ajouterPack">Ajouter un pack</a>
          </div>
        </section>
        <section class="fc-card fc-card-body">
          <h2>Membres</h2>
          <p class="fc-muted">Retrouvez les coordonnées de vos membres et les dates de leurs abonnements.</p>
          <a class="fc-button fc-button-outline" routerLink="/mes-clients">Voir les membres</a>
        </section>
        <section class="fc-card fc-card-body">
          <h2>Revenus</h2>
          <p class="fc-muted">Consultez vos revenus par année, par mois et par pack.</p>
          <a class="fc-button fc-button-outline" routerLink="/revenue">Voir les revenus</a>
        </section>
      </div>
      <section class="fc-block fc-card fc-list-row">
        <div><h2>Équipe de la salle</h2><p class="fc-muted">Mettez à jour les profils des coachs de votre salle.</p></div>
        <a class="fc-button fc-button-outline" routerLink="/mes-coach">Gérer l’équipe</a>
      </section>
    </main>
    <app-footer></app-footer>
  `,
})
export class GymWorkspaceComponent {}
