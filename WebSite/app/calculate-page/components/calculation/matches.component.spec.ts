import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogBoxService, HttpRequestService, BlockUIService, MessageBoxService } from './../../../shared/services';
import { RequestService, HandleActionsService, BackGroundService, DetectChangesService, PopupService  } from './../../services';
import { MatchesComponent } from './matches.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material-module';
describe('MatchesComponent', () => {
  let component: MatchesComponent;
  let fixture: ComponentFixture<MatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchesComponent ],
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
    fixture = TestBed.createComponent(MatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }); 

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
