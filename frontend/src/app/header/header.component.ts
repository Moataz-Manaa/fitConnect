import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  IsCoachIn: boolean;
  IsSalleIn: boolean;
  IsClientIn: boolean;

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.IsCoachIn = this.service.isCoachIn();
    this.IsSalleIn = this.service.isSalleIn();
    this.IsClientIn = this.service.isClientIn();
  }

  logout() {
    console.log('logout');
    localStorage.clear();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
