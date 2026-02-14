import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Admin } from '../Entity/Admin.Entity';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Contact } from '../Entity/Contact.Entity';
import { Client } from '../Entity/Client.Entity';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { Coach } from '../Entity/Coach.Entity';
import { Category } from '../Entity/Category.Entity';
import { Pack } from '../Entity/Pack.Entity';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  helper = new JwtHelperService();
  apiUrl = 'http://localhost:8081/api';
  loginUserUrl = 'http://localhost:8081/api/admin/login';
  constructor(private http: HttpClient) {}

  addadmin(admin: Admin) {
    return this.http.post<any>(this.apiUrl + '/admin', admin);
  }

  getAdmin(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.apiUrl + '/admin');
  }

  onDeleteAdmin(id: number) {
    const url = `${this.apiUrl + '/admin'}/${id}`;
    return this.http.delete(url);
  }

  loginAdmin(admin: Admin) {
    return this.http.post<any>(this.loginUserUrl, admin);
  }

  findAdminById(id: number): Observable<Admin> {
    const url = `${this.apiUrl + '/admin'}/${id};`;
    return this.http.get<Admin>(url);
  }

  updateAdmin(id: number, admin: Admin) {
    const url = `${this.apiUrl + '/admin'}/${id}`;
    return this.http.put<any>(url, admin);
  }

  userDetails() {
    let token: any = localStorage.getItem('myToken');
    let decodeToken = this.helper.decodeToken(token);
    return decodeToken.data;
  }

  addContact(contact: Contact) {
    return this.http.post<any>(this.apiUrl + '/contact', contact);
  }

  getContact(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl + '/contact');
  }

  onDeleteContact(id: number) {
    const url = `${this.apiUrl + '/contact'}/${id}`;
    return this.http.delete(url);
  }

  addClient(client: Client) {
    return this.http.post<any>(this.apiUrl + '/client', client);
  }

  getClient(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl + '/client');
  }

  onDeleteClient(id: number) {
    const url = `${this.apiUrl + '/client'}/${id}`;
    return this.http.delete(url);
  }

  addSalleDeSport(salleDeSport: SalleDeSport) {
    return this.http.post<any>(this.apiUrl + '/salleDeSport', salleDeSport);
  }

  getSalleDeSport(): Observable<SalleDeSport[]> {
    return this.http.get<SalleDeSport[]>(this.apiUrl + '/salleDeSport');
  }

  onDeleteSalleDeSport(id: number) {
    const url = `${this.apiUrl + '/salleDeSport'}/${id}`;
    return this.http.delete(url);
  }

  updateSalleDeSport(salle: SalleDeSport, id: number) {
    const url = ` ${this.apiUrl + '/salleDeSport'}/${id}`;
    return this.http.put<any>(url, salle);
  }

  addCoach(coach: Coach) {
    return this.http.post<any>(this.apiUrl + '/coach', coach);
  }

  getCoach(): Observable<Coach[]> {
    return this.http.get<Coach[]>(this.apiUrl + '/coach');
  }

  onDeleteCoach(id: number) {
    const url = `${this.apiUrl + '/coach'}/${id}`;
    return this.http.delete(url);
  }

  updateCoach(coach: Coach, id: number) {
    const url = ` ${this.apiUrl + '/coach'}/${id}`;
    return this.http.put<any>(url, coach);
  }

  addCategory(category: Category) {
    return this.http.post<any>(this.apiUrl + '/category', category);
  }

  getCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/category');
  }

  onDeleteCategory(id: number) {
    const url = `${this.apiUrl + '/category'}/${id}`;
    return this.http.delete(url);
  }

  isLoggedIn() {
    let token = localStorage.getItem('myToken');

    if (token) {
      return true;
    } else {
      return false;
    }
  }

  getPack(): Observable<Pack[]> {
    return this.http.get<Pack[]>(this.apiUrl + '/pack');
  }
}
