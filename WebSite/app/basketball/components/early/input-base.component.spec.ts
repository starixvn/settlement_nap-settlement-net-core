import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { InputFinalBaseComponent, InputOutSideBaseComponent } from './input-base.component';
import { ResultDetail, ExternalResultDetail, MatchDetail } from '../../../shared/models/sportsbook-sop';
import { EarlyResourcesIds } from '../../constants';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { EarlyStore } from '../../store/early.store';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';
import { MixMultiStatsService } from '../../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../../services/mix-double-double.service';
import { MixHeadHeadService } from '../../services/mix-head-head.service';
import { MixCoreService } from '../../services/mix-core.service';
import { createMockVerificationService, createMockMixMultiStatsService, createMockMixDoubleDoubleService, createMockMixHeadHeadService, createMockMixCoreService, createMockMixPerformanceService } from '../../test-helpers/mock-services.native';
import { MixPerformanceService } from '../../services/performance-calculate/mix-performance.service';

@Component({
  template: '',
  standalone: true
})
class TestInputFinalComponent extends InputFinalBaseComponent {
    updateView = jest.fn();
}

@Component({
  template: '',
  standalone: true
})
class TestInputOutSideComponent extends InputOutSideBaseComponent {
    updateView = jest.fn();
}

describe('Component: InputBaseComponent', () => {
    let finalComponent: TestInputFinalComponent;
    let outSideComponent: TestInputOutSideComponent;
    let finalFixture: ComponentFixture<TestInputFinalComponent>;
    let outSideFixture: ComponentFixture<TestInputOutSideComponent>;
    
    const resultDetail = new ResultDetail();
    resultDetail.betType = '604';
    
    const externalResult = {
        homeValue: 'H'
    } as ExternalResultDetail;
    
    beforeEach(waitForAsync(() => {
        const mockVerificationService = {
            isEarlyMismatchedWarning: jest.fn(),
            autoFillEarlyResult: jest.fn()
        };
        
        const mockEarlyStore = {
            matchDetail: jest.fn().mockReturnValue({
                isSavedScore: true
            }),
            resultDetails: jest.fn().mockReturnValue([]),
            finalResult: jest.fn().mockReturnValue(new ResultDetail())
        };
        
        TestBed.configureTestingModule({
            imports: [TestInputFinalComponent, TestInputOutSideComponent],
            providers: [
                { provide: VerificationBaseService, useValue: mockVerificationService },
                { provide: EarlyStore, useValue: mockEarlyStore },
                { provide: MixMultiStatsService, useValue: createMockMixMultiStatsService() },
                { provide: MixDoubleDoubleService, useValue: createMockMixDoubleDoubleService() },
                { provide: MixHeadHeadService, useValue: createMockMixHeadHeadService() },
                { provide: MixCoreService, useValue: createMockMixCoreService() },
                { provide: MixPerformanceService, useValue: createMockMixPerformanceService() }
            ]
        })
        .compileComponents()
        .then(() => {
            finalFixture = TestBed.createComponent(TestInputFinalComponent);
            finalComponent = finalFixture.componentInstance;
            finalComponent.item = resultDetail;
            finalComponent.enable = true;
            
            outSideFixture = TestBed.createComponent(TestInputOutSideComponent);
            outSideComponent = outSideFixture.componentInstance;
            outSideComponent.resultDetail = resultDetail;
            outSideComponent.externalResult = externalResult;
            outSideComponent.enable = true;
        });
    }));

    it('should create InputFinalBaseComponent', () => {
        expect(finalComponent).toBeTruthy();
    });

    it('should create InputOutSideBaseComponent', () => {
        expect(outSideComponent).toBeTruthy();
    });

    describe('getDropdownTooltip', () => {
        it('should return home team name when result is H', () => {
            const result = finalComponent.getDropdownTooltip('H', 5, 'Team A', 'Team B');

            expect(result).toBe('Team A');
        });

        it('should return away team name when result is A', () => {
            const result = finalComponent.getDropdownTooltip('A', 5, 'Team A', 'Team B');

            expect(result).toBe('Team B');
        });

        it('should return null when result is neither H nor A and text is short', () => {
            const result = finalComponent.getDropdownTooltip('X', 10, 'Team A', 'Team B');

            expect(result).toBeNull();
        });

        it('should return null when team name is shorter than max length', () => {
            const result = finalComponent.getDropdownTooltip('H', 10, 'ABC', 'XYZ');

            expect(result).toBeNull();
        });

        it('should return team name when longer than max length', () => {
            const result = finalComponent.getDropdownTooltip('H', 5, 'Very Long Team Name', 'Team B');

            expect(result).toBe('Very Long Team Name');
        });
    });

    describe('getTextTooltip', () => {
        it('should return text when length exceeds maxLength', () => {
            const text = 'This is a long text';
            const maxLength = 10;

            const result = finalComponent.getTextTooltip(text, maxLength);

            expect(result).toBe(text);
        });

        it('should return null when text length is within maxLength', () => {
            const text = 'Short';
            const maxLength = 10;

            const result = finalComponent.getTextTooltip(text, maxLength);

            expect(result).toBeNull();
        });

        it('should return null when text is null or undefined', () => {
            const result1 = finalComponent.getTextTooltip(null, 10);
            const result2 = finalComponent.getTextTooltip(undefined, 10);

            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

        it('should return null when text length equals maxLength', () => {
            const text = 'ExactMatch';
            const maxLength = 10;

            const result = finalComponent.getTextTooltip(text, maxLength);

            expect(result).toBeNull();
        });
    });

    describe('checkResultIsMatched - InputFinalBaseComponent', () => {
        let mockVerificationService: any;

        beforeEach(() => {
            mockVerificationService = TestBed.inject(VerificationBaseService);
            jest.clearAllMocks();
        });

        it('should call verificationBaseService.isEarlyMismatchedWarning with correct parameter', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

            // Act
            finalComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledTimes(1);
        });

        it('should set isScoreMismatched to true when service returns true', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

            // Act
            finalComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBe(true);
        });

        it('should set isScoreMismatched to false when service returns false', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

            // Act
            finalComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBe(false);
        });
    });


   


    describe('Edge Cases', () => {
        it('should handle getDropdownTooltip with empty strings', () => {
            const result = finalComponent.getDropdownTooltip('H', 10, '', '');

            expect(result).toBeNull();
        });

        it('should handle getTextTooltip with zero maxLength', () => {
            const result = finalComponent.getTextTooltip('text', 0);

            expect(result).toBe('text');
        });

        it('should handle getTextTooltip with negative maxLength', () => {
            const result = finalComponent.getTextTooltip('text', -1);

            expect(result).toBe('text');
        });

        it('should handle checkResultIsMatched with undefined properties', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            const mockVerificationService = TestBed.inject(VerificationBaseService);
            jest.spyOn(mockVerificationService, 'isEarlyMismatchedWarning').mockReturnValue(undefined);

            // Act
            finalComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBeUndefined();
        });
    });

    describe('verifyAndAutoFillResult', () => {
        let mockVerificationService: any;


        beforeEach(() => {
            mockVerificationService = TestBed.inject(VerificationBaseService);
            jest.clearAllMocks();
        });

        it('should clear homeValue and awayValue when settlementStatusId is not Calculated', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = SettlementStatusId.Running;
            testResultDetail.homeValue = 'H';
            testResultDetail.awayValue = 'A';

            // Act
            outSideComponent.verifyAndAutoFillResult(testResultDetail);

            // Assert
            expect(testResultDetail.homeValue).toBe('');
            expect(testResultDetail.awayValue).toBe('');
        });

        it('should not clear homeValue and awayValue when settlementStatusId is Calculated', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            testResultDetail.homeValue = 'H';
            testResultDetail.awayValue = 'A';

            // Act
            outSideComponent.verifyAndAutoFillResult(testResultDetail);

            // Assert
            expect(testResultDetail.homeValue).toBe('H');
            expect(testResultDetail.awayValue).toBe('A');
        });

        it('should call autoFillEarlyResult', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = SettlementStatusId.Calculated;

            // Act
            outSideComponent.verifyAndAutoFillResult(testResultDetail);

            // Assert
            expect(mockVerificationService.autoFillEarlyResult).toHaveBeenCalledWith(testResultDetail);
        });

        it('should set isScoreMismatched to true when verification service returns true', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

            // Act
            outSideComponent.verifyAndAutoFillResult(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBe(true);
        });

        it('should set isScoreMismatched to false when verification service returns false', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            testResultDetail.settlementStatusId = SettlementStatusId.Calculated;
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

            // Act
            outSideComponent.verifyAndAutoFillResult(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBe(false);
        });
    });
});
