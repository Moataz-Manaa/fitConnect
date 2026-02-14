import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Coach } from '../Entity/Coach.Entity';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css'],
})
export class CoachComponent implements OnInit {
  listeCoach: Coach[] = [];
  filteredCoach: Coach[] = [];
  searchTerm: string = '';

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getCoachs().subscribe((coaches) => {
      this.listeCoach = coaches;
      this.filteredCoach = coaches; // Initialize filteredCoach with all coaches
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCoach = this.listeCoach; // Reset to full list if search is empty
    } else {
      this.filteredCoach = this.listeCoach.filter((coach) =>
        `${coach.nom} ${coach.prenom}`
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }
  }
}
