import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RefundComponent } from './refund.component';
import { RefundStorage } from '../../services/refund/refund.storage';
import { ToastrModule } from 'ngx-toastr';

describe('RefundComponent', () => {
  let component: RefundComponent;
  let fixture: ComponentFixture<RefundComponent>;

  beforeEach(async () => {
    const mockRefundStorage = {
      getMatch: () => ({ resultDetails: [] }),
      getExternalResults: () => [],
      getResultChecked: () => [],
      isMatchSeries: () => false,
      isSdtSettle: () => false,
      isMercy: () => false,
      isSelectedMatch: () => false
    };

    await TestBed.configureTestingModule({
      imports: [RefundComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: RefundStorage, useValue: mockRefundStorage }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
