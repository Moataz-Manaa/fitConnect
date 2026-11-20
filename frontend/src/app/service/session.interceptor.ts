import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { activeSession } from './session';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!request.url.startsWith('/api/')) {
      return next.handle(request);
    }
    const session = activeSession();
    if (!session || (request.method === 'POST' &&
        /^\/api\/(client|coach|salleDeSport)(?:\/(?:login|login-google|forgot-password|reset-password))?$/.test(request.url))) {
      return next.handle(request);
    }
    return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } }));
  }
}
