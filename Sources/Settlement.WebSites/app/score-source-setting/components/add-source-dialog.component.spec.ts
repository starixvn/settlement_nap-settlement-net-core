import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AddSourceDialogComponent } from './add-source-dialog.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpRequestService } from '../../shared/services';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material-module';
import { QueryService } from '../services';
import { OutsideSource } from '../models';
import { of } from 'rxjs';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('AddSourceDialogComponent', () => {
  let component: AddSourceDialogComponent;
  let fixture: ComponentFixture<AddSourceDialogComponent>;
  let queryService: QueryService;
  const dialogMock = {
    close: () => { }
  };
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const data = {
    selectedSport: 5
  };
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          AddSourceDialogComponent,
          ModalDialogComponent,
          ModalContentDialogComponent
        ],
        providers: [
          HttpRequestService,
          HttpClient,
          HttpHandler,
          QueryService,
          NgbModal,
          { provide: MatDialogRef, useValue: dialogMock },
          { provide: MAT_DIALOG_DATA, useValue: data }
        ],
        imports: [
          BrowserModule,
          FormsModule,
          MaterialModule,
          NgbModule
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
    fixture = TestBed.createComponent(AddSourceDialogComponent);
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

  describe('addNewSource', () => {
    it('should push successfully', fakeAsync(() => {
      component.sourceName = 'test';
      component.sportSelected = 50;
      spyOn(queryService, 'add').and.returnValue(of(successfulResult));
      spyOn(component.dialogRef, 'close');

      component.addNewSource();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.dialogRef.close).toHaveBeenCalled();
    }));

    it('should push unsuccessfully and set error message', fakeAsync(() => {
      component.sourceName = 'test';
      spyOn(queryService, 'add').and.returnValue(of(unSuccessfulResult));

      component.addNewSource();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.errorMessage).toEqual(errorMessage);
    }));

    it('should set error message when name is empty', () => {
      component.addNewSource();

      expect(component.errorMessage).toEqual("Please input source name.");
    });
  });

  it('isErrorWhenSubmit - should return true when clicked save and source name is empty', () => {
    component.isButtonClicked = true;

    const result = component.isErrorWhenSubmit();

    expect(result).toBe(true);
  });
});