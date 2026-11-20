import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AjouterAdminComponent } from './ajouter-admin/ajouter-admin.component';
import { ListeAdminComponent } from './liste-admin/liste-admin.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionInterceptor } from './service/session.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { ModifierAdminComponent } from './modifier-admin/modifier-admin.component';
import { ListeContactComponent } from './liste-contact/liste-contact.component';
import { ListeClientComponent } from './liste-client/liste-client.component';
import { ListeSalleDeSportComponent } from './liste-salle-de-sport/liste-salle-de-sport.component';
import { ListeCoachComponent } from './liste-coach/liste-coach.component';
import { ListeCategoryComponent } from './liste-category/liste-category.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ListePackComponent } from './liste-pack/liste-pack.component';
import { ListeAbonnementClientComponent } from './liste-abonnement-client/liste-abonnement-client.component';
import { MonCompteComponent } from './mon-compte/mon-compte.component';
import { AdminShellComponent } from './management/admin-shell.component';
import { ManagementTableComponent } from './management/management-table.component';

@NgModule({
  declarations: [
    AppComponent,
    AjouterAdminComponent,
    ListeAdminComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    MenuComponent,
    FooterComponent,
    ModifierAdminComponent,
    ListeContactComponent,
    ListeClientComponent,
    ListeSalleDeSportComponent,
    ListeCoachComponent,
    ListeCategoryComponent,
    ListePackComponent,
    ListeAbonnementClientComponent,
    MonCompteComponent,
    AdminShellComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxPaginationModule,
    ManagementTableComponent,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
