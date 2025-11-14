import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { signal } from '@angular/core';
import { TeamSelectionComponent, TeamSelectionOutSideComponent } from './team-selection.component';
import { EarlyStore } from '../../../store/early.store';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { ResultDetail, ExternalResultDetail, Permission } from '../../../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { MixMultiStatsService } from '../../../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../../../services/mix-double-double.service';
import { MixHeadHeadService } from '../../../services/mix-head-head.service';
import { MixCoreService } from '../../../services/mix-core.service';
import { MixPerformanceService } from '../../../services/performance-calculate/mix-performance.service';
import { createMockVerificationService, createMockMixMultiStatsService, createMockMixDoubleDoubleService, createMockMixHeadHeadService, createMockMixCoreService, createMockMixPerformanceService } from '../../../test-helpers/mock-services.native';

describe('Component: TeamSelectionComponent', () => {
    let component: TeamSelectionComponent;
    let fixture: ComponentFixture<TeamSelectionComponent>;
    let mockEarlyStore: jest.Mocked<EarlyStore>;
    let mockVerificationService: jest.Mocked<VerificationBaseService>;
    
    const permission = new Permission();
    permission.isLeader = true;
    
    const resultDetail = new ResultDetail();
    resultDetail.homeValue = 'H';
    resultDetail.betType = '6130110';
    resultDetail.isResultWarning = false;

    beforeEach(waitForAsync(() => {
        mockVerificationService = {
            isEarlyMismatchedWarning: jest.fn().mockReturnValue(false),
            autoFillEarlyResult: jest.fn(),
        } as any;

        mockEarlyStore = {
            permission: signal(permission),
            getHomeTeam: jest.fn().mockReturnValue('Home Team'),
            getAwayTeam: jest.fn().mockReturnValue('Away Team'),
            resultDetails: signal([]),
            finalResult: signal(null),
            matchDetail: signal(null),
        } as any;

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                TeamSelectionComponent
            ],
            providers: [
                { provide: EarlyStore, useValue: mockEarlyStore },
                { provide: VerificationBaseService, useValue: mockVerificationService },
                { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
                { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
                { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
                { provide: MixCoreService, useValue: createMockMixCoreService() },
                { provide: MixPerformanceService, useValue: createMockMixPerformanceService() }
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TeamSelectionComponent);
            component = fixture.componentInstance;
            component.item = resultDetail;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with correct team names from EarlyStore', () => {
        expect(component.homeTeam).toBe('Home Team');
        expect(component.awayTeam).toBe('Away Team');
        expect(mockEarlyStore.getHomeTeam).toHaveBeenCalled();
        expect(mockEarlyStore.getAwayTeam).toHaveBeenCalled();
    });

    it('should initialize with permission from EarlyStore', () => {
        expect(component.permission).toEqual(permission);
        expect(component.permission.isLeader).toBe(true);
    });

    describe('template rendering', () => {
        it('should render select dropdown with Home, Away, and None options', () => {
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            expect(select).toBeTruthy();
            
            const options = fixture.nativeElement.querySelectorAll('option');
            expect(options.length).toBe(4); // Empty option + Home + Away + None
            expect(options[1].value).toBe('H');
            expect(options[1].textContent.trim()).toBe('Home Team');
            expect(options[2].value).toBe('A');
            expect(options[2].textContent.trim()).toBe('Away Team');
            expect(options[3].value).toBe('N');
            expect(options[3].textContent.trim()).toBe('None');
        });

        it('should apply warning class when isResultWarning is true', () => {
            component.item.isResultWarning = true;
            fixture.detectChanges();
            const selectElement = fixture.nativeElement.querySelector('select');

            expect(selectElement.classList.contains('warning')).toBe(true);
        });

        it('should not apply warning class when isResultWarning is false', () => {
            component.item.isResultWarning = false;
            fixture.detectChanges();
            const selectElement = fixture.nativeElement.querySelector('select');

            expect(selectElement.classList.contains('warning')).toBe(false);
        });

        it('should enable select when enable is true and permission.isLeader is true', () => {
            component.enable = true;
            component.permission.isLeader = true;
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            expect(select.disabled).toBe(false);
        });

        it('should call checkResultIsMatched on value change', () => {
            const checkResultIsMatchedSpy = jest.spyOn(component, 'checkResultIsMatched');
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            select.value = 'A';
            select.dispatchEvent(new Event('ngModelChange'));

            expect(checkResultIsMatchedSpy).toHaveBeenCalledWith(component.item);
        });

        it('should update item.homeValue when option is selected', () => {
            component.item.homeValue = '';
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            select.value = 'H';
            select.dispatchEvent(new Event('change'));

            expect(component.item.homeValue).toBe('H');
        });
    });

    describe('checkResultIsMatched', () => {
        it('should call verification service and set isScoreMismatched to true when mismatched', () => {
            mockVerificationService.isEarlyMismatchedWarning = jest.fn().mockReturnValue(true);
            const testResultDetail = new ResultDetail();

            component.checkResultIsMatched(testResultDetail);

            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(testResultDetail.isScoreMismatched).toBe(true);
        });

        it('should call verification service and set isScoreMismatched to false when not mismatched', () => {
            mockVerificationService.isEarlyMismatchedWarning = jest.fn().mockReturnValue(false);
            const testResultDetail = new ResultDetail();

            component.checkResultIsMatched(testResultDetail);

            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(testResultDetail.isScoreMismatched).toBe(false);
        });

        it('should call autoFill services when checkResultIsMatched is called', () => {
            const mockMixMultiStatsService = TestBed.inject(MixMultiStatsService);
            const mockMixDoubleDoubleService = TestBed.inject(MixDoubleDoubleService);
            const mockMixHeadHeadService = TestBed.inject(MixHeadHeadService);
            const mockMixPerformanceService = TestBed.inject(MixPerformanceService);
            
            const testResultDetail = new ResultDetail();
            jest.clearAllMocks();

            component.checkResultIsMatched(testResultDetail);

            expect(mockMixMultiStatsService.autoFillMixReboundsAssists).toHaveBeenCalled();
            expect(mockMixDoubleDoubleService.autoFillMixDoubleDouble).toHaveBeenCalled();
            expect(mockMixHeadHeadService.autoFillMixHeadHead).toHaveBeenCalled();
            expect(mockMixPerformanceService.autoFillMixPerformance).toHaveBeenCalled();
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

describe('Component: TeamSelectionOutSideComponent', () => {
    let component: TeamSelectionOutSideComponent;
    let fixture: ComponentFixture<TeamSelectionOutSideComponent>;
    let mockEarlyStore: jest.Mocked<EarlyStore>;
    let mockVerificationService: jest.Mocked<VerificationBaseService>;
    
    const resultDetail = new ResultDetail();
    resultDetail.betType = '6130110';
    resultDetail.settlementStatusId = 1; // Running
    
    const externalResult = {
        homeValue: 'A'
    } as ExternalResultDetail;

    beforeEach(waitForAsync(() => {
        mockVerificationService = {
            isEarlyMismatchedWarning: jest.fn().mockReturnValue(false),
            autoFillEarlyResult: jest.fn(),
        } as any;

        mockEarlyStore = {
            getHomeTeam: jest.fn().mockReturnValue('Home Team'),
            getAwayTeam: jest.fn().mockReturnValue('Away Team'),
            resultDetails: signal([]),
            finalResult: signal(null),
            matchDetail: signal({ isSavedScore: true } as any),
        } as any;

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                TeamSelectionComponent
            ],
            providers: [
                { provide: EarlyStore, useValue: mockEarlyStore },
                { provide: VerificationBaseService, useValue: mockVerificationService },
                { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
                { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
                { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
                { provide: MixCoreService, useValue: createMockMixCoreService() },
                { provide: MixPerformanceService, useValue: createMockMixPerformanceService() },
                ResultByTeamNamePipe
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TeamSelectionOutSideComponent);
            component = fixture.componentInstance;
            
            component.resultDetail = resultDetail;
            component.externalResult = externalResult;
            component.enable = true;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with correct team names from EarlyStore', () => {
        expect(component.homeTeam).toBe('Home Team');
        expect(component.awayTeam).toBe('Away Team');
        expect(mockEarlyStore.getHomeTeam).toHaveBeenCalled();
        expect(mockEarlyStore.getAwayTeam).toHaveBeenCalled();
    });

    describe('template rendering', () => {
        it('should render select dropdown with Home, Away, and None options', () => {
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            expect(select).toBeTruthy();
            
            const options = fixture.nativeElement.querySelectorAll('option');
            expect(options.length).toBe(4); // Empty option + Home + Away + None
            expect(options[1].value).toBe('H');
            expect(options[1].textContent.trim()).toBe('Home Team');
            expect(options[2].value).toBe('A');
            expect(options[2].textContent.trim()).toBe('Away Team');
            expect(options[3].value).toBe('N');
            expect(options[3].textContent.trim()).toBe('None');
        });

        it('should enable select when enable is true', () => {
            component.enable = true;
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            expect(select.disabled).toBe(false);
        });

        it('should call verifyAndAutoFillResult on value change', () => {
            const verifyAndAutoFillResultSpy = jest.spyOn(component, 'verifyAndAutoFillResult');
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            select.value = 'H';
            select.dispatchEvent(new Event('ngModelChange'));

            expect(verifyAndAutoFillResultSpy).toHaveBeenCalledWith(component.resultDetail);
        });

        it('should update externalResult.homeValue when option is selected', () => {
            component.externalResult.homeValue = '';
            fixture.detectChanges();

            const select = fixture.nativeElement.querySelector('select');
            select.value = 'A';
            select.dispatchEvent(new Event('change'));

            expect(component.externalResult.homeValue).toBe('A');
        });
    });

    describe('verifyAndAutoFillResult', () => {
        it('should set isSavedScore to false on matchDetail', () => {
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = 1; // Running

            component.verifyAndAutoFillResult(testResultDetail);

            expect(mockEarlyStore.matchDetail().isSavedScore).toBe(false);
        });

        it('should clear homeValue and awayValue when settlementStatusId is not Calculated', () => {
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = 1; // Running
            testResultDetail.homeValue = 'H';
            testResultDetail.awayValue = 'A';

            component.verifyAndAutoFillResult(testResultDetail);

            expect(testResultDetail.homeValue).toBe('');
            expect(testResultDetail.awayValue).toBe('');
        });

        it('should call autoFillEarlyResult', () => {
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = 2; // Calculated

            component.verifyAndAutoFillResult(testResultDetail);

            expect(mockVerificationService.autoFillEarlyResult).toHaveBeenCalledWith(testResultDetail);
        });

        it('should call verification service and set isScoreMismatched', () => {
            mockVerificationService.isEarlyMismatchedWarning = jest.fn().mockReturnValue(true);
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = 2; // Calculated

            component.verifyAndAutoFillResult(testResultDetail);

            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(testResultDetail.isScoreMismatched).toBe(true);
        });

        it('should call autoFill services when verifyAndAutoFillResult is called', () => {
            const mockMixMultiStatsService = TestBed.inject(MixMultiStatsService);
            const mockMixDoubleDoubleService = TestBed.inject(MixDoubleDoubleService);
            const mockMixHeadHeadService = TestBed.inject(MixHeadHeadService);
            const mockMixPerformanceService = TestBed.inject(MixPerformanceService);
            
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = 2; // Calculated
            jest.clearAllMocks();

            component.verifyAndAutoFillResult(testResultDetail);

            expect(mockMixMultiStatsService.autoFillMixReboundsAssists).toHaveBeenCalled();
            expect(mockMixDoubleDoubleService.autoFillMixDoubleDouble).toHaveBeenCalled();
            expect(mockMixHeadHeadService.autoFillMixHeadHead).toHaveBeenCalled();
            expect(mockMixPerformanceService.autoFillMixPerformance).toHaveBeenCalled();
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
