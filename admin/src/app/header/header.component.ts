import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { adminSession } from '../service/session';

@Component({ selector: 'app-header', templateUrl: './header.component.html' })
export class HeaderComponent {
  private readonly document = inject(DOCUMENT);

  constructor(private router: Router) {}

  get user() { return adminSession()?.claims.data; }

  focusContent(): void { this.document.getElementById('admin-main')?.focus(); }

  logout(): void {
    localStorage.removeItem('myToken');
    localStorage.removeItem('role');
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
