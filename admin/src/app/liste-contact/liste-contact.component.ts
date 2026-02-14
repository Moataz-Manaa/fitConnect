import { Component } from '@angular/core';
import { Contact } from '../Entity/Contact.Entity';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-contact',
  templateUrl: './liste-contact.component.html',
  styleUrls: ['./liste-contact.component.css'],
})
export class ListeContactComponent {
  p: number = 1;
  collection: any[];
  listeContact: Contact[];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getContact().subscribe((contact) => {
      this.listeContact = contact;
    });
  }

  DeleteContact(contact: Contact) {
    if (
      confirm(
        "Voulez vous supprimer ce message de contact avec l'ID " +
          contact.id +
          '?'
      )
    ) {
      this.service.onDeleteContact(contact.id).subscribe(() => {
        this.router.navigate(['/listeContact']).then(() => {
          window.location.reload();
        });
      });
    }
  }
}
