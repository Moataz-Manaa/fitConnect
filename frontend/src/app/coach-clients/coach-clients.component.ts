import { Component, OnInit } from '@angular/core';
import { Client } from '../Entity/Client.Entity';
import { CrudService } from '../service/crud.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-coach-clients',
  templateUrl: './coach-clients.component.html',
  styleUrls: ['./coach-clients.component.css'],
})
export class CoachClientsComponent {
  clients: Client[] = [];
  coachId: number | null = null;

  constructor(private crudService: CrudService) {
    this.loadCoachIdFromToken();
  }

  ngOnInit(): void {
    if (this.coachId) {
      this.loadClients();
    } else {
      console.error('No coach ID found. Please log in.');
    }
  }

  private loadCoachIdFromToken(): void {
    const token = localStorage.getItem('myTokenCoach');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.coachId = decoded.data.id;
        console.log(this.coachId); // Adjust based on your token structure
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  private loadClients(): void {
    if (this.coachId) {
      this.crudService.getCoachClients(this.coachId).subscribe(
        (data: Client[]) => {
          this.clients = data;
          console.log('Clients:', this.clients);
        },
        (error) => {
          console.error('Error fetching clients:', error);
        }
      );
    }
  }
}
