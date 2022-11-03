import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent, NewMultipleSelectComponent } from "../../../shared/components";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilterComponent } from './filter.component';
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { RequestService } from '../../services';
import { GenerateFilterService, BackGroundService, DetectChangesService  } from './../../services';
import { MaterialModule } from '../../../shared/material-module';
describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        FilterComponent,
        DatepickerComponent,
        ModalDialogComponent,
        NewMultipleSelectComponent ],
      providers: [
        MessageBoxService,
        VerifyDateService,
        RequestService,
        GenerateFilterService,
        HttpRequestService,
        BlockUIService,
        BackGroundService,
        DetectChangesService
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
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
