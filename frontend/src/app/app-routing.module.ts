import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { RegisterClientComponent } from './register-client/register-client.component';
import { LoginClientComponent } from './login-client/login-client.component';
import { RegisterSalleDeSportComponent } from './register-salle-de-sport/register-salle-de-sport.component';
import { LoginSalleDeSportComponent } from './login-salle-de-sport/login-salle-de-sport.component';
import { RegisterCoachComponent } from './register-coach/register-coach.component';
import { LoginCoachComponent } from './login-coach/login-coach.component';
import { AjouterPackComponent } from './ajouter-pack/ajouter-pack.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { BmiComponent } from './bmi/bmi.component';
import { PackComponent } from './pack/pack.component';
import { MyPacksComponent } from './my-packs/my-packs.component';
import { EditPackComponent } from './edit-pack/edit-pack.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { PackDetailComponent } from './pack-detail/pack-detail.component';
import { AjouterCoachComponent } from './ajouter-coach/ajouter-coach.component';
import { ListeCoachComponent } from './liste-coach/liste-coach.component';
import { EditCoachComponent } from './edit-coach/edit-coach.component';
import { ListeSalleComponent } from './liste-salle/liste-salle.component';
import { SalleDetailComponent } from './salle-detail/salle-detail.component';
import { PaymentComponent } from './payment/payment.component';
import { CoachComponent } from './coach/coach.component';
import { CoachDetailComponent } from './coach-detail/coach-detail.component';
import { CalendarComponent } from './calendar/calendar.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { SalleClientsComponent } from './salle-clients/salle-clients.component';
import { CoachClientsComponent } from './coach-clients/coach-clients.component';
import { SeanceClientComponent } from './seance-client/seance-client.component';
import { ListeReservationClientComponent } from './liste-reservation-client/liste-reservation-client.component';
import { ListeAbonnementClientComponent } from './liste-abonnement-client/liste-abonnement-client.component';
import { ListeReservationCoachComponent } from './liste-reservation-coach/liste-reservation-coach.component';
import { AuthGuard } from './service/auth.service.service';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'registerClient', component: RegisterClientComponent },
  { path: 'loginClient', component: LoginClientComponent },
  { path: 'registerSalleDeSport', component: RegisterSalleDeSportComponent },
  { path: 'loginSalleDeSport', component: LoginSalleDeSportComponent },
  { path: 'registerCoach', component: RegisterCoachComponent },
  { path: 'loginCoach', component: LoginCoachComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  // Client-specific routes
  {
    path: 'bmi',
    component: BmiComponent,
  },
  {
    path: 'packs',
    component: PackComponent,
  },
  {
    path: 'detail/:id',
    component: PackDetailComponent,
  },
  {
    path: 'checkout/:id',
    component: PaymentComponent,
  },
  {
    path: 'seance/:id',
    component: SeanceClientComponent,
  },
  {
    path: 'listeReservationClient',
    component: ListeReservationClientComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client'] },
  },
  {
    path: 'listeAbonnementClient',
    component: ListeAbonnementClientComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client'] },
  },
  // Coach-specific routes
  {
    path: 'coach',
    component: CoachComponent,
  },
  {
    path: 'detail-coach/:id',
    component: CoachDetailComponent,
  },
  {
    path: 'mes-clients-coach',
    component: CoachClientsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['coach'] },
  },
  {
    path: 'listeReservationCoach',
    component: ListeReservationCoachComponent,
    canActivate: [AuthGuard],
    data: { roles: ['coach'] },
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [AuthGuard],
    data: { roles: ['coach'] },
  },
  // Salle-specific routes
  {
    path: 'espace-salle',
    loadComponent: () => import('./management/gym-workspace.component').then(module => module.GymWorkspaceComponent),
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'ajouterPack',
    component: AjouterPackComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'mesPacks',
    component: MyPacksComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'edit-pack/:id',
    component: EditPackComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'ajouter-coach',
    component: AjouterCoachComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'mes-coach',
    component: ListeCoachComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'edit-coch/:id',
    component: EditCoachComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'liste-salle',
    component: ListeSalleComponent,
  },
  {
    path: 'detail-salle/:id',
    component: SalleDetailComponent,
  },
  {
    path: 'mes-clients',
    component: SalleClientsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  {
    path: 'revenue',
    loadComponent: () =>
      import('./revenue/revenue.component').then(({ RevenueComponent }) => RevenueComponent),
    canActivate: [AuthGuard],
    data: { roles: ['salle'] },
  },
  // Shared routes
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client', 'coach', 'salle'] },
  },
  {
    path: 'call',
    component: VideoCallComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client', 'coach'] },
  },
  {
    path: 'call/:planningId',
    component: VideoCallComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client', 'coach'] },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
