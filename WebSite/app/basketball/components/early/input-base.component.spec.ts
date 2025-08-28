import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { InputFinalBaseComponent, InputOutSideBaseComponent } from './input-base.component';
import { ResultDetail, ExternalResultDetail } from '../../../shared/models/sportsbook-sop';
import { EarlyResourcesIds } from '../../constants';
import { VerificationBaseService } from '../../../core/services/verification-base.service';

@Component({
  template: '',
  standalone: true
})
class TestInputFinalComponent extends InputFinalBaseComponent {}

@Component({
  template: '',
  standalone: true
})
class TestInputOutSideComponent extends InputOutSideBaseComponent {}

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
            isEarlyMismatchedWarning: jest.fn()
        };
        
        TestBed.configureTestingModule({
            imports: [TestInputFinalComponent, TestInputOutSideComponent],
            providers: [
                { provide: VerificationBaseService, useValue: mockVerificationService }
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

    describe('hasNoneOption', () => {
        it('should return false when betType is in fullTime resource ids', () => {
            const result = finalComponent.hasNoneOption(EarlyResourcesIds.fullTime[0]);

            expect(result).toBe(false);
        });

        it('should return true when betType is not in fullTime resource ids', () => {
            const result = finalComponent.hasNoneOption('other-bet-type');

            expect(result).toBe(true);
        });

        it('should return true for quarter resource ids', () => {
            const result = finalComponent.hasNoneOption(EarlyResourcesIds.q1[0]);

            expect(result).toBe(true);
        });
    });

    // Test the OutSide component shares the same base functionality
    describe('OutSideComponent - inherited methods', () => {
        it('should inherit getDropdownTooltip functionality', () => {
            const result = outSideComponent.getDropdownTooltip('H', 5, 'Home Team', 'Away Team');

            expect(result).toBe('Home Team');
        });

        it('should inherit getTextTooltip functionality', () => {
            const result = outSideComponent.getTextTooltip('Long text string', 5);

            expect(result).toBe('Long text string');
        });

        it('should inherit hasNoneOption functionality', () => {
            const result = outSideComponent.hasNoneOption('non-fulltime-bet');

            expect(result).toBe(true);
        });
    });

    describe('checkResultIsMatched - InputFinalBaseComponent', () => {
        let mockVerificationService: any;

        beforeEach(() => {
            mockVerificationService = finalComponent.verificationBaseService;
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

        it('should handle null result detail gracefully', () => {
            // Arrange
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

            // Act & Assert
            expect(() => finalComponent.checkResultIsMatched(null)).not.toThrow();
            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(null);
        });
    });

    describe('checkResultIsMatched - InputOutSideBaseComponent', () => {
        let mockVerificationService: any;

        beforeEach(() => {
            mockVerificationService = outSideComponent.verificationBaseService;
            jest.clearAllMocks();
        });

        it('should call verificationBaseService.isEarlyMismatchedWarning with correct parameter', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

            // Act
            outSideComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledTimes(1);
        });

        it('should set isScoreMismatched to true when service returns true', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

            // Act
            outSideComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBe(true);
        });

        it('should set isScoreMismatched to false when service returns false', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

            // Act
            outSideComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBe(false);
        });
    });

    describe('Input Properties - InputFinalBaseComponent', () => {
        it('should accept item input property', () => {
            // Arrange
            const newResultDetail = new ResultDetail();
            newResultDetail.betType = '123';

            // Act
            finalComponent.item = newResultDetail;

            // Assert
            expect(finalComponent.item).toBe(newResultDetail);
            expect(finalComponent.item.betType).toBe('123');
        });

        it('should accept enable input property', () => {
            // Act
            finalComponent.enable = false;

            // Assert
            expect(finalComponent.enable).toBe(false);

            // Act
            finalComponent.enable = true;

            // Assert
            expect(finalComponent.enable).toBe(true);
        });

        it('should have verificationBaseService injected', () => {
            // Assert
            expect(finalComponent.verificationBaseService).toBeDefined();
            expect(finalComponent.verificationBaseService).toBeTruthy();
        });
    });

    describe('Input Properties - InputOutSideBaseComponent', () => {
        it('should accept resultDetail input property', () => {
            // Arrange
            const newResultDetail = new ResultDetail();
            newResultDetail.betType = '456';

            // Act
            outSideComponent.resultDetail = newResultDetail;

            // Assert
            expect(outSideComponent.resultDetail).toBe(newResultDetail);
            expect(outSideComponent.resultDetail.betType).toBe('456');
        });

        it('should accept externalResult input property', () => {
            // Arrange
            const newExternalResult = { homeValue: 'A' } as ExternalResultDetail;

            // Act
            outSideComponent.externalResult = newExternalResult;

            // Assert
            expect(outSideComponent.externalResult).toBe(newExternalResult);
            expect(outSideComponent.externalResult.homeValue).toBe('A');
        });

        it('should accept enable input property', () => {
            // Act
            outSideComponent.enable = false;

            // Assert
            expect(outSideComponent.enable).toBe(false);

            // Act
            outSideComponent.enable = true;

            // Assert
            expect(outSideComponent.enable).toBe(true);
        });

        it('should have verificationBaseService injected', () => {
            // Assert
            expect(outSideComponent.verificationBaseService).toBeDefined();
            expect(outSideComponent.verificationBaseService).toBeTruthy();
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

        it('should handle hasNoneOption with null or undefined betType', () => {
            const result1 = finalComponent.hasNoneOption(null);
            const result2 = finalComponent.hasNoneOption(undefined);

            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });

        it('should handle checkResultIsMatched with undefined properties', () => {
            // Arrange
            const testResultDetail = new ResultDetail();
            const mockVerificationService = finalComponent.verificationBaseService;
            jest.spyOn(mockVerificationService, 'isEarlyMismatchedWarning').mockReturnValue(undefined);

            // Act
            finalComponent.checkResultIsMatched(testResultDetail);

            // Assert
            expect(testResultDetail.isScoreMismatched).toBeUndefined();
        });
    });
});
