import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Contact } from '../Entity/Contact.Entity';
import { Client } from '../Entity/Client.Entity';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { Coach } from '../Entity/Coach.Entity';
import { catchError, Observable, tap } from 'rxjs';
import { Category } from '../Entity/Category.Entity';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Pack } from '../Entity/Pack.Entity';
import { SavePack } from '../Entity/SavePack.Entity';
import { SaveCoach } from '../Entity/SaveCoach.Entity';
import { CoachSalle } from '../Entity/CoachSalle.Entity';
import { Plan } from '../Entity/Plan.Entity';
import { ClientSubscription } from '../Entity/ClientSubscription.Entity';
import { Reservation } from '../Entity/Reservation.Entity';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  helper = new JwtHelperService();
  apiUrl = 'http://localhost:8081/api';
  loginClientUrl = 'http://localhost:8081/api/client/login';
  loginGymtUrl = 'http://localhost:8081/api/salleDeSport/login';
  loginCoachUrl = 'http://localhost:8081/api/coach/login';
  GoogleUrl = 'http://localhost:8081/api/client/login-google';

  // Use getters and setters for token properties
  get myTokenCoach(): string | null {
    return localStorage.getItem('myTokenCoach');
  }

  set myTokenCoach(value: string | null) {
    if (value) {
      localStorage.setItem('myTokenCoach', value);
    }
  }

  get myTokenSalle(): string | null {
    return localStorage.getItem('myTokenSalle');
  }

  set myTokenSalle(value: string | null) {
    if (value) {
      localStorage.setItem('myTokenSalle', value);
    }
  }

  get myTokenClient(): string | null {
    return localStorage.getItem('myTokenClient');
  }

  set myTokenClient(value: string | null) {
    if (value) {
      localStorage.setItem('myTokenClient', value);
    }
  }

  constructor(private http: HttpClient) {}

  submitContact(contact: Contact) {
    return this.http.post<any>(this.apiUrl + '/contact', contact);
  }

  registerClient(client: Client) {
    return this.http.post<any>(this.apiUrl + '/client', client);
  }

  loginClient(client: Client) {
    return this.http.post<any>(this.loginClientUrl, client);
  }

  registerSalleDeSport(salleDeSport: SalleDeSport) {
    return this.http.post<any>(this.apiUrl + '/salleDeSport', salleDeSport);
  }

  loginSalleDeSport(salleDeSport: SalleDeSport) {
    return this.http.post<any>(this.loginGymtUrl, salleDeSport);
  }

  registerCoach(coach: Coach) {
    return this.http.post<any>(this.apiUrl + '/coach', coach);
  }

  loginCoach(coach: Coach) {
    return this.http.post<any>(this.loginCoachUrl, coach);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/client/forgot-password?email=${email}`,
      {},
      { responseType: 'text' }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    const url = `${this.apiUrl}/client/reset-password?token=${token}&newPassword=${newPassword}`;
    return this.http.post(url, {}, { responseType: 'text' });
  }

  getCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/category');
  }

  addPack(savePack: SavePack) {
    return this.http.post<any>(this.apiUrl + '/pack', savePack);
  }

  getPacks(): Observable<Pack[]> {
    return this.http.get<Pack[]>(this.apiUrl + '/pack');
  }

  getMyPacks(): Observable<Pack[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.myTokenSalle}`,
    });

    return this.http.get<Pack[]>(`${this.apiUrl}/pack/my-packs`, { headers });
  }

  deletePack(id: number): Observable<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.myTokenSalle}`,
    });

    return this.http.delete(`${this.apiUrl}/pack/${id}`, {
      headers,
      responseType: 'text',
    });
  }

  updatePack(id: number, pack: SavePack): Observable<Pack> {
    return this.http.put<Pack>(`${this.apiUrl}/pack/${id}`, pack);
  }

  isCoachIn() {
    return !!this.myTokenCoach;
  }

  isSalleIn() {
    return !!this.myTokenSalle;
  }

  isClientIn() {
    return !!this.myTokenClient;
  }

  userDetails() {
    let token: string | null = null;

    if (this.isClientIn()) {
      token = this.myTokenClient;
    } else if (this.isSalleIn()) {
      token = this.myTokenSalle;
    } else if (this.isCoachIn()) {
      token = this.myTokenCoach;
    }

    if (token) {
      let decodeToken = this.helper.decodeToken(token);
      return decodeToken.data;
    }
    return null;
  }

  // Get user data by ID
  getClientById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/${id}`);
  }

  // Get coach by ID
  getCoachById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/coach/${id}`);
  }

  // Get salle by ID
  getSalleById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/salleDeSport/${id}`);
  }

  updateClient(
    id: number,
    clientData: any,
    currentPassword?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (currentPassword) {
      params = params.set('currentPassword', currentPassword);
    }

    return this.http.put(`${this.apiUrl}/client/edit/${id}`, clientData, {
      params,
    });
  }

  // Update coach profile
  updateCoach(
    id: number,
    coachData: any,
    currentPassword?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (currentPassword) {
      params = params.set('currentPassword', currentPassword);
    }

    return this.http.put(`${this.apiUrl}/coach/edit/${id}`, coachData, {
      params,
    });
  }

  // Update salle profile
  updateSalle(
    id: number,
    salleData: any,
    currentPassword?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (currentPassword) {
      params = params.set('currentPassword', currentPassword);
    }

    return this.http.put(`${this.apiUrl}/salleDeSport/edit/${id}`, salleData, {
      params,
    });
  }

  reserverFromApi(rq: any) {
    return this.http.post<any>(this.apiUrl + '/abonnement', rq);
  }

  reserverCoach(rq: any) {
    return this.http.post<any>(this.apiUrl + '/reservation', rq);
  }

  getPackByIdApi(id: number): Observable<Pack[]> {
    return this.http.get<Pack[]>(this.apiUrl + '/pack/get-id/' + id);
  }

  addCoach(saveCoach: SaveCoach) {
    return this.http.post<any>(this.apiUrl + '/coachSalle', saveCoach);
  }

  getMyCoach(): Observable<CoachSalle[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.myTokenSalle}`,
    });

    return this.http.get<CoachSalle[]>(`${this.apiUrl}/coachSalle/my-coach`, {
      headers,
    });
  }

  deleteCoach(id: number): Observable<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.myTokenSalle}`,
    });

    return this.http.delete(`${this.apiUrl}/coachSalle/${id}`, {
      headers,
      responseType: 'text',
    });
  }

  getCoachsSalle(): Observable<CoachSalle[]> {
    return this.http.get<CoachSalle[]>(this.apiUrl + '/coachSalle');
  }

  updateCoachSalle(id: number, coach: SaveCoach): Observable<CoachSalle> {
    return this.http.put<CoachSalle>(`${this.apiUrl}/coachSalle/${id}`, coach);
  }

  getSalles(): Observable<SalleDeSport[]> {
    return this.http.get<SalleDeSport[]>(this.apiUrl + '/salleDeSport');
  }

  getPackBySalleId(id: number): Observable<Pack[]> {
    return this.http.get<Pack[]>(this.apiUrl + '/pack/salle/' + id);
  }

  getCoachBySalleId(id: number): Observable<CoachSalle[]> {
    return this.http.get<CoachSalle[]>(this.apiUrl + '/coachSalle/salle/' + id);
  }

  getCoachs(): Observable<Coach[]> {
    return this.http.get<Coach[]>(this.apiUrl + '/coach');
  }

  getCoach(id: number): Observable<Coach> {
    return this.http.get<Coach>(this.apiUrl + '/coach/' + id);
  }

  getMyClients(): Observable<ClientSubscription[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.myTokenSalle}`,
    });

    return this.http.get<ClientSubscription[]>(
      `${this.apiUrl}/salleDeSport/my-clients`,
      {
        headers,
      }
    );
  }

  getCoachClients(coachId: number): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/coach/${coachId}/clients`);
  }

  getMonthlyRevenue(
    salleId: number,
    year: number
  ): Observable<{ [month: number]: number }> {
    return this.http.get<{ [month: number]: number }>(
      `${this.apiUrl}/revenue/${salleId}/${year}`
    );
  }

  getTotalYearlyRevenue(salleId: number, year: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/revenue/${salleId}/${year}/total`
    );
  }

  getRevenueByPack(
    salleId: number,
    year: number
  ): Observable<Array<{ packId: number; packName: string; revenue: number }>> {
    return this.http.get<
      Array<{ packId: number; packName: string; revenue: number }>
    >(`${this.apiUrl}/revenue/${salleId}/${year}/by-pack`);
  }

  signInWithGoogle(idToken: string): Observable<any> {
    const params = new HttpParams().set('id_token', idToken);
    return this.http.post(this.GoogleUrl, null, { params });
  }

  addPlanningC(planningC: Plan) {
    return this.http.post<any>(this.apiUrl + '/plan', planningC);
  }

  getPlanningC(id: number): Observable<Plan[]> {
    const url = `${this.apiUrl + '/plan/coach'}/${id}`;
    return this.http.get<Plan[]>(url);
  }

  getUserType(): string | null {
    if (localStorage.getItem('myTokenClient')) {
      return 'client';
    } else if (localStorage.getItem('myTokenCoach')) {
      return 'coach';
    } else if (localStorage.getItem('myTokenSalle')) {
      return 'salle';
    }
    return null;
  }

  getUserId(): number | null {
    const userType = this.getUserType();
    let token: string | null = null;

    if (userType === 'client') {
      token = localStorage.getItem('myTokenClient');
    } else if (userType === 'coach') {
      token = localStorage.getItem('myTokenCoach');
    } else if (userType === 'salle') {
      token = localStorage.getItem('myTokenSalle');
    }

    if (token) {
      const decodedToken = this.helper.decodeToken(token);
      return decodedToken.data.id; // Adjust the path based on your token structure
    }
    return null;
  }

  getUserDetails(): Observable<any> {
    const userType = this.getUserType();
    const userId = this.getUserId();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (userType === 'client') {
      return this.getClientById(userId);
    } else if (userType === 'coach') {
      return this.getCoachById(userId);
    } else if (userType === 'salle') {
      return this.getSalleById(userId);
    }

    throw new Error('Unknown user type');
  }

  reserverseanceFromApi(rq: any) {
    return this.http.post<any>('http://localhost:8081/api/reservation', rq);
  }

  getReservationByIdclient(id: number): Observable<Reservation[]> {
    const url = `${this.apiUrl + '/reservation/get-all-by-id-client'}/${id}`;
    return this.http.get<Reservation[]>(url);
  }

  getAbonnementsByClientId(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/abonnement/get-all-by-id-Client/${id}`
    );
  }

  getReservationByCoach(coachId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(
      `${this.apiUrl}/reservation/get-all-by-id-coach/${coachId}`
    );
  }

  renouvelerAbonnementFromApi(renewalData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/abonnements/renouveler`, renewalData);
  }

  getRenewalPreview(clientId: number, packId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/abonnements/renewal-preview/${clientId}/${packId}`
    );
  }
}
