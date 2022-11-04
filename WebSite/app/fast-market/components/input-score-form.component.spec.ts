import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TimeMachineResult } from '../models';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { MaterialModule } from '../../shared/material-module';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { RequestService } from '../services';

import { InputScoreFormComponent } from './input-score-form.component';
import { Language } from '../../shared/language';
import { of } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import { observeOn } from 'rxjs/operators';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('InputScoreFormComponent', () => {
  let component: InputScoreFormComponent;
  let fixture: ComponentFixture<InputScoreFormComponent>;
  let messageBoxService: MessageBoxService;
  let toastrService: ToastrService;

  const data = 7000000;
  let interval = new TimeMachineResult();
  const tempInterval = new TimeMachineResult();
  tempInterval.position = 1;
  tempInterval.positionName = "mock position";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputScoreFormComponent, ModalDialogComponent, ModalContentDialogComponent],
      providers: [RequestService,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ToastrService,
        { provide: MessageBoxService, useClass: MessageBoxService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data }],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputScoreFormComponent);
    component = fixture.componentInstance;
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('add', () => {
    beforeEach(() => {
      interval = new TimeMachineResult();
    })
    it('should show alert when have at least one input is empty.', () => {
      component.newInterval.homeScore = '';
      spyOn(toastrService, 'error');

      component.add();

      expect(toastrService.error).toHaveBeenCalledWith(Language.inputForm.noInputScore);
    });

    it('should show alert when interval has been exist', () => {
      interval.homeScore = '0';
      interval.awayScore = '1';
      interval.position = 1;
      component.newInterval = interval;
      component.positionSelected = '1';
      component.intervals = [interval];
      spyOn(toastrService, 'error');

      component.add();

      expect(toastrService.error).toHaveBeenCalledWith(Language.inputForm.isExistInterval);
    });

    it('should show alert when both home score and away score are equal zero.', () => {
      interval.homeScore = '0';
      interval.awayScore = '0';
      interval.position = 1;
      component.newInterval = interval;
      component.positionSelected = '1';

      spyOn(toastrService, 'error');

      component.add();

      expect(toastrService.error).toHaveBeenCalledWith(Language.inputForm.scoreInvalid);
    });

    it('should call related method when input pass all validation.', () => {
      interval.homeScore = '0';
      interval.awayScore = '1';
      interval.position = 1;
      component.newInterval = interval;
      component.positionSelected = '1';
      component.results = [tempInterval];

      component.add();

      expect(component.positionSelected).toEqual('');
      expect(component.intervals[0]).toEqual(interval);
    });
  });

  it('pressOKButton - alway show confirm box.', () => {
    spyOn(messageBoxService, 'confirm');

    component.pressOKButton();

    expect(messageBoxService.confirm).toHaveBeenCalled()
  });

  it('pressCancelButton - show confirm when interval has changed.', () => {
    component.originalInterval = [];
    component.intervals = [interval];
    spyOn(messageBoxService, 'confirm');

    component.pressCancelButton();

    expect(messageBoxService.confirm).toHaveBeenCalled()
    expect(component.modalDialogConfirmMessage.message).toEqual(Language.inputForm.cancelMessage);
  });
});
