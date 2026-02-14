import { Component } from '@angular/core';
import { CoachSalle } from '../Entity/CoachSalle.Entity';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-coach',
  templateUrl: './liste-coach.component.html',
  styleUrls: ['./liste-coach.component.css'],
})
export class ListeCoachComponent {
  coachs: CoachSalle[] = [];
  changeDetectorRef: any;

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    this.loadMyCoach();
  }

  loadMyCoach(): void {
    this.crudService.getMyCoach().subscribe(
      (data: CoachSalle[]) => {
        this.coachs = data;
      },
      (error) => {
        console.error('Error fetching coach:', error);
      }
    );
  }

  deleteCoach(id: number): void {
    if (confirm('Are you sure you want to delete this coach?')) {
      this.crudService.deleteCoach(id).subscribe(
        () => {
          // Remove the deleted pack from the array
          this.coachs = this.coachs.filter((coachs) => coachs.id !== id);
        },
        (error) => {
          console.error('Error deleting coach:', error);
        }
      );
    }
  }
}
