import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { ListePackComponent } from './liste-pack/liste-pack.component';
import { MonCompteComponent } from './mon-compte/mon-compte.component';

const routes: Routes = [
  { path: '', component: AjouterAdminComponent, canActivate: [AuthGuard] },
  {
    path: 'listeAdmin',
    component: ListeAdminComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'modifierAdmin/:id',
    component: ModifierAdminComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'listeContact',
    component: ListeContactComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'listeClient',
    component: ListeClientComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'listeSalleDeSport',
    component: ListeSalleDeSportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'listeCoach',
    component: ListeCoachComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'listeCategory',
    component: ListeCategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'listePack',
    component: ListePackComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'mon-compte',
    component: MonCompteComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
