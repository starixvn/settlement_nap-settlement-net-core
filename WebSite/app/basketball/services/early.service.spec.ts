import { cloneDeep } from 'lodash';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EarlyService } from './early.service';
import { MessageBoxService } from '../../shared/services';
import { MatchDetail, ResultDetail, GroupMap, Permission } from '../../shared/models/sportsbook-sop';
import { ResultSettingModel, ItemsSelect } from '../../shared/models';
import { Language } from '../../shared/language.native';

describe('Service: EarlyService', () => {
    let service: EarlyService;
    let messageBoxService: MessageBoxService;
    
    const matchDetail = new MatchDetail();
    matchDetail.homeId = 123;
    matchDetail.awayId = 456;
    matchDetail.homeName = 'Home Team';
    matchDetail.awayName = 'Away Team';
    
    const permission = new Permission();
    permission.isLeader = true;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                EarlyService,
                MessageBoxService,
                NgbModal
            ],
            imports: [
                HttpClientModule,
                NgbModule
            ]
        })
        .compileComponents()
        .then(() => {
            service = TestBed.inject(EarlyService);
            messageBoxService = TestBed.inject(MessageBoxService);
        });
    }));

    it('should create the service', () => {
        expect(service).toBeTruthy();
    });

    describe('getGroupMap', () => {
        let resultDetails: ResultDetail[];
        
        beforeEach(() => {
            const resultSettingData = new ResultSettingModel();
            resultSettingData.isHoldResult = false;
            
            const result1 = new ResultDetail();
            result1.groupName = 'Group 1';
            result1.resultSettingData = cloneDeep(resultSettingData);
            
            const result2 = new ResultDetail();
            result2.groupName = 'Group 1';
            result2.resultSettingData = cloneDeep(resultSettingData);
            
            const result3 = new ResultDetail();
            result3.groupName = 'Group 2';
            result3.resultSettingData = cloneDeep(resultSettingData);
            
            resultDetails = [result1, result2, result3];
        });

        it('should group results by groupName', () => {
            const maps = service.getGroupMap(resultDetails, matchDetail);

            expect(maps.length).toBe(2);
            expect(maps[0].resultDetail.length).toBe(2);
            expect(maps[1].resultDetail.length).toBe(1);
        });

        it('should create GroupMap objects with correct properties', () => {
            const maps = service.getGroupMap(resultDetails, matchDetail);

            expect(maps[0]).toBeInstanceOf(GroupMap);
            expect(maps[0].groupName).toBe('Group 1');
            expect(maps[0].isHoldResult).toBe(false);
            expect(maps[1].groupName).toBe('Group 2');
        });

        it('should set isHoldResult based on all results in group', () => {
            resultDetails[0].resultSettingData.isHoldResult = true;
            resultDetails[1].resultSettingData.isHoldResult = true;
            resultDetails[2].resultSettingData.isHoldResult = false;

            const maps = service.getGroupMap(resultDetails, matchDetail);

            expect(maps[0].isHoldResult).toBe(true); 
            expect(maps[1].isHoldResult).toBe(false); 
        });

        it('should replace team name placeholders with actual team names', () => {
            resultDetails[0].groupName = 'Team @teamName-123 vs Others';
            resultDetails[1].groupName = 'Team @teamName-123 vs Others';

            const maps = service.getGroupMap(resultDetails, matchDetail);

            expect(maps[0].groupName).toBe('Team Home Team vs Others');
            expect(maps[0].resultDetail[0].groupName).toBe('Team Home Team vs Others');
            expect(maps[0].resultDetail[1].groupName).toBe('Team Home Team vs Others');
        });

        it('should replace away team name placeholders', () => {
            resultDetails[0].groupName = 'Team @teamName-456 Score';

            const maps = service.getGroupMap(resultDetails, matchDetail);

            expect(maps[0].groupName).toBe('Team Away Team Score');
        });

        it('should not modify group names without team placeholders', () => {
            resultDetails[0].groupName = 'Normal Group Name';

            const maps = service.getGroupMap(resultDetails, matchDetail);

            expect(maps[0].groupName).toBe('Normal Group Name');
        });
    });

    describe('verifyBeforeCalculation', () => {
        let resultDetails: ResultDetail[];
        
        beforeEach(() => {
            const resultDetail1 = new ResultDetail();
            resultDetail1.homeValue = 'H';
            resultDetail1.resultSettingData = new ResultSettingModel();
            resultDetail1.resultSettingData.isConfirmedRefund = false;
            
            const resultDetail2 = new ResultDetail();
            resultDetail2.homeValue = 'A';
            resultDetail2.resultSettingData = new ResultSettingModel();
            resultDetail2.resultSettingData.isConfirmedRefund = false;
            
            resultDetails = [resultDetail1, resultDetail2];
        });

        it('should return error when selected result has confirmed refund', async () => {
            resultDetails[0].resultSettingData.isConfirmedRefund = true;

            const result = await service.verifyBeforeCalculation(resultDetails, true);

            expect(result).toBe(Language.confirmRefund.calculateResultNotConfirmed);
        });

        it('should return leader blank result error when invalid results and user is leader', async () => {
            resultDetails[0].homeValue = '';

            const result = await service.verifyBeforeCalculation(resultDetails, true);

            expect(result).toBe(Language.sop.leader.blankResult);
        });

        it('should return non-leader blank result error when invalid results and user is not leader', async () => {
            resultDetails[0].homeValue = '';

            const result = await service.verifyBeforeCalculation(resultDetails, false);

            expect(result).toBe(Language.sop.nonLeader.blankResult);
        });

        it('should return empty string when validation passes', async () => {
            const result = await service.verifyBeforeCalculation(resultDetails, true);

            expect(result).toBe('');
        });

        it('should set isResultWarning for invalid results during verification', async () => {
            resultDetails[0].homeValue = '';
            
            await service.verifyBeforeCalculation(resultDetails, true);

            expect(resultDetails[0].isResultWarning).toBe(true);
            expect(resultDetails[1].isResultWarning).toBe(false);
        });
    });

    describe('isInValidResultValue', () => {
        it('should return true when any result has warning', () => {
            const resultDetail1 = new ResultDetail();
            resultDetail1.isResultWarning = false;
            
            const resultDetail2 = new ResultDetail();
            resultDetail2.isResultWarning = true;

            const result = service.isInValidResultValue([resultDetail1, resultDetail2]);

            expect(result).toBe(true);
        });

        it('should return false when no results have warnings', () => {
            const resultDetail1 = new ResultDetail();
            resultDetail1.isResultWarning = false;
            
            const resultDetail2 = new ResultDetail();
            resultDetail2.isResultWarning = false;

            const result = service.isInValidResultValue([resultDetail1, resultDetail2]);

            expect(result).toBe(false);
        });

        it('should return false for empty array', () => {
            const result = service.isInValidResultValue([]);

            expect(result).toBe(false);
        });
    });

    describe('verifyResultValueForBetType', () => {
        it('should set isResultWarning true for empty homeValue', () => {
            const resultDetail1 = new ResultDetail();
            resultDetail1.homeValue = '';
            
            const resultDetail2 = new ResultDetail();
            resultDetail2.homeValue = null;
            
            const resultDetail3 = new ResultDetail();
            resultDetail3.homeValue = 'H';

            service.verifyResultValueForBetType([resultDetail1, resultDetail2, resultDetail3]);

            expect(resultDetail1.isResultWarning).toBe(true);
            expect(resultDetail2.isResultWarning).toBe(true);
            expect(resultDetail3.isResultWarning).toBe(false);
        });
    });

    describe('isEmptyHome', () => {
        it('should return true for null homeValue', () => {
            const resultDetail = new ResultDetail();
            resultDetail.homeValue = null;

            const result = service.isEmptyHome(resultDetail);

            expect(result).toBe(true);
        });

        it('should return true for empty string homeValue', () => {
            const resultDetail = new ResultDetail();
            resultDetail.homeValue = '';

            const result = service.isEmptyHome(resultDetail);

            expect(result).toBe(true);
        });

        it('should return false for valid homeValue', () => {
            const resultDetail = new ResultDetail();
            resultDetail.homeValue = 'H';

            const result = service.isEmptyHome(resultDetail);

            expect(result).toBe(false);
        });
    });

    describe('renderTicketStatus', () => {
        it('should return default ticket status options', () => {
            const result = service.renderTicketStatus();

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(3);
            expect(result[0]).toBeInstanceOf(ItemsSelect);
            expect(result[0].value).toBe('Running;');
            expect(result[0].text).toBe('Running');
            expect(result[0].checked).toBe(true);
        });

        it('should include bonus selections when provided', () => {
            const bonusSelections = [
                { id: 4, value: 'Bonus', text: 'Bonus Option' }
            ];

            const result = service.renderTicketStatus(bonusSelections);

            expect(result.length).toBe(4);
            expect(result[3].value).toBe('Bonus');
            expect(result[3].text).toBe('Bonus Option');
        });
    });

    describe('renderResultStatus', () => {
        it('should return result status options with leader permission', () => {
            const result = service.renderResultStatus(permission);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(7);
            expect(result.some(item => item.text === 'Confirmed Refund')).toBe(true);
        });

        it('should exclude leader-only options for non-leader', () => {
            permission.isLeader = false;

            const result = service.renderResultStatus(permission);

            expect(result.length).toBe(6);
            expect(result.some(item => item.text === 'Confirmed Refund')).toBe(false);
        });
    });

    describe('renderResultType', () => {
        it('should create selection options from group maps', () => {
            const groupMap1 = new GroupMap('Group 1', []);
            const groupMap2 = new GroupMap('Group 2', []);
            const groupMaps = [groupMap1, groupMap2];

            const result = service.renderResultType(groupMaps);

            expect(result.length).toBe(2);
            expect(result[0].value).toBe('Group 1');
            expect(result[0].text).toBe('Group 1');
            expect(result[0].checked).toBe(true);
            expect(result[1].value).toBe('Group 2');
        });
    });

    describe('getConfirmMessage', () => {
        it('should generate confirmation message for home team selection', () => {
            const resultDetail = new ResultDetail();
            resultDetail.homeValue = 'H';
            resultDetail.betTypeName = 'Winner';

            const result = service.getConfirmMessage([resultDetail], matchDetail);

            expect(result).toContain(Language.CalculationConfirmMessageEarly);
            expect(result).toContain('Winner: Home Team');
        });

        it('should generate confirmation message for away team selection', () => {
            const resultDetail = new ResultDetail();
            resultDetail.homeValue = 'A';
            resultDetail.betTypeName = 'Winner';

            const result = service.getConfirmMessage([resultDetail], matchDetail);

            expect(result).toContain('Winner: Away Team');
        });

        it('should generate confirmation message for none selection', () => {
            const resultDetail = new ResultDetail();
            resultDetail.homeValue = 'N';
            resultDetail.betTypeName = 'Winner';

            const result = service.getConfirmMessage([resultDetail], matchDetail);

            expect(result).toContain('Winner: None');
        });

        it('should handle multiple result details', () => {
            const resultDetail1 = new ResultDetail();
            resultDetail1.homeValue = 'H';
            resultDetail1.betTypeName = 'Winner';
            
            const resultDetail2 = new ResultDetail();
            resultDetail2.homeValue = 'A';
            resultDetail2.betTypeName = 'Total Points';

            const result = service.getConfirmMessage([resultDetail1, resultDetail2], matchDetail);

            expect(result).toContain('Winner: Home Team');
            expect(result).toContain('Total Points: Away Team');
        });
    });
});