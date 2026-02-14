import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Admin } from '../Entity/Admin.Entity';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-admin',
  templateUrl: './liste-admin.component.html',
  styleUrls: ['./liste-admin.component.css'],
})
export class ListeAdminComponent {
  p: number = 1;
  collection: any[];
  role: String;
  listeAdmin: Admin[];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') as string;
    this.service.getAdmin().subscribe((admin) => {
      this.listeAdmin = admin;
    });
  }

  DeleteAdmin(admin: Admin) {
    if (
      confirm(
        "Voulez-vous supprimer cet administrateur avec l'ID " + admin.id + '?'
      )
    ) {
      this.service.onDeleteAdmin(admin.id).subscribe(() => {
        this.router.navigate(['/listeAdmin']).then(() => {
          window.location.reload();
        });
      });
    }
  }
}
