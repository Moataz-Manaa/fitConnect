import { Observable, catchError, map, of, startWith } from 'rxjs';

export interface CustomerData<T> {
  loading: boolean;
  error: string;
  value: T | null;
}

export function customerData<T>(request: Observable<T>, error: string): Observable<CustomerData<T>> {
  return request.pipe(
    map(value => ({ loading: false, error: '', value })),
    startWith({ loading: true, error: '', value: null }),
    catchError(() => of({ loading: false, error, value: null }))
  );
}

function searchable(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
}

export function matchesSearch(query: string, ...fields: (string | undefined)[]): boolean {
  const text = searchable(fields.filter(Boolean).join(' '));
  return searchable(query).trim().split(/\s+/).every(word => text.includes(word));
}
