import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { adminSession } from './session';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivateChild {
  constructor(private router: Router) {}

  canActivateChild() {
    return adminSession() !== null || this.router.createUrlTree(['/login']);
  }
}
