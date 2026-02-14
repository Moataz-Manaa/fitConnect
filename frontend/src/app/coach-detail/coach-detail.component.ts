import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-coach-detail',
  templateUrl: './coach-detail.component.html',
  styleUrls: ['./coach-detail.component.css'],
})
export class CoachDetailComponent {
  messageCommande: string = '';

  constructor(
    private service: CrudService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}
  coach: any = {};
  reserver(event: any) {
    this.messageCommande = `<div class="alert alert-primary" role="alert">
    Veuillez patienter ...
  </div>`;
    console.log(event);
    let rq: any = {};
    rq.idClient = this.service.userDetails()?.id;
    rq.idCoach = event.id;

    console.log(rq, 'what we senddddd');
    this.service.reserverCoach(rq).subscribe(
      (data: any) => {
        const id = data.id;
        this.router.navigate([`/payment/${id}`]).then(() => {
          window.location.reload();
        });

        this.messageCommande = `<div class="alert alert-success" role="alert">
    Réservé avec succès
  </div>`;
      },
      (err) => {
        this.messageCommande = `<div class="alert alert-warning" role="alert">
     Erreur, Veuillez réssayer !! 
    </div>`;
      }
    );
    setTimeout(() => {
      this.messageCommande = '';
    }, 3000);
  }
  ngOnInit() {
    this.getCoach();
  }
  getCoach() {
    let id = this.activateRoute.snapshot.params['id'];
    this.service.getCoach(id).subscribe((data: any) => {
      this.coach = data;
      console.log(data);
    });
  }
}
