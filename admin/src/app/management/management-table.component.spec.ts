import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { ManagementTableComponent, TableAction, TableRow } from './management-table.component';

describe('ManagementTableComponent', () => {
  function setup(rows: TableRow[]) {
    TestBed.configureTestingModule({ imports: [ManagementTableComponent, RouterTestingModule] });
    const fixture = TestBed.createComponent(ManagementTableComponent);
    const component = fixture.componentInstance;
    const load = jasmine.createSpy('load rows').and.callFake(() => of(rows));
    component.loadRows = load;
    component.columns = ['ID', 'Nom'];
    component.statusColumn = 'État';
    component.hasActions = true;
    fixture.detectChanges();
    return { fixture, component, load };
  }

  it('combines accent-insensitive search with the selected status', () => {
    const { component } = setup([
      { id: 1, cells: [1, 'Élodie Martin'], status: { label: 'Actif', tone: 'positive' } },
      { id: 2, cells: [2, 'Élodie Dupont'], status: { label: 'Inactif', tone: 'neutral' } },
    ]);
    component.query = 'elodie';
    component.status = 'Inactif';
    component.applyFilters();
    expect(component.matches.map(row => row.id)).toEqual([2]);
  });

  it('runs a mutation only after confirmation and refreshes after success', () => {
    const response = new Subject<void>();
    const run = jasmine.createSpy('delete row').and.returnValue(response);
    const action: TableAction = { label: 'Supprimer', run, confirmation: 'Supprimer cette ligne ?', success: 'Ligne supprimée.' };
    const row: TableRow = { id: 1, cells: [1, 'Fitness'], actions: [action] };
    const { fixture, component, load } = setup([row]);
    fixture.nativeElement.querySelector('button[aria-label="Supprimer, ligne 1"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(action.confirmation);
    expect(run).not.toHaveBeenCalled();

    component.confirmAction();
    component.confirmAction();
    expect(run).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(1);
    response.next();
    response.complete();
    expect(load).toHaveBeenCalledTimes(2);
    expect(component.message).toBe(action.success);
  });

  it('keeps the confirmation and reports a failed action without refreshing', () => {
    const action: TableAction = {
      label: 'Supprimer', run: () => throwError(() => ({ status: 409 })), confirmation: 'Confirmer ?', success: 'Supprimé.',
    };
    const row: TableRow = { id: 1, cells: [1, 'Fitness'], actions: [action] };
    const { component, load } = setup([row]);
    component.selectAction(row, action);
    component.confirmAction();
    expect(component.pending?.row).toBe(row);
    expect(component.actionError).toContain('données associées');
    expect(load).toHaveBeenCalledTimes(1);
  });
});
