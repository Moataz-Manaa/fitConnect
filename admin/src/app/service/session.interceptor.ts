import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { adminSession } from './session';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!request.url.startsWith('/api/') || request.url === '/api/admin/login') {
      return next.handle(request);
    }
    const session = adminSession();
    return next.handle(session
      ? request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } })
      : request);
  }
}
