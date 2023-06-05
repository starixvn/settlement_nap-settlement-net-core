import { ResettleLogDetail } from './../models/resettle-log-detail.model';
import { Match } from "../models"
import { HandleResultService } from './handle-result.service';
import { BetType, BetTypeWithNo, MappingValue, MappingValueWithBettype } from '../constants/bet-type';
import { SportType } from '../../shared/constants';


describe('HandlerResultService', () => {
    let match = new Match();
    let log: ResettleLogDetail;
    describe('HandleResult', () => {
        beforeEach(() => {
            match = new Match();
            log = {
                userName: '',
                resourceId: '',
                resourceName: '',
                settlementDate: '',
                homeValue: '',
                awayValue: '',
                action: '',
                resultValue: '',
                betType: '',
                otherInfo: '',
                class: ''
            };
        })
        it('should show all value when existed', () => {
            log.homeValue = '1';
            log.awayValue = '2';

            const resultValue = HandleResultService.HandleResult(match, log, '', '');

            expect(resultValue).toEqual('1 - 2');
        });

        it('should show - when homeValue is empty', () => {
            log.homeValue = '';
            log.awayValue = '2';

            const resultValue = HandleResultService.HandleResult(match, log, '', '');

            expect(resultValue).toEqual('-');
        });

        it('should show playerName when log betType is select player betType', () => {
            log.homeValue = '01,03,04';
            log.betType = BetType.relatePlayer[0];
            log.otherInfo = 'mockInfo,mockInfo3,mockInfo4';
            match.sportType = SportType.cricket;
            match.playerNames = ['mockInfo,mockPlayer1', 'mockInfo2,mockPlayer2', 'mockInfo3,mockPlayer3', 'mockInfo4']

            const resultValue = HandleResultService.HandleResult(match, log, 'HomeName', 'AwayName');

            expect(resultValue).toEqual('01(mockPlayer1); 03(mockPlayer3); 04(mockInfo4)');
        });

        
        it('should show No when bettype has No option', () => {
            log.homeValue = 'N';
            log.betType = BetTypeWithNo[SportType.volleyBall][0];
            match.sportType = SportType.volleyBall;

            const resultValue = HandleResultService.HandleResult(match, log, 'HomeName', 'AwayName');

            expect(resultValue).toEqual('No');
        });

        it('should show No when bettype has No option', () => {
            log.homeValue = 'N';
            log.betType = 'mockBettype';
            match.sportType = SportType.volleyBall;

            const resultValue = HandleResultService.HandleResult(match, log, 'HomeName', 'AwayName');

            expect(resultValue).toEqual('None');
        });


        it('should show value from dictionary when dictionary special value include value', () => {
            log.homeValue = 'NB';
            match.sportType = SportType.volleyBall;

            const resultValue = HandleResultService.HandleResult(match, log, 'HomeName', 'AwayName');

            expect(resultValue).toEqual(MappingValue[log.homeValue]);
        });

        it('should show value from dictionary when dictionary with bettype include value', () => {
            log.homeValue = 'T';
            log.betType = '9113';

            const resultValue = HandleResultService.HandleResult(match, log, 'HomeName', 'AwayName');

            expect(resultValue).toEqual(MappingValueWithBettype[`${log.homeValue}-${log.betType}`]);
        });


        it('should show original value when value is no defined', () => {
            log.homeValue = 'mockValue';
            match.sportType = SportType.volleyBall;

            const resultValue = HandleResultService.HandleResult(match, log, 'HomeName', 'AwayName');

            expect(resultValue).toEqual('mockValue');
        });
    });
});