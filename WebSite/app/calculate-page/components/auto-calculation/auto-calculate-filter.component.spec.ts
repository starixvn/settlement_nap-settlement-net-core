import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCalculateFilterComponent } from './auto-calculate-filter.component';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent, NewMultipleSelectComponent } from "../../../shared/components";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { RequestService } from '../../services';
import { BackGroundService, DetectChangesService  } from './../../services';
import { MaterialModule } from '../../../shared/material-module';
import { AutoCalculateService } from './auto-calculate.service';

describe('AutoCalculateFilterComponent', () => {
  let component: AutoCalculateFilterComponent;
  let fixture: ComponentFixture<AutoCalculateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoCalculateFilterComponent,
        DatepickerComponent,
        ModalDialogComponent,
        NewMultipleSelectComponent],
      providers: [
        MessageBoxService,
        VerifyDateService,
        RequestService,
        HttpRequestService,
        BlockUIService,
        BackGroundService,
        DetectChangesService,
        AutoCalculateService
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule
    ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCalculateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
