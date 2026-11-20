import { Component } from '@angular/core';

@Component({ selector: 'app-menu', templateUrl: './menu.component.html' })
export class MenuComponent {
  readonly links = [
    { route: '/home', label: 'Tableau de bord' },
    { route: '/listeClient', label: 'Membres' },
    { route: '/listeCoach', label: 'Coachs' },
    { route: '/listeSalleDeSport', label: 'Salles de sport' },
    { route: '/listePack', label: 'Packs' },
    { route: '/listeCategory', label: 'Catégories' },
    { route: '/listeContact', label: 'Messages de contact' },
    { route: '/listeAdmin', label: 'Administrateurs' },
  ];
}
