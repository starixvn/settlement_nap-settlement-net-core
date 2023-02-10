import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService, OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';

import { CalculatePopupComponent } from './calculate-popup.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';


describe('CalculatePopupComponent', () => {
  let component: CalculatePopupComponent;
  let fixture: ComponentFixture<CalculatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalculatePopupComponent,
        CommonModule,
        FormsModule,
        DatepickerComponent,
        StatusPipe,
        MatDialogModule,
        DragDropModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        OutrightService, HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService, CalculateService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ToastrService, useClass: ToastrService },
        ToastContainerDirective
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
