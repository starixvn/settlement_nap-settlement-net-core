import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Type } from '@angular/core';
import { ResultRowComponent } from './result-row.component';
import { EarlyStore } from '../../store/early.store';
import { VerificationService } from '../../services';
import { MatchDetail, ResultDetail, GroupMap, Permission } from '../../../shared/models/sportsbook-sop';
import { ResultStatus, TicketStatusText } from '../../../shared/constants';
import { NumberInputComponent, NumberInputOutSideComponent } from './number-input/number-input.component';
import { PlayerSelectionComponent, PlayerSelectionOutSideComponent } from './player-selection/player-selection.component';
import { TeamSelectionComponent, TeamSelectionOutSideComponent } from './team-selection/team-selection.component';
import { YesNoNoneComponent, YesNoNoneOutSideComponent } from './yesnonone/yes-no-none.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResultByTeamNamePipe } from '../../../shared/pipes/result-by-team-name.pipe';

describe('Component: ResultRowComponent', () => {
    let component: ResultRowComponent;
    let fixture: ComponentFixture<ResultRowComponent>;
    let earlyStore: EarlyStore;
    let verificationService: VerificationService;
    
    const matchDetail = new MatchDetail();
    matchDetail.homeName = 'Team A';
    matchDetail.awayName = 'Team B';
    matchDetail.matchId = 12345;
    
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = '6130110';
    resultDetail.inputType = 0;
    resultDetail.ticketStatus = TicketStatusText.running;
    resultDetail.resultStatus = ResultStatus.running;
    resultDetail.isScoreMismatched = false;
    
    const groupMap: GroupMap = {
      collapsed: false,
      checked: false,
      resultDetail: [resultDetail],
      isHoldResult: false,
      groupName: '',
      teamName: '',
      icon: ''
    }
    
    const permission = new Permission();

    beforeEach(waitForAsync(() => {
        const earlyStoreMock = {
            maxProviderCol: jest.fn().mockReturnValue(5),
            permission: jest.fn().mockReturnValue(permission),
            matchDetail: jest.fn().mockReturnValue(matchDetail)
        };
        
        const verificationServiceMock = {
            isValidTraderConfirmScore: jest.fn().mockReturnValue(true)
        };

        TestBed.configureTestingModule({
            imports: [
                MatTooltipModule,
                ResultRowComponent,
                ResultByTeamNamePipe
            ],
            providers: [
                { provide: EarlyStore, useValue: earlyStoreMock },
                { provide: VerificationService, useValue: verificationServiceMock }
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(ResultRowComponent);
            component = fixture.componentInstance;
            earlyStore = TestBed.inject(EarlyStore);
            verificationService = TestBed.inject(VerificationService);
            
            component.item = resultDetail;
            component.map = groupMap;
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should set input components on initialization', () => {
            component.ngOnInit();

            expect(component.inputComponent).toBeDefined();
            expect(component.inputOutSideComponent).toBeDefined();
        });
    });

    describe('getDropdownTooltip', () => {
        it('should return home team name when result is H', () => {
            const result = component.getDropdownTooltip(matchDetail, 'H', 5);

            expect(result).toBe(matchDetail.homeName);
        });

        it('should return away team name when result is A', () => {
            const result = component.getDropdownTooltip(matchDetail, 'A', 5);

            expect(result).toBe(matchDetail.awayName);
        });

        it('should return null when result is neither H nor A and text is short', () => {
            const result = component.getDropdownTooltip(matchDetail, 'X', 10);

            expect(result).toBeNull();
        });

        it('should return null when team name is shorter than max length', () => {
            matchDetail.homeName = 'ABC';
            
            const result = component.getDropdownTooltip(matchDetail, 'H', 10);

            expect(result).toBeNull();
        });

        it('should return team name when longer than max length', () => {
            matchDetail.homeName = 'Very Long Team Name';
            
            const result = component.getDropdownTooltip(matchDetail, 'H', 5);

            expect(result).toBe('Very Long Team Name');
        });
    });

    describe('getInputComponent', () => {
        it('should return TextBoxComponent when inputType is 0', () => {
            component.item.inputType = 0;

            const result = component.getInputComponent();

            expect(result).toBe(NumberInputComponent);
        });

        it('should return YesNoNoneComponent when inputType is 1', () => {
            component.item.inputType = 1;

            const result = component.getInputComponent();

            expect(result).toBe(YesNoNoneComponent);
        });

        it('should return PlayerSelectionComponent when inputType is 2', () => {
            component.item.inputType = 2;

            const result = component.getInputComponent();

            expect(result).toBe(PlayerSelectionComponent);
        });

        it('should return TeamSelectionComponent for default case', () => {
            component.item.inputType = 3;

            const result = component.getInputComponent();

            expect(result).toBe(TeamSelectionComponent);
        });
    });

    describe('getInputOutSideComponent', () => {
        it('should return TextBoxOutSideComponent when inputType is 0', () => {
            component.item.inputType = 0;

            const result = component.getInputOutSideComponent();

            expect(result).toBe(NumberInputOutSideComponent);
        });

        it('should return YesNoNoneOutSideComponent when inputType is 1', () => {
            component.item.inputType = 1;

            const result = component.getInputOutSideComponent();

            expect(result).toBe(YesNoNoneOutSideComponent);
        });

        it('should return PlayerSelectionOutSideComponent when inputType is 2', () => {
            component.item.inputType = 2;

            const result = component.getInputOutSideComponent();

            expect(result).toBe(PlayerSelectionOutSideComponent);
        });

        it('should return TeamSelectionOutSideComponent for default case', () => {
            component.item.inputType = 4;

            const result = component.getInputOutSideComponent();

            expect(result).toBe(TeamSelectionOutSideComponent);
        });
    });

    describe('getTextTooltip', () => {
        it('should return text when length exceeds maxLength', () => {
            const text = 'This is a long text';
            const maxLength = 10;

            const result = component.getTextTooltip(text, maxLength);

            expect(result).toBe(text);
        });

        it('should return null when text length is within maxLength', () => {
            const text = 'Short';
            const maxLength = 10;

            const result = component.getTextTooltip(text, maxLength);

            expect(result).toBeNull();
        });

        it('should return null when text is null or undefined', () => {
            const result1 = component.getTextTooltip(null, 10);
            const result2 = component.getTextTooltip(undefined, 10);

            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

        it('should return null when text length equals maxLength', () => {
            const text = 'ExactMatch';
            const maxLength = 10;

            const result = component.getTextTooltip(text, maxLength);

            expect(result).toBeNull();
        });
    });

    describe('getResultSettingIcon', () => {
        it('should return icon-yes when isHoldResult is true', () => {
            const result = component.getResultSettingIcon(true);

            expect(result).toBe('icon-yes');
        });

        it('should return icon-no when isHoldResult is false', () => {
            const result = component.getResultSettingIcon(false);

            expect(result).toBe('icon-no');
        });
    });

    describe('isChangeSetting', () => {
        it('should emit settingChanged event with correct data', () => {
            jest.spyOn(component.settingChanged, 'emit');
            const testItem = new ResultDetail();
            const testMap = groupMap;

            component.isChangeSetting(testItem, testMap);

            expect(component.settingChanged.emit).toHaveBeenCalledWith({ 
                item: testItem, 
                map: testMap 
            });
        });
    });

    describe('onChangeBetType', () => {
        it('should emit betTypeChanged event with correct data', () => {
            jest.spyOn(component.betTypeChanged, 'emit');
            const testItem = new ResultDetail();
            const testMap = groupMap;

            component.onChangeBetType(testItem, testMap);

            expect(component.betTypeChanged.emit).toHaveBeenCalledWith({ 
                item: testItem, 
                map: testMap 
            });
        });
    });

    describe('canSettleResult', () => {
        beforeEach(() => {
            resultDetail.isScoreMismatched = false;
            verificationService.isValidTraderConfirmScore = jest.fn().mockReturnValue(true);
        });

        it('should return true when ticket status is running and all conditions are met', () => {
            resultDetail.ticketStatus = TicketStatusText.running;
            resultDetail.resultStatus = ResultStatus.completed;

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(true);
        });

        it('should return true when result status is noResult and all conditions are met', () => {
            resultDetail.ticketStatus = TicketStatusText.calculated;
            resultDetail.resultStatus = ResultStatus.noResult;

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(true);
        });

        it('should return true when result status is running and all conditions are met', () => {
            resultDetail.ticketStatus = TicketStatusText.calculated;
            resultDetail.resultStatus = ResultStatus.running;

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(true);
        });

        it('should return false when score is mismatched', () => {
            resultDetail.ticketStatus = TicketStatusText.running;
            resultDetail.resultStatus = ResultStatus.running;
            resultDetail.isScoreMismatched = true;

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(false);
        });

        it('should return false when verification service returns false', () => {
            resultDetail.ticketStatus = TicketStatusText.running;
            resultDetail.resultStatus = ResultStatus.running;
            verificationService.isValidTraderConfirmScore = jest.fn().mockReturnValue(false);

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(false);
        });

        it('should return false when ticket and result status are not running', () => {
            resultDetail.ticketStatus = TicketStatusText.calculated;
            resultDetail.resultStatus = ResultStatus.completed;

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(false);
        });

        it('should call verification service with correct parameters', () => {
            resultDetail.ticketStatus = TicketStatusText.running;
            
            component.canSettleResult(resultDetail);

            expect(verificationService.isValidTraderConfirmScore).toHaveBeenCalledWith(resultDetail, false);
        });
    });

    describe('computed properties', () => {
        it('should return maxProviderCol from store', () => {
            const maxCol = component.maxProviderCol();

            expect(maxCol).toBe(5);
            expect(earlyStore.maxProviderCol).toHaveBeenCalled();
        });

        it('should return permission from store', () => {
            const perm = component.permission();

            expect(perm).toBe(permission);
            expect(earlyStore.permission).toHaveBeenCalled();
        });

        it('should return matchDetail from store', () => {
            const match = component.matchDetail();

            expect(match).toBe(matchDetail);
            expect(earlyStore.matchDetail).toHaveBeenCalled();
        });
    });

    describe('updateView', () => {
        it('should be callable without errors', () => {
            expect(() => component.updateView()).not.toThrow();
            expect(typeof component.updateView).toBe('function');
        });
    });
});
