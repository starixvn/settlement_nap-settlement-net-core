import { FastMarketBetType } from '../constants';
import { FastMarketResult, SpecialSession } from '../models';
import { SpecialTimePipe } from './special-time-filter.pipe';

describe('Pipe: SpecialTimePipe', () => {
    let pipe: SpecialTimePipe;
    beforeEach(() => {
        pipe = new SpecialTimePipe();
    });

    describe('transform', () => {
        const timeMachine = new FastMarketResult();
        timeMachine.betType = FastMarketBetType.timeMachineOverUnder;
        const oneMinuteShow = new FastMarketResult();
        oneMinuteShow.betType = FastMarketBetType.nextOneMinute;
        oneMinuteShow.position = 10;
        const oneMinuteHide = new FastMarketResult();
        oneMinuteHide.betType = FastMarketBetType.nextOneMinute;
        oneMinuteHide.position = 45;
        const fiveMinuteShow = new FastMarketResult();
        fiveMinuteShow.betType = FastMarketBetType.nextFiveMinutes;
        fiveMinuteShow.position = 9;
        const fiveMinuteHide = new FastMarketResult();
        fiveMinuteHide.betType = FastMarketBetType.nextFiveMinutes;
        fiveMinuteHide.position = 45;
        let fastMarketResults: FastMarketResult[];

        beforeEach(() => {
            fastMarketResults = [timeMachine, oneMinuteShow, oneMinuteHide, fiveMinuteShow, fiveMinuteHide];
        });

        it('should return original when water break is not applied', () => {
            fastMarketResults = [];
            const waterBreak = new SpecialSession('');
            expect(pipe.transform(fastMarketResults, waterBreak)).toEqual([]);
        });

        describe('filterSuspendedTime', () => {
            it('should filter when resourceId is suspendedTime and start minute equals end minute', () => {
                const session = new SpecialSession('221SUS');
                session.apply = true;
                session.startMinute = 10;
                session.endMinute = 10;
                const result = pipe.transform(fastMarketResults, session);

                expect(result.filter(x => x.isShow).length).toEqual(2);
            });

            it('should filter when resourceId is suspendedTime and bettype = nextOneMinute', () => {
                const session = new SpecialSession('221SUS');
                session.apply = true;
                session.startMinute = 10;
                const result = pipe.transform([oneMinuteShow, fiveMinuteHide], session);
                expect(result.filter(x => x.isShow).length).toEqual(1);
            });

            it('should filter when resourceId is , suspendedTime > position and bettype = nextOneMinute', () => {
                const session = new SpecialSession('221SUS');
                session.apply = true;
                session.startMinute = 15;
                const result = pipe.transform([oneMinuteShow, fiveMinuteHide], session);
                expect(result.filter(x => x.isShow).length).toEqual(0);
            });

            it('should filter when resourceId is suspendedTime and bettype = fiveMinuteShow', () => {
                const session = new SpecialSession('221SUS');
                session.apply = true;
                session.startMinute = 10;
                const result = pipe.transform([fiveMinuteShow, fiveMinuteHide], session);
                expect(result.filter(x => x.isShow).length).toEqual(1);
            });
        })

        describe('filterWaterBreak', () => {
            it('should filter when water break is applied and start minute equals end minute', () => {
                const waterBreak = new SpecialSession('');
                waterBreak.apply = true;
                waterBreak.startMinute = 10;
                waterBreak.endMinute = 10;

                const result = pipe.transform(fastMarketResults, waterBreak);

                expect(result.filter(x => x.isShow).length).toEqual(2);
            });

            it('should filter when water break is applied and start minute lower than end minute', () => {
                const waterBreak = new SpecialSession('');
                waterBreak.apply = true;
                waterBreak.startMinute = 10;
                waterBreak.endMinute = 13;

                const result = pipe.transform(fastMarketResults, waterBreak);

                expect(result.filter(x => x.isShow).length).toEqual(2);
            });
        });
    })
});
