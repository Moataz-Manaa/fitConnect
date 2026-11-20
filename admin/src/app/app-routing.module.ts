import { NgModule, inject } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { AjouterAdminComponent } from './ajouter-admin/ajouter-admin.component';
import { ListeAdminComponent } from './liste-admin/liste-admin.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ModifierAdminComponent } from './modifier-admin/modifier-admin.component';
import { ListeContactComponent } from './liste-contact/liste-contact.component';
import { ListeClientComponent } from './liste-client/liste-client.component';
import { ListeSalleDeSportComponent } from './liste-salle-de-sport/liste-salle-de-sport.component';
import { ListeCoachComponent } from './liste-coach/liste-coach.component';
import { ListeCategoryComponent } from './liste-category/liste-category.component';
import { AuthGuard } from './service/Auth.Service';
import { isSuperAdmin } from './service/session';
import { ListePackComponent } from './liste-pack/liste-pack.component';
import { MonCompteComponent } from './mon-compte/mon-compte.component';
import { AdminShellComponent } from './management/admin-shell.component';

const requireSuperAdmin = () => isSuperAdmin() || inject(Router).createUrlTree(['/listeAdmin']);

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminShellComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent },
      { path: 'ajouter-admin', component: AjouterAdminComponent, canActivate: [requireSuperAdmin] },
      { path: 'modifierAdmin/:id', component: ModifierAdminComponent, canActivate: [requireSuperAdmin] },
      { path: 'listeAdmin', component: ListeAdminComponent },
      { path: 'listeContact', component: ListeContactComponent },
      { path: 'listeClient', component: ListeClientComponent },
      { path: 'listeSalleDeSport', component: ListeSalleDeSportComponent },
      { path: 'listeCoach', component: ListeCoachComponent },
      { path: 'listeCategory', component: ListeCategoryComponent },
      { path: 'listePack', component: ListePackComponent },
      { path: 'mon-compte', component: MonCompteComponent },
    ],
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
