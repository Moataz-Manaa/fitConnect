import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private service: CrudService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const userType = this.service.getUserType();
    const allowedRoles = next.data['roles'] as string[];

    // Check if user is logged in
    const isLoggedIn = userType !== null;

    if (!isLoggedIn) {
      // Redirect to appropriate login based on attempted route or default to home
      if (allowedRoles) {
        if (allowedRoles.includes('client')) {
          return this.router.createUrlTree(['/loginClient']);
        } else if (allowedRoles.includes('coach')) {
          return this.router.createUrlTree(['/loginCoach']);
        } else if (allowedRoles.includes('salle')) {
          return this.router.createUrlTree(['/loginSalleDeSport']);
        }
      }
      // Default redirect for unauthenticated users
      return this.router.createUrlTree(['/']);
    }

    // Check if user has the required role
    if (allowedRoles && allowedRoles.includes(userType)) {
      return true;
    }

    // Redirect to appropriate login or home based on user type if role doesn't match
    if (userType === 'client') {
      return this.router.createUrlTree(['/loginClient']);
    } else if (userType === 'coach') {
      return this.router.createUrlTree(['/loginCoach']);
    } else if (userType === 'salle') {
      return this.router.createUrlTree(['/loginSalleDeSport']);
    }

    // Fallback redirect
    return this.router.createUrlTree(['/']);
  }
}
