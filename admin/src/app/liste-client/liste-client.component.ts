import { Component } from '@angular/core';
import { Client } from '../Entity/Client.Entity';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-client',
  templateUrl: './liste-client.component.html',
  styleUrls: ['./liste-client.component.css'],
})
export class ListeClientComponent {
  p: number = 1;
  collection: any[];
  listeClient: Client[];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getClient().subscribe((client) => {
      this.listeClient = client;
    });
  }

  DeleteClient(client: Client) {
    if (
      confirm(
        "Voulez vous supprimer ce message de client avec l'ID " +
          client.id +
          '?'
      )
    ) {
      this.service.onDeleteClient(client.id).subscribe(() => {
        this.router.navigate(['/listeClient']).then(() => {
          window.location.reload();
        });
      });
    }
  }
}
