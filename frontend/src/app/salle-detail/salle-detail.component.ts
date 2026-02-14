import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Pack } from '../Entity/Pack.Entity';
import { CoachSalle } from '../Entity/CoachSalle.Entity';

@Component({
  selector: 'app-salle-detail',
  templateUrl: './salle-detail.component.html',
  styleUrls: ['./salle-detail.component.css'],
})
export class SalleDetailComponent {
  messageCommande: string = '';

  constructor(
    private service: CrudService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}
  salle: any = {};
  listePack: Pack[];
  coachSalle: CoachSalle[];

  ngOnInit() {
    this.getSalle();
    this.getPacks();
    this.gtetCoachBySalleId();
  }
  getSalle() {
    let id = this.activateRoute.snapshot.params['id'];
    this.service.getSalleById(id).subscribe((data: any) => {
      this.salle = data;
      console.log(data);
    });
  }

  getPacks() {
    let id = this.activateRoute.snapshot.params['id'];
    this.service.getPackBySalleId(id).subscribe((pack) => {
      this.listePack = pack;
    });
  }

  gtetCoachBySalleId() {
    let id = this.activateRoute.snapshot.params['id'];
    this.service.getCoachBySalleId(id).subscribe((data) => {
      this.coachSalle = data;
    });
    console.log(this.coachSalle);
  }
}
