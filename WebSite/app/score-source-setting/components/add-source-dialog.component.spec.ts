import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddSourceDialogComponent } from './add-source-dialog.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpRequestService, MessageBoxService, BlockUIService } from '../../shared/services';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material-module';
import { QueryService } from '../services';
import { of } from 'rxjs';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
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

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [
          AddSourceDialogComponent,
          BrowserModule,
          FormsModule,
          MaterialModule,
          NgbModule,
          ModalDialogComponent,
          ModalContentDialogComponent
        ],
        providers: [
          HttpRequestService,
          HttpClient,
          HttpHandler,
          QueryService,
          NgbModal,
          MessageBoxService,
          BlockUIService,
          { provide: MatDialogRef, useValue: dialogMock },
          { provide: MAT_DIALOG_DATA, useValue: data }
        ]
    })
    
    .compileComponents();
  });

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
    jest.spyOn(component.dialogRef, 'close');

    component.closePopup();

    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  describe('addNewSource', () => {
    it('should push successfully', fakeAsync(() => {
      component.sourceName = 'test';
      component.sportSelected = 50;
      jest.spyOn(queryService, 'add').mockReturnValue(of(successfulResult));
      jest.spyOn(component.dialogRef, 'close');

      component.addNewSource();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.dialogRef.close).toHaveBeenCalled();
    }));

    it('should push unsuccessfully and set error message', fakeAsync(() => {
      component.sourceName = 'test';
      jest.spyOn(queryService, 'add').mockReturnValue(of(unSuccessfulResult));

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