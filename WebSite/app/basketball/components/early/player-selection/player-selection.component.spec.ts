import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PlayerSelectionComponent, PlayerSelectionOutSideComponent } from './player-selection.component';
import { ResultDetail, ExternalResultDetail, MatchDetail, OddFlexModel, OddsInfoModel } from '../../../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { EarlyStore } from '../../../store/early.store';
import { MixMultiStatsService } from '../../../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../../../services/mix-double-double.service';
import { MixHeadHeadService } from '../../../services/mix-head-head.service';
import { MixPerformanceService } from '../../../services/performance-calculate/mix-performance.service';
import { createMockMixMultiStatsService, createMockMixDoubleDoubleService, createMockMixHeadHeadService, createMockMixCoreService, createMockMixPerformanceService } from '../../../test-helpers/mock-services.native';
import { MixCoreService } from '../../../services/mix-core.service';
import { signal } from '@angular/core';

describe('PlayerSelectionComponent', () => {
  let component: PlayerSelectionComponent;
  let fixture: ComponentFixture<PlayerSelectionComponent>;
  let mockEarlyStore: jest.Mocked<EarlyStore>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  const mockOddFlex: OddFlexModel[] = [
    {
      betChoice: 'player1',
      info: { playerName: 'Player One', playerId: 1 } as OddsInfoModel,
      resourceId: '',
      betType: 0,
      oddsInfo: ''
    },
    {
      betChoice: 'player2',
      info: { playerName: 'Player Two', playerId: 2 } as OddsInfoModel,
      resourceId: '',
      betType: 0,
      oddsInfo: ''
    },
    {
      betChoice: 'player3',
      info: { playerName: 'Player Three', playerId: 3 } as OddsInfoModel,
      resourceId: '',
      betType: 0,
      oddsInfo: ''
    }
  ];

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
      imports: [PlayerSelectionComponent, FormsModule],
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
      fixture = TestBed.createComponent(PlayerSelectionComponent);
      component = fixture.componentInstance;
      component.item = new ResultDetail();
      component.enable = true;
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create playerSelections from item.oddFlex', () => {
      component.item.oddFlex = mockOddFlex;

      component.ngOnInit();

      expect(component.playerSelections).toHaveLength(3);
      expect(component.playerSelections[0].betChoice).toBe('player1');
      expect(component.playerSelections[0].playerName).toBe('Player One');
      expect(component.playerSelections[1].betChoice).toBe('player2');
      expect(component.playerSelections[1].playerName).toBe('Player Two');
      expect(component.playerSelections[2].betChoice).toBe('player3');
      expect(component.playerSelections[2].playerName).toBe('Player Three');
    });

    it('should handle empty oddFlex array', () => {
      component.item.oddFlex = [];

      component.ngOnInit();

      expect(component.playerSelections).toHaveLength(0);
    });

    it('should handle null oddFlex', () => {
      component.item.oddFlex = null;

      component.ngOnInit();

      expect(component.playerSelections).toBeUndefined();
    });

    it('should handle undefined oddFlex', () => {
      component.item.oddFlex = undefined;

      component.ngOnInit();

      expect(component.playerSelections).toBeUndefined();
    });

    it('should handle oddFlex with missing info', () => {
      const oddFlexWithMissingInfo = [
        {
          betChoice: 'player1',
          info: null,
        },
        {
          betChoice: 'player2',
          info: { playerName: 'Player Two' } as OddsInfoModel,
        },
      ] as any;

      component.item.oddFlex = oddFlexWithMissingInfo;

      expect(() => {
        component.ngOnInit();
      }).toThrow();
    });
  });

  describe('template rendering', () => {
    it('should render None option', () => {
      component.item.oddFlex = mockOddFlex;
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('option');
      const noneOption = Array.from(options).find((opt: any) => opt.value === 'None');
      expect(noneOption).toBeTruthy();
      expect((noneOption as any).textContent.trim()).toBe('None');
    });

    it('should call checkResultIsMatched on value change', () => {
      component.item.oddFlex = mockOddFlex;
      component.item.homeValue = '';
      const checkResultIsMatchedSpy = jest.spyOn(component, 'checkResultIsMatched');

      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      select.value = 'player1';
      select.dispatchEvent(new Event('ngModelChange'));

      expect(checkResultIsMatchedSpy).toHaveBeenCalledWith(component.item);
    });
  });
});

describe('PlayerSelectionOutSideComponent', () => {
  let component: PlayerSelectionOutSideComponent;
  let fixture: ComponentFixture<PlayerSelectionOutSideComponent>;
  let mockEarlyStore: jest.Mocked<EarlyStore>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  const mockOddFlex: OddFlexModel[] = [
    {
      betChoice: 'player1',
      info: { playerName: 'Player One', playerId: 1 } as OddsInfoModel,
      resourceId: '',
      betType: 0,
      oddsInfo: ''
    },
    {
      betChoice: 'player2',
      info: { playerName: 'Player Two', playerId: 2 } as OddsInfoModel,
      resourceId: '',
      betType: 0,
      oddsInfo: ''
    }
  ];

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
      imports: [PlayerSelectionOutSideComponent, FormsModule],
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
      fixture = TestBed.createComponent(PlayerSelectionOutSideComponent);
      component = fixture.componentInstance;
      component.resultDetail = new ResultDetail();
      component.externalResult = new ExternalResultDetail(1, '00', 'Test');
      component.enable = true;
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create playerSelections from resultDetail.oddFlex', () => {
      component.resultDetail.oddFlex = mockOddFlex;

      component.ngOnInit();

      expect(component.playerSelections).toHaveLength(2);
      expect(component.playerSelections[0].betChoice).toBe('player1');
      expect(component.playerSelections[0].playerName).toBe('Player One');
      expect(component.playerSelections[1].betChoice).toBe('player2');
      expect(component.playerSelections[1].playerName).toBe('Player Two');
    });

    it('should handle empty oddFlex array', () => {
      component.resultDetail.oddFlex = [];

      component.ngOnInit();

      expect(component.playerSelections).toHaveLength(0);
    });

    it('should handle null oddFlex', () => {
      component.resultDetail.oddFlex = null;

      component.ngOnInit();

      expect(component.playerSelections).toBeUndefined();
    });

    it('should handle undefined oddFlex', () => {
      component.resultDetail.oddFlex = undefined;

      component.ngOnInit();

      expect(component.playerSelections).toBeUndefined();
    });
  });

  describe('template rendering', () => {
    it('should render None option', () => {
      component.resultDetail.oddFlex = mockOddFlex;
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('option');
      const noneOption = Array.from(options).find((opt: any) => opt.value === 'None');
      expect(noneOption).toBeTruthy();
      expect((noneOption as any).textContent.trim()).toBe('None');
    }); 

    it('should call verifyAndAutoFillResult on value change', () => {
      component.resultDetail.oddFlex = mockOddFlex;
      component.externalResult.homeValue = '';
      const verifyAndAutoFillResultSpy = jest.spyOn(component, 'verifyAndAutoFillResult');

      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select');
      select.value = 'player1';
      select.dispatchEvent(new Event('ngModelChange'));

      expect(verifyAndAutoFillResultSpy).toHaveBeenCalledWith(component.resultDetail);
    });
  });

  describe('createSelection', () => {
    it('should map oddFlex items to PlayerSelection objects correctly', () => {
      component.resultDetail.oddFlex = [
        {
          betChoice: 'choice1',
          info: { playerName: 'Test Player 1' } as OddsInfoModel,
        },
        {
          betChoice: 'choice2',
          info: { playerName: 'Test Player 2' } as OddsInfoModel,
        },
      ] as any;

      component.ngOnInit();

      expect(component.playerSelections[0].betChoice).toBe('choice1');
      expect(component.playerSelections[0].playerName).toBe('Test Player 1');
      expect(component.playerSelections[1].betChoice).toBe('choice2');
      expect(component.playerSelections[1].playerName).toBe('Test Player 2');
    });

    it('should handle single oddFlex item', () => {
      component.resultDetail.oddFlex = [
        {
          betChoice: 'single',
          info: { playerName: 'Single Player' } as OddsInfoModel,
        },
      ] as any;

      component.ngOnInit();

      expect(component.playerSelections).toHaveLength(1);
      expect(component.playerSelections[0].betChoice).toBe('single');
      expect(component.playerSelections[0].playerName).toBe('Single Player');
    });
  });
});
