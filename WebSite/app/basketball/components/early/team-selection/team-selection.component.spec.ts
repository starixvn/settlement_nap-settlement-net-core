import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeamSelectionComponent, TeamSelectionOutSideComponent } from './team-selection.component';
import { EarlyStore } from '../../../store/early.store';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { ResultDetail, ExternalResultDetail, Permission } from '../../../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';

describe('Component: TeamSelectionComponent', () => {
    let component: TeamSelectionComponent;
    let fixture: ComponentFixture<TeamSelectionComponent>;
    let earlyStore: EarlyStore;
    let verificationBaseService: VerificationBaseService;
    
    const permission = new Permission();
    permission.isLeader = true;
    
    const resultDetail = new ResultDetail();
    resultDetail.homeValue = 'H';
    resultDetail.betType = '6130110';
    resultDetail.isResultWarning = false;

    beforeEach(waitForAsync(() => {
        const earlyStoreMock = {
            permission: jest.fn().mockReturnValue(permission),
            getHomeTeam: jest.fn().mockReturnValue('Home Team'),
            getAwayTeam: jest.fn().mockReturnValue('Away Team')
        };
        
        const verificationBaseServiceMock = {
            isEarlyMismatchedWarning: jest.fn().mockReturnValue(false)
        };

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                TeamSelectionComponent
            ],
            providers: [
                { provide: EarlyStore, useValue: earlyStoreMock },
                { provide: VerificationBaseService, useValue: verificationBaseServiceMock }
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TeamSelectionComponent);
            component = fixture.componentInstance;
            earlyStore = TestBed.inject(EarlyStore);
            verificationBaseService = TestBed.inject(VerificationBaseService);
            
            component.item = resultDetail;
            component.enable = true;
            component.updateView = jest.fn();
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('checkResultIsMatched', () => {
        it('should call verification service and set isScoreMismatched to true when mismatched', () => {
            verificationBaseService.isEarlyMismatchedWarning = jest.fn().mockReturnValue(true);
            const testResultDetail = new ResultDetail();

            component.checkResultIsMatched(testResultDetail);

            expect(verificationBaseService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(testResultDetail.isScoreMismatched).toBe(true);
        });

        it('should call verification service and set isScoreMismatched to false when not mismatched', () => {
            verificationBaseService.isEarlyMismatchedWarning = jest.fn().mockReturnValue(false);
            const testResultDetail = new ResultDetail();

            component.checkResultIsMatched(testResultDetail);

            expect(verificationBaseService.isEarlyMismatchedWarning).toHaveBeenCalledWith(testResultDetail);
            expect(testResultDetail.isScoreMismatched).toBe(false);
        });
    });

    it('should hide None option when hasNoneOption returns false', () => {
        component.item.betType = '604';
        fixture.detectChanges();
        
        const options = fixture.nativeElement.querySelectorAll('option');
        const noneOption = Array.from(options).find((option: HTMLOptionElement) => option.value === 'N');

        expect(noneOption).toBeUndefined();
    });

    it('should not apply warning class when isResultWarning is false', () => {
        component.item.isResultWarning = false;
        fixture.detectChanges();
        const selectElement = fixture.nativeElement.querySelector('select');

        expect(selectElement.classList.contains('warning')).toBe(false);
    });
});

describe('Component: TeamSelectionOutSideComponent', () => {
    let component: TeamSelectionOutSideComponent;
    let fixture: ComponentFixture<TeamSelectionOutSideComponent>;
    
    const resultDetail = new ResultDetail();
    resultDetail.betType = '6130110';
    
    const externalResult = {
      homeValue: 'A'
    };

    beforeEach(waitForAsync(() => {
        const earlyStoreMock = {
            getHomeTeam: jest.fn().mockReturnValue('Home Team'),
            getAwayTeam: jest.fn().mockReturnValue('Away Team')
        };

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatTooltipModule,
                TeamSelectionOutSideComponent
            ],
            providers: [
                { provide: EarlyStore, useValue: earlyStoreMock },
                VerificationBaseService,
                ResultByTeamNamePipe
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TeamSelectionOutSideComponent);
            component = fixture.componentInstance;
            
            component.resultDetail = resultDetail;
            component.externalResult = externalResult as ExternalResultDetail;
            component.enable = true;
            component.updateView = jest.fn();
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
    it('should hide None option when hasNoneOption returns false', () => {
        component.resultDetail.betType = '604';
        fixture.detectChanges();
        
        const options = fixture.nativeElement.querySelectorAll('option');
        const noneOption = Array.from(options).find((option: HTMLOptionElement) => option.value === 'N');

        expect(noneOption).toBeUndefined();
    });
});
