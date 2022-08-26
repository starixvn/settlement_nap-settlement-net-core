import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { EditSourceDialogComponent } from './edit-source-dialog.component';
import { HttpRequestService } from '../../shared/services';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material-module';
import { QueryService } from '../services';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OutsideSource } from '../models';

describe('EditSourceDialogComponent', () => {
  let component: EditSourceDialogComponent;
  let fixture: ComponentFixture<EditSourceDialogComponent>;
  let queryService: QueryService;
  const dialogMock = {
    close: () => { }
  };
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  const data = { sourceName: '' };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        EditSourceDialogComponent,
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      providers: [
        HttpRequestService,
        HttpClient,
        HttpHandler,
        NgbModal,
        QueryService,
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        NgbModule,
      ]
    })
    .overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSourceDialogComponent);
    component = fixture.componentInstance;
    queryService = fixture.debugElement.injector.get(QueryService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closepopup', () => {
    spyOn(component.dialogRef, 'close');

    component.closePopup();

    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  describe('saveSource', () => {
    it('should push successfully', fakeAsync(() => {
      component.outsideSource = new OutsideSource();
      component.outsideSource.sourceName = 'test';
      spyOn(queryService, 'updateOutsideSource').and.returnValue(of(successfulResult));
      spyOn(component.dialogRef, 'close');

      component.saveSource();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.dialogRef.close).toHaveBeenCalled();
    }));

    it('should push unsuccessfully and set error message', fakeAsync(() => {
      component.outsideSource = new OutsideSource();
      component.outsideSource.sourceName = 'test';
      spyOn(queryService, 'updateOutsideSource').and.returnValue(of(unSuccessfulResult));

      component.saveSource();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.errorMessage).toEqual(errorMessage);
    }));

    it('should set error message when name is empty', () => {
      component.outsideSource = new OutsideSource();
      component.outsideSource.sourceName = '';
      component.saveSource();

      expect(component.errorMessage).toEqual("Please input source name.");
    });
  });

  it('isErrorWhenSubmit - should return true when clicked save and source name is empty', () => {
    component.isButtonClicked = true;
    data.sourceName = '';

    const result = component.isErrorWhenSubmit();

    expect(result).toBe(true);
  });
});
