import { Component } from '@angular/core';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-salle-de-sport',
  templateUrl: './liste-salle-de-sport.component.html',
  styleUrls: ['./liste-salle-de-sport.component.css'],
})
export class ListeSalleDeSportComponent {
  p: number = 1;
  collection: any[];
  listeSalleDeSport: SalleDeSport[];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getSalleDeSport().subscribe((salleDeSport) => {
      this.listeSalleDeSport = salleDeSport;
    });
  }

  DeleteSalleDeSport(salleDeSport: SalleDeSport) {
    if (
      confirm(
        "Voulez vous supprimer ce message de salleDeSport avec l'ID " +
          salleDeSport.id +
          '?'
      )
    ) {
      this.service.onDeleteSalleDeSport(salleDeSport.id).subscribe(() => {
        this.router.navigate(['/listeSalleDeSport']).then(() => {
          window.location.reload();
        });
      });
    }
  }
  /*
  updateSalle(salle: SalleDeSport) {
    console.log(salle);

    let index = this.listeSalleDeSport.indexOf(salle);
    if (salle.etat == true) {
      let newSalleDeSport = new SalleDeSport(
        salle.id,
        salle.nom,
        salle.email,
        salle.adresse,
        salle.mp,
        salle.telephone,
        false
      );
      this.service.updateSalleDeSport(newSalleDeSport, salle.id).subscribe(
        (res) => {
          console.log(res);
          this.listeSalleDeSport[index] = newSalleDeSport;
        },
        (err) => console.log(err)
      );
    } else {
      let newSalleDeSport = new SalleDeSport(
        salle.id,
        salle.nom,
        salle.email,
        salle.adresse,
        salle.mp,
        salle.telephone,
        true
      );
      this.service.updateSalleDeSport(newSalleDeSport, salle.id).subscribe(
        (res) => {
          console.log(res);
          this.listeSalleDeSport[index] = newSalleDeSport;
        },
        (err) => console.log(err)
      );
    }
  }*/

  updatesalleetat(salle: SalleDeSport) {
    console.log(salle);

    let index = this.listeSalleDeSport.indexOf(salle);
    if (salle.etat == true) {
      let newSalle = new SalleDeSport(
        salle.id,
        salle.nom,
        salle.email,
        salle.adresse,
        salle.mp,
        salle.telephone,
        false
      );
      this.service.updateSalleDeSport(newSalle, salle.id).subscribe(
        (res) => {
          console.log(res);
          this.listeSalleDeSport[index] = newSalle;
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
      let newSalle = new SalleDeSport(
        salle.id,
        salle.nom,
        salle.email,
        salle.adresse,
        salle.mp,
        salle.telephone,
        true
      );
      this.service.updateSalleDeSport(newSalle, salle.id).subscribe(
        (res) => {
          console.log(res);
          this.listeSalleDeSport[index] = newSalle;
          Swal.fire({
            title: 'Succès !',
            text: 'Le compte de responsable de salle a été activé avec succès.',
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
