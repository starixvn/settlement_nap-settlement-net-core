import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EarlySettlementComponent } from './early-settlement.component';
import { EarlySettlementStorage } from '../../services/early-settlement/early-settlement.storage';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { ToastrModule } from 'ngx-toastr';

describe('EarlySettlementComponent', () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;

  beforeEach(async () => {
    const mockEarlySettlementStorage = {
      getMatch: () => ({ resultDetails: [] }),
      getExternalResults: () => [],
      getResultChecked: () => [],
      isMatchSeries: () => false,
      isSdtSettle: () => false,
      isMercy: () => false,
      isSelectedMatch: () => false
    };

    const mockVerificationService = {
      isMismatchedWarning: () => false
    };

    await TestBed.configureTestingModule({
      imports: [EarlySettlementComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: EarlySettlementStorage, useValue: mockEarlySettlementStorage },
        { provide: VerificationBaseService, useValue: mockVerificationService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EarlySettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
