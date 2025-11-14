import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NumberInputComponent, NumberInputOutSideComponent } from './number-input.component';
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
import { OnlyIntegerDirective } from '../../../../shared/directives/only-integer.directive.native';

describe('NumberInputComponent', () => {
  let component: NumberInputComponent;
  let fixture: ComponentFixture<NumberInputComponent>;
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
      imports: [NumberInputComponent, FormsModule, MatTooltipModule, OnlyIntegerDirective],
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
      fixture = TestBed.createComponent(NumberInputComponent);
      component = fixture.componentInstance;
      component.item = new ResultDetail();
      component.enable = true;
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render input field', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('should enable input when enable is true', () => {
      component.enable = true;

      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(false);
    });

    it('should have OnlyIntegerDirective applied', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.hasAttribute('myOnlyInteger') || input.getAttribute('ng-reflect-my-only-integer')).toBeTruthy();
    });
  });

  describe('value handling', () => {
    it('should handle empty value', () => {
      component.item.homeValue = '';
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('');
    });

  });
});

describe('NumberInputOutSideComponent', () => {
  let component: NumberInputOutSideComponent;
  let fixture: ComponentFixture<NumberInputOutSideComponent>;
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
      imports: [NumberInputOutSideComponent, FormsModule, MatTooltipModule, OnlyIntegerDirective],
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
      fixture = TestBed.createComponent(NumberInputOutSideComponent);
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
    it('should render input field', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('should enable input when enable is true', () => {
      component.enable = true;

      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(false);
    });


    it('should have OnlyIntegerDirective applied', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.hasAttribute('myOnlyInteger') || input.getAttribute('ng-reflect-my-only-integer')).toBeTruthy();
    });
  });

  describe('value handling', () => {

    it('should handle empty value', () => {
      component.externalResult.homeValue = '';
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('');
    });
  });
});
