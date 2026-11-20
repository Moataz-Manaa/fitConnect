import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../Entity/Contact.Entity';
import { Client } from '../Entity/Client.Entity';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { Coach } from '../Entity/Coach.Entity';
import { catchError, Observable, tap } from 'rxjs';
import { Category } from '../Entity/Category.Entity';
import { activeSession } from './session';
import { Pack } from '../Entity/Pack.Entity';
import { SavePack } from '../Entity/SavePack.Entity';
import { SaveCoach } from '../Entity/SaveCoach.Entity';
import { CoachSalle } from '../Entity/CoachSalle.Entity';
import { Plan } from '../Entity/Plan.Entity';
import { SavePlan } from '../Entity/SavePlan.Entity';
import { ClientSubscription } from '../Entity/ClientSubscription.Entity';
import { Abonnement } from '../Entity/Abonnement.Entity';
import { Reservation } from '../Entity/Reservation.Entity';

export interface VideoRoomToken {
  appId: number;
  roomId: string;
  userId: string;
  userName: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  private readonly apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getVideoRoomToken(planningId: string): Observable<VideoRoomToken> {
    return this.http.post<VideoRoomToken>(`${this.apiUrl}/video/rooms/${encodeURIComponent(planningId)}/token`, {});
  }

  submitContact(contact: Contact) {
    return this.http.post<any>(this.apiUrl + '/contact', contact);
  }

  registerClient(client: Client) {
    return this.http.post(this.apiUrl + '/client', client, { responseType: 'text' });
  }

  loginClient(client: Client) {
    return this.http.post<any>(`${this.apiUrl}/client/login`, client);
  }

  registerSalleDeSport(salleDeSport: SalleDeSport) {
    return this.http.post<any>(this.apiUrl + '/salleDeSport', salleDeSport);
  }

  loginSalleDeSport(salleDeSport: SalleDeSport) {
    return this.http.post<any>(`${this.apiUrl}/salleDeSport/login`, salleDeSport);
  }

  registerCoach(coach: Coach) {
    return this.http.post<any>(this.apiUrl + '/coach', coach);
  }

  loginCoach(coach: Coach) {
    return this.http.post<any>(`${this.apiUrl}/coach/login`, coach);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/client/forgot-password`,
      { email },
      { responseType: 'text' }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/client/reset-password`, { token, newPassword }, {
      responseType: 'text',
    });
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
    return this.http.get<Pack[]>(`${this.apiUrl}/pack/my-packs`);
  }

  deletePack(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/pack/${id}`, {
      responseType: 'text',
    });
  }

  updatePack(id: number, pack: SavePack): Observable<Pack> {
    return this.http.put<Pack>(`${this.apiUrl}/pack/${id}`, pack);
  }

  isCoachIn(): boolean {
    return this.getUserType() === 'coach';
  }

  isSalleIn(): boolean {
    return this.getUserType() === 'salle';
  }

  isClientIn(): boolean {
    return this.getUserType() === 'client';
  }

  userDetails() {
    return activeSession()?.claims.data ?? null;
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
  getSalleById(id: number): Observable<SalleDeSport> {
    return this.http.get<SalleDeSport>(`${this.apiUrl}/salleDeSport/${id}`);
  }

  updateClient(
    id: number,
    clientData: any,
    currentPassword?: string
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/client/edit/${id}`, clientData, {
      headers: currentPassword ? { 'X-Current-Password': currentPassword } : {},
    });
  }

  // Update coach profile
  updateCoach(
    id: number,
    coachData: any,
    currentPassword?: string
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/coach/edit/${id}`, coachData, {
      headers: currentPassword ? { 'X-Current-Password': currentPassword } : {},
    });
  }

  // Update salle profile
  updateSalle(
    id: number,
    salleData: any,
    currentPassword?: string
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/salleDeSport/edit/${id}`, salleData, {
      headers: currentPassword ? { 'X-Current-Password': currentPassword } : {},
    });
  }

  getPackByIdApi(id: number): Observable<Pack> {
    return this.http.get<Pack>(this.apiUrl + '/pack/get-id/' + id);
  }

  addCoach(saveCoach: SaveCoach) {
    return this.http.post<any>(this.apiUrl + '/coachSalle', saveCoach);
  }

  getMyCoach(): Observable<CoachSalle[]> {
    return this.http.get<CoachSalle[]>(`${this.apiUrl}/coachSalle/my-coach`);
  }

  deleteCoach(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/coachSalle/${id}`, {
      responseType: 'text',
    });
  }

  getCoachsSalle(): Observable<CoachSalle[]> {
    return this.http.get<CoachSalle[]>(this.apiUrl + '/coachSalle');
  }

  getGymCoach(id: number): Observable<CoachSalle | null> {
    return this.http.get<CoachSalle | null>(`${this.apiUrl}/coachSalle/${id}`);
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
    return this.http.get<ClientSubscription[]>(
      `${this.apiUrl}/salleDeSport/my-clients`,
      {
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
    return this.http.post(`${this.apiUrl}/client/login-google`, { idToken });
  }

  addPlanningC(planningC: SavePlan): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl + '/plan', planningC);
  }

  getPlanningC(id: number): Observable<Plan[]> {
    const url = `${this.apiUrl + '/plan/coach'}/${id}`;
    return this.http.get<Plan[]>(url);
  }

  getUserType(): string | null {
    return activeSession()?.role ?? null;
  }

  getUserId(): number | null {
    return this.userDetails()?.id ?? null;
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

  getReservationByIdclient(id: number): Observable<Reservation[]> {
    const url = `${this.apiUrl + '/reservation/get-all-by-id-client'}/${id}`;
    return this.http.get<Reservation[]>(url);
  }

  getAbonnementsByClientId(id: number): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(
      `${this.apiUrl}/abonnement/get-all-by-id-Client/${id}`
    );
  }

  getReservationByCoach(coachId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(
      `${this.apiUrl}/reservation/get-all-by-id-coach/${coachId}`
    );
  }

}
