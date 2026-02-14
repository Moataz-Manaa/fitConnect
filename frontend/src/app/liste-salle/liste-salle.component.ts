import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-salle',
  templateUrl: './liste-salle.component.html',
  styleUrls: ['./liste-salle.component.css'],
})
export class ListeSalleComponent implements OnInit {
  listeSalle: SalleDeSport[] = [];
  filteredSalle: SalleDeSport[] = [];
  searchTerm: string = '';

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getSalles().subscribe((salles) => {
      this.listeSalle = salles;
      this.filteredSalle = salles; // Initialize filtered list with all salles
    });
  }

  // Filter salles based on search term
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSalle = this.listeSalle; // Reset to full list if search is empty
    } else {
      this.filteredSalle = this.listeSalle.filter((salle) =>
        salle.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}
