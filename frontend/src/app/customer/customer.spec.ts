import { calculateBmi } from '../bmi/bmi.component';
import { canBookSession, customerLoginDestination, sessionTime } from './customer-booking';
import { matchesSearch } from './customer-data';

describe('Customer workflows', () => {
  it('calculates BMI using metric units and rejects invalid inputs', () => {
    expect(calculateBmi(72, 180)).toBeCloseTo(22.22, 2);
    expect(calculateBmi(72, 0)).toBeNull();
    expect(calculateBmi(null, 180)).toBeNull();
  });

  it('searches across fields and ignores accents and capitalization', () => {
    expect(matchesSearch('  elodie   MARTIN ', '\u00c9lodie', 'Martin')).toBeTrue();
    expect(matchesSearch('elodie paris', '\u00c9lodie', 'Martin')).toBeFalse();
  });

  it('reads plan dates and enforces the 31-minute booking boundary', () => {
    const start = sessionTime('2026-11-19T00:00:00.000Z', '9:15:30');
    expect(start).toBe(new Date(2026, 10, 19, 9, 15, 30).getTime());
    expect(canBookSession(start, start - 31 * 60_000)).toBeTrue();
    expect(canBookSession(start, start - 31 * 60_000 + 1)).toBeFalse();
    expect(canBookSession(sessionTime('2026-02-30', '9:15'), 0)).toBeFalse();
  });

  it('returns members to supported booking and checkout pages', () => {
    const id = '12345678-1234-4123-8123-123456789abc';
    expect(customerLoginDestination(id, '/detail/4')).toEqual(['/checkout', id]);
    expect(customerLoginDestination(null, '/seance/12')).toEqual(['/seance', '12']);
    expect(customerLoginDestination(null, '/detail/4')).toEqual(['/detail', '4']);
    expect(customerLoginDestination('invalid', '/calendar')).toEqual(['/']);
    expect(customerLoginDestination(null, '/detail/4?other=true')).toEqual(['/']);
  });
});
