import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

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
    localStorage.removeItem('myToken');
    http.verify();
  });

  it('requests the admin list through the same-origin API', () => {
    service.getAdmin().subscribe();

    const request = http.expectOne('/api/admin');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('attaches the session only to same-origin API requests', () => {
    const claims = btoa(JSON.stringify({ role: 'admin', data: { id: 1 }, exp: Date.now() / 1000 + 60 }));
    const token = `e30.${claims}.signature`;
    localStorage.setItem('myToken', token);

    service.getAdmin().subscribe();
    const request = http.expectOne('/api/admin');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush({});

    const thirdParty = 'https://example.test/api/profile';
    TestBed.inject(HttpClient).get(thirdParty).subscribe();
    const externalRequest = http.expectOne(thirdParty);
    expect(externalRequest.request.headers.has('Authorization')).toBeFalse();
    externalRequest.flush({});
  });
});
