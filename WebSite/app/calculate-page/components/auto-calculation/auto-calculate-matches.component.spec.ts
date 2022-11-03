import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCalculateMatchesComponent } from './auto-calculate-matches.component';
import { DialogBoxService, HttpRequestService, BlockUIService, MessageBoxService } from './../../../shared/services';
import { RequestService, HandleActionsService, BackGroundService, DetectChangesService, PopupService  } from './../../services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material-module';

describe('MatchesComponent', () => {
  let component: AutoCalculateMatchesComponent;
  let fixture: ComponentFixture<AutoCalculateMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoCalculateMatchesComponent],
      providers: [
        BackGroundService,
        RequestService, 
        PopupService,
        BlockUIService,
        DialogBoxService,
        HandleActionsService,
        HttpRequestService,
        MessageBoxService,
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
    fixture = TestBed.createComponent(AutoCalculateMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
