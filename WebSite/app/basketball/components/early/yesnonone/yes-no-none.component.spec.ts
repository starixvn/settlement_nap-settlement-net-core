import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { YesNoNoneComponent, YesNoNoneOutSideComponent } from './yes-no-none.component';
import { ResultDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { EarlyStore } from '../../../store/early.store';
import { MixMultiStatsService } from '../../../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../../../services/mix-double-double.service';
import { MixHeadHeadService } from '../../../services/mix-head-head.service';
import { MixPerformanceService } from '../../../services/performance-calculate/mix-performance.service';
import { createMockMixMultiStatsService, createMockMixDoubleDoubleService, createMockMixHeadHeadService, createMockMixCoreService, createMockMixPerformanceService } from '../../../test-helpers/mock-services.native';
import { MixCoreService } from '../../../services/mix-core.service';
import { signal } from '@angular/core';

describe('YesNoNoneComponent', () => {
  let component: YesNoNoneComponent;
  let fixture: ComponentFixture<YesNoNoneComponent>;
  let mockEarlyStore: jest.Mocked<EarlyStore>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  beforeEach(waitForAsync(() => {
    mockVerificationService = {
      isEarlyMismatchedWarning: jest.fn(),
      autoFillEarlyResult: jest.fn(),
    } as any;

    mockEarlyStore = {
      matchDetail: signal(null),
      resultDetails: signal([]),
      finalResult: signal(null),
    } as any;

    TestBed.configureTestingModule({
      imports: [YesNoNoneComponent, FormsModule],
      providers: [
        { provide: VerificationBaseService, useValue: mockVerificationService },
        { provide: EarlyStore, useValue: mockEarlyStore },
        { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
        { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
        { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
        { provide: MixCoreService, useValue: createMockMixCoreService() },
        { provide: MixPerformanceService, useValue: createMockMixPerformanceService() },
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(YesNoNoneComponent);
      component = fixture.componentInstance;
      component.item = new ResultDetail();
      component.enable = true;
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render select dropdown with Yes, No, and None options', () => {
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      expect(select).toBeTruthy();
      
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options.length).toBe(4); // Empty option + Yes + No + None
      expect(options[1].value).toBe('Y');
      expect(options[1].textContent.trim()).toBe('Yes');
      expect(options[2].value).toBe('N');
      expect(options[2].textContent.trim()).toBe('No');
      expect(options[3].value).toBe('None');
      expect(options[3].textContent.trim()).toBe('None');
    });

    it('should enable select when enable is true', () => {
      component.enable = true;

      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      expect(select.disabled).toBe(false);
    });

    it('should call checkResultIsMatched on value change', () => {
      component.item.homeValue = '';
      const checkResultIsMatchedSpy = jest.spyOn(component, 'checkResultIsMatched');

      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      select.value = 'Y';
      select.dispatchEvent(new Event('ngModelChange'));

      expect(checkResultIsMatchedSpy).toHaveBeenCalledWith(component.item);
    });

    it('should update item.homeValue when option is selected', () => {
      component.item.homeValue = '';
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      select.value = 'N';
      select.dispatchEvent(new Event('change'));

      expect(component.item.homeValue).toBe('N');
    });
  });

  describe('value handling', () => {
    it('should handle empty value', () => {
      component.item.homeValue = '';
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      expect(select.value).toBe('');
    });
  });
});

describe('YesNoNoneOutSideComponent', () => {
  let component: YesNoNoneOutSideComponent;
  let fixture: ComponentFixture<YesNoNoneOutSideComponent>;
  let mockEarlyStore: jest.Mocked<EarlyStore>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  beforeEach(waitForAsync(() => {
    mockVerificationService = {
      isEarlyMismatchedWarning: jest.fn(),
      autoFillEarlyResult: jest.fn(),
    } as any;

    mockEarlyStore = {
      matchDetail: signal(null),
      resultDetails: signal([]),
      finalResult: signal(null),
    } as any;

    TestBed.configureTestingModule({
      imports: [YesNoNoneOutSideComponent, FormsModule],
      providers: [
        { provide: VerificationBaseService, useValue: mockVerificationService },
        { provide: EarlyStore, useValue: mockEarlyStore },
        { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
        { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
        { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
        { provide: MixCoreService, useValue: createMockMixCoreService() },
        { provide: MixPerformanceService, useValue: createMockMixPerformanceService() },
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(YesNoNoneOutSideComponent);
      component = fixture.componentInstance;
      component.resultDetail = new ResultDetail();
      component.externalResult = new ExternalResultDetail(1, '00', 'Test');
      component.enable = true;
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render select dropdown with Yes, No, and None options', () => {
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      expect(select).toBeTruthy();
      
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options.length).toBe(4); // Empty option + Yes + No + None
      expect(options[1].value).toBe('Y');
      expect(options[1].textContent.trim()).toBe('Yes');
      expect(options[2].value).toBe('N');
      expect(options[2].textContent.trim()).toBe('No');
      expect(options[3].value).toBe('None');
      expect(options[3].textContent.trim()).toBe('None');
    });

    it('should enable select when enable is true', () => {
      component.enable = true;

      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      expect(select.disabled).toBe(false);
    });

    it('should call verifyAndAutoFillResult on value change', () => {
      component.externalResult.homeValue = '';
      const verifyAndAutoFillResultSpy = jest.spyOn(component, 'verifyAndAutoFillResult');

      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      select.value = 'Y';
      select.dispatchEvent(new Event('ngModelChange'));

      expect(verifyAndAutoFillResultSpy).toHaveBeenCalledWith(component.resultDetail);
    });

    it('should update externalResult.homeValue when option is selected', () => {
      component.externalResult.homeValue = '';
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      select.value = 'N';
      select.dispatchEvent(new Event('change'));

      expect(component.externalResult.homeValue).toBe('N');
    });
  });

  describe('value handling', () => {
    it('should handle empty value', () => {
      component.externalResult.homeValue = '';
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      expect(select.value).toBe('');
    });
  });
});
