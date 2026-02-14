import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Coach } from '../Entity/Coach.Entity';
import { CrudService } from '../service/crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-coach',
  templateUrl: './liste-coach.component.html',
  styleUrls: ['./liste-coach.component.css'],
})
export class ListeCoachComponent {
  p: number = 1;
  collection: any[];
  listeCoach: Coach[];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getCoach().subscribe((coach) => {
      this.listeCoach = coach;
    });
  }

  DeleteCoach(coach: Coach) {
    if (
      confirm(
        "Voulez vous supprimer ce message de coach avec l'ID " + coach.id + '?'
      )
    ) {
      this.service.onDeleteCoach(coach.id).subscribe(() => {
        this.router.navigate(['/listeCoach']).then(() => {
          window.location.reload();
        });
      });
    }
  }
  /*
  updateCoach(coach: Coach) {
    let index = this.listeCoach.indexOf(coach);
    if (coach.etat == true) {
      let newCoach = new Coach(
        coach.id,
        coach.nom,
        coach.prenom,
        coach.email,
        coach.mp,
        coach.telephone,
        false
      );
      this.service.updateCoach(newCoach, coach.id).subscribe(
        (res) => {
          console.log(res);
          this.listeCoach[index] = newCoach;
        },
        (err) => console.log(err)
      );
    } else {
      let newCoach = new Coach(
        coach.id,
        coach.nom,
        coach.prenom,
        coach.email,
        coach.mp,
        coach.telephone,
        true
      );
      this.service.updateCoach(newCoach, coach.id).subscribe(
        (res) => {
          console.log(res);
          this.listeCoach[index] = newCoach;
        },
        (err) => console.log(err)
      );
    }
  }*/

  updateCoach(coach: Coach) {
    console.log(coach);

    let index = this.listeCoach.indexOf(coach);
    if (coach.etat == true) {
      let newCoach = new Coach(
        coach.id,
        coach.nom,
        coach.prenom,
        coach.email,
        coach.mp,
        coach.telephone,
        false
      );
      this.service.updateCoach(newCoach, coach.id).subscribe(
        (res) => {
          console.log(res);
          this.listeCoach[index] = newCoach;
          Swal.fire({
            icon: 'error',
            title: 'Compte désactivé',
            text: 'Le compte a été désactivé avec succès.',
            showConfirmButton: false,
            timer: 3000,
          });
        },
        (err) => console.log(err)
      );
    } else {
      let newCoach = new Coach(
        coach.id,
        coach.nom,
        coach.prenom,
        coach.email,
        coach.mp,
        coach.telephone,
        true
      );
      this.service.updateCoach(newCoach, coach.id).subscribe(
        (res) => {
          console.log(res);
          this.listeCoach[index] = newCoach;
          Swal.fire({
            title: 'Succès !',
            text: 'Le compte de coach a été activé avec succès.',
            icon: 'success',
            showConfirmButton: false,
            timer: 3000,
          });
        },
        (err) => console.log(err)
      );
    }
  }
}
