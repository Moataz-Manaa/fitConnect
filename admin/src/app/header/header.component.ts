import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  userDetails: any;

  constructor(private service: CrudService, private router: Router) {
    this.userDetails = this.service.userDetails();
  }

  logout() {
    console.log('logout');
    localStorage.clear();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
