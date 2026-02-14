import { Component } from '@angular/core';
import { Pack } from '../Entity/Pack.Entity';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liste-pack',
  templateUrl: './liste-pack.component.html',
  styleUrls: ['./liste-pack.component.css'],
})
export class ListePackComponent {
  p: number = 1;
  collection: any[];
  listePack: Pack[];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.getPack().subscribe((pack) => {
      this.listePack = pack;
    });
  }
}
