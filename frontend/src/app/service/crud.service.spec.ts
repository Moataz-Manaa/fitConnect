import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Client } from '../Entity/Client.Entity';
import { CrudService } from './crud.service';
import { SessionInterceptor } from './session.interceptor';

describe('CrudService API routing', () => {
  let service: CrudService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true }],
    });
    service = TestBed.inject(CrudService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.removeItem('myTokenClient');
    http.verify();
  });

  it('accepts the plain-text email confirmation response after registration', () => {
    const success = jasmine.createSpy('registration success');
    service.registerClient(new Client()).subscribe(success);

    const request = http.expectOne('/api/client');
    expect(request.request.method).toBe('POST');
    expect(request.request.responseType).toBe('text');
    request.flush('Verify email by the link sent on your email address');
    expect(success).toHaveBeenCalledWith('Verify email by the link sent on your email address');
  });

  it('sends Google sign-in credentials through the same-origin API', () => {
    service.signInWithGoogle('example-token').subscribe();

    const request = http.expectOne('/api/client/login-google');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ idToken: 'example-token' });
    request.flush({});
  });

  it('attaches the session only to same-origin API requests', () => {
    const claims = btoa(JSON.stringify({ role: 'client', data: { id: 1 }, exp: Date.now() / 1000 + 60 }));
    const token = `e30.${claims}.signature`;
    localStorage.setItem('myTokenClient', token);

    service.getVideoRoomToken('12').subscribe();
    const request = http.expectOne('/api/video/rooms/12/token');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush({});

    const thirdParty = 'https://example.test/api/profile';
    TestBed.inject(HttpClient).get(thirdParty).subscribe();
    const externalRequest = http.expectOne(thirdParty);
    expect(externalRequest.request.headers.has('Authorization')).toBeFalse();
    externalRequest.flush({});
  });
});
