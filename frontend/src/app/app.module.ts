import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterClientComponent } from './register-client/register-client.component';
import { LoginClientComponent } from './login-client/login-client.component';
import { RegisterSalleDeSportComponent } from './register-salle-de-sport/register-salle-de-sport.component';
import { LoginSalleDeSportComponent } from './login-salle-de-sport/login-salle-de-sport.component';
import { LoginCoachComponent } from './login-coach/login-coach.component';
import { RegisterCoachComponent } from './register-coach/register-coach.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AjouterPackComponent } from './ajouter-pack/ajouter-pack.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { BmiComponent } from './bmi/bmi.component';
import { PackComponent } from './pack/pack.component';
import { MyPacksComponent } from './my-packs/my-packs.component';
import { EditPackComponent } from './edit-pack/edit-pack.component';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';
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
import { PlanComponent } from './plan/plan.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { NgChartsModule } from 'ng2-charts';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarComponent } from './calendar/calendar.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { SalleClientsComponent } from './salle-clients/salle-clients.component';
import { CoachClientsComponent } from './coach-clients/coach-clients.component';
import { RevenueComponent } from './revenue/revenue.component';
import { EnTantQueComponent } from './en-tant-que/en-tant-que.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SeanceClientComponent } from './seance-client/seance-client.component';
import { ListeReservationClientComponent } from './liste-reservation-client/liste-reservation-client.component';
import { ListeAbonnementClientComponent } from './liste-abonnement-client/liste-abonnement-client.component';
import { ListeReservationCoachComponent } from './liste-reservation-coach/liste-reservation-coach.component';
import { PlanningSalleComponent } from './planning-salle/planning-salle.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    RegisterClientComponent,
    LoginClientComponent,
    RegisterSalleDeSportComponent,
    LoginSalleDeSportComponent,
    LoginCoachComponent,
    RegisterCoachComponent,
    HeaderComponent,
    FooterComponent,
    AjouterPackComponent,
    ResetPasswordComponent,
    BmiComponent,
    PackComponent,
    MyPacksComponent,
    EditPackComponent,
    EditProfileComponent,
    PackDetailComponent,
    AjouterCoachComponent,
    ListeCoachComponent,
    EditCoachComponent,
    ListeSalleComponent,
    SalleDetailComponent,
    PaymentComponent,
    CoachComponent,
    CoachDetailComponent,
    PlanComponent,
    CalendarComponent,
    VideoCallComponent,
    SalleClientsComponent,
    CoachClientsComponent,
    RevenueComponent,
    EnTantQueComponent,
    SeanceClientComponent,
    ListeReservationClientComponent,
    ListeAbonnementClientComponent,
    ListeReservationCoachComponent,
    PlanningSalleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SocialLoginModule,
    NgxPaginationModule,
    NgChartsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '46828070655-9cof32efubaq0sj90u5ntlqcj7eafc7q.apps.googleusercontent.com'
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
