import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { InputFinalBaseComponent, InputOutSideBaseComponent } from './input-base.component';
import { ResultDetail, ExternalResultDetail } from '../../../shared/models/sportsbook-sop';
import { EarlyResourcesIds } from '../../constants';

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
        TestBed.configureTestingModule({
            imports: [TestInputFinalComponent, TestInputOutSideComponent]
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
});
