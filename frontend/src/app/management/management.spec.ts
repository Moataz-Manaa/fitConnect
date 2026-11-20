import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CalendarComponent } from '../calendar/calendar.component';
import { EditPackComponent } from '../edit-pack/edit-pack.component';
import { CrudService } from '../service/crud.service';

describe('Professional management workflows', () => {
  it('rejects reversed session times and publishes a valid slot with the selected activity', () => {
    const service = jasmine.createSpyObj<CrudService>('CrudService', ['userDetails', 'getCategory', 'getPlanningC', 'addPlanningC']);
    service.userDetails.and.returnValue({ id: 7 });
    service.getCategory.and.returnValue(of([{ id: 4, nom: 'Fitness' }]));
    service.getPlanningC.and.returnValue(of([]));
    service.addPlanningC.and.returnValue(of({ id: 12 }));
    TestBed.configureTestingModule({
      declarations: [CalendarComponent],
      providers: [FormBuilder, { provide: CrudService, useValue: service }],
    }).overrideComponent(CalendarComponent, { set: { template: '' } });
    const fixture = TestBed.createComponent(CalendarComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.setValue({ idCategory: 4, description: 'Cardio', date: '2026-12-05', debut: '10:00', fin: '09:00', prix: 25 });
    component.publish();
    expect(service.addPlanningC).not.toHaveBeenCalled();
    component.form.controls.fin.setValue('11:00');
    component.publish();
    expect(service.addPlanningC).toHaveBeenCalledWith({
      idCoach: 7, idCategory: 4, description: 'Cardio', date: '2026-12-05', debut: '10:00', fin: '11:00', prix: 25,
    });
    expect(service.getPlanningC).toHaveBeenCalledTimes(2);
    expect(component.success).toBeTruthy();
  });

  it('keeps a failed pack edit open and waits for the API before navigating on retry', () => {
    const service = jasmine.createSpyObj<CrudService>('CrudService', ['userDetails', 'getCategory', 'getPackByIdApi', 'updatePack']);
    service.userDetails.and.returnValue({ id: 7 });
    service.getCategory.and.returnValue(of([{ id: 4, nom: 'Fitness' }]));
    service.getPackByIdApi.and.returnValue(of({
      id: 12, nom: 'Fitness', description: 'Abonnement', prix: 35, category: { id: 4 }, salle: { id: 7 },
    }));
    service.updatePack.and.returnValue(throwError(() => ({ status: 503 })));
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [EditPackComponent],
      providers: [FormBuilder, { provide: CrudService, useValue: service }, { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '12' }) } } }],
    }).overrideComponent(EditPackComponent, { set: { template: '' } });
    const fixture = TestBed.createComponent(EditPackComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.save();
    expect(component.error).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
    const response = new Subject<{ id: number }>();
    service.updatePack.and.returnValue(response);
    component.save();
    component.save();
    expect(service.updatePack).toHaveBeenCalledTimes(2);
    expect(router.navigate).not.toHaveBeenCalled();
    response.next({ id: 12 });
    response.complete();
    expect(router.navigate).toHaveBeenCalledWith(['/mesPacks'], jasmine.any(Object));
  });
});
