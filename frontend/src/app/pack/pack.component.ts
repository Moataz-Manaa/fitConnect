import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Pack } from '../Entity/Pack.Entity';

@Component({
  selector: 'app-pack',
  templateUrl: './pack.component.html',
  styleUrls: ['./pack.component.css'],
})
export class PackComponent {
  constructor(private service: CrudService, private router: Router) {}

  listePack: Pack[];

  ngOnInit(): void {
    this.service.getPacks().subscribe((pack) => {
      this.listePack = pack;
    });
  }
}
