import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Pack } from '../Entity/Pack.Entity';

@Component({
  selector: 'app-my-packs',
  templateUrl: './my-packs.component.html',
  styleUrls: ['./my-packs.component.css'],
})
export class MyPacksComponent {
  packs: Pack[] = [];
  changeDetectorRef: any;

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    this.loadMyPacks();
  }

  loadMyPacks(): void {
    this.crudService.getMyPacks().subscribe(
      (data: Pack[]) => {
        this.packs = data;
      },
      (error) => {
        console.error('Error fetching packs:', error);
      }
    );
  }

  deletePack(id: number): void {
    if (confirm('Are you sure you want to delete this pack?')) {
      this.crudService.deletePack(id).subscribe(
        () => {
          // Remove the deleted pack from the array
          this.packs = this.packs.filter((pack) => pack.id !== id);
        },
        (error) => {
          console.error('Error deleting pack:', error);
        }
      );
    }
  }
}
