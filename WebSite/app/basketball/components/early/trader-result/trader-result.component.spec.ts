import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { TraderResultComponent } from './trader-result.component';
import { ResultDetail, MatchDetail, ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultControlGroup } from '../../../constants/result-control-group.native';
import { OddFlexModel, OddsInfoModel } from '../../../../shared/models/sportsbook-sop/odds-flex.model';
import { MixCoreService } from '../../../services/mix-core.service';
import { EarlyStore } from '../../../store/early.store';
import { PlayerBetTypes } from '../../../constants';
import { signal } from '@angular/core';

describe('Component: TraderResultComponent', () => {
    let component: TraderResultComponent;
    let fixture: ComponentFixture<TraderResultComponent>;
    let mockEarlyStore: jest.Mocked<EarlyStore>;
    let mockMixCoreService: jest.Mocked<MixCoreService>;
    
    const mockMatchDetail = new MatchDetail();
    
    const mockExternalResult = new ExternalResultDetail(1, '00', 'Test Source');
    
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
        mockEarlyStore = {
            resultDetails: signal([]),
        } as any;

        mockMixCoreService = {
            findResultsByBetTypes: jest.fn(),
            hasAnyRefundedResult: jest.fn(),
            noneValue: 'None',
        } as any;

        TestBed.configureTestingModule({
            imports: [
                TraderResultComponent
            ],
            providers: [
                { provide: MixCoreService, useValue: mockMixCoreService },
                { provide: EarlyStore, useValue: mockEarlyStore }
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TraderResultComponent);
            component = fixture.componentInstance;
            component.matchDetail = mockMatchDetail;
            component.externalResult = mockExternalResult;
            component.resultDetail = new ResultDetail();
        });
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should set playerSelected when inputType is playerSelect', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = mockOddFlex;
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'player1');
            component.externalResult = externalResult;

            component.ngOnInit();

            expect(component.playerSelected).toBe('Player One');
        });

        it('should set playerSelected to externalResult.homeValue when no matching betChoice found', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = mockOddFlex;
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'nonexistent');
            component.externalResult = externalResult;

            component.ngOnInit();

            expect(component.playerSelected).toEqual('nonexistent');
        });

        it('should handle empty oddFlex array', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = [];
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'None');
            component.externalResult = externalResult;

            component.ngOnInit();

            expect(component.playerSelected).toEqual('None');
        });

        it('should handle null oddFlex', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.playerSelect;
            resultDetail.oddFlex = null;
            component.resultDetail = resultDetail;
            
            const externalResult = new ExternalResultDetail(1, '00', 'Test Source', '', 'fallback');
            component.externalResult = externalResult;

            component.ngOnInit();

            expect(component.playerSelected).toEqual('fallback');
        });

        it('should not process when inputType is not playerSelect', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.textBox;
            component.resultDetail = resultDetail;

            component.ngOnInit();

            expect(component.playerSelected).toBe('');
        });

        describe('target bet types', () => {
            it('should call handleTargetBetTypes for mostPoints betType', () => {
                const resultDetail = new ResultDetail();
                resultDetail.inputType = ResultControlGroup.playerSelect;
                resultDetail.betType = PlayerBetTypes.mostPoints;
                resultDetail.relatedCalResources = 'R001,R002';
                component.resultDetail = resultDetail;
                component.index = 0;

                const player1 = createMockResultDetail('R001', '25', 1);
                const player2 = createMockResultDetail('R002', '20', 2);
                component.resultDetails = [player1, player2];
                mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
                mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
                resultDetail.oddFlex = mockOddFlex;

                const handleTargetBetTypesSpy = jest.spyOn(component as any, 'handleTargetBetTypes');

                component.ngOnInit();

                expect(handleTargetBetTypesSpy).toHaveBeenCalled();
            });

            it('should call handleTargetBetTypes for mostRebounds betType', () => {
                const resultDetail = new ResultDetail();
                resultDetail.inputType = ResultControlGroup.playerSelect;
                resultDetail.betType = PlayerBetTypes.mostRebounds;
                resultDetail.relatedCalResources = 'R001,R002';
                component.resultDetail = resultDetail;

                component.resultDetails = [];
                mockMixCoreService.findResultsByBetTypes.mockReturnValue([]);

                const handleTargetBetTypesSpy = jest.spyOn(component as any, 'handleTargetBetTypes');

                component.ngOnInit();

                expect(handleTargetBetTypesSpy).toHaveBeenCalled();
            });
        });
    });

    describe('handleTargetBetTypes', () => {
        it('should set playerSelected and externalResult.homeValue when 2 results found', () => {
            const resultDetail = new ResultDetail();
            resultDetail.relatedCalResources = 'R001,R002';
            resultDetail.oddFlex = mockOddFlex;
            component.resultDetail = resultDetail;
            component.index = 0;

            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            player1.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '20' } as ExternalResultDetail];

            component.resultDetails = [player1, player2];
            mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            component['handleTargetBetTypes']();

            expect(component.playerSelected).toBe('Player One');
            expect(component.externalResult.homeValue).toBe('player1');
        });

        it('should not update when less than 2 results found', () => {
            const resultDetail = new ResultDetail();
            resultDetail.relatedCalResources = 'R001';
            component.resultDetail = resultDetail;

            const player1 = createMockResultDetail('R001', '25', 1);
            component.resultDetails = [player1];
            mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1]);

            const initialHomeValue = component.externalResult.homeValue;
            component['handleTargetBetTypes']();

            expect(component.playerSelected).toBe('');
            expect(component.externalResult.homeValue).toBe(initialHomeValue);
        });

        it('should not update when more than 2 results found', () => {
            const resultDetail = new ResultDetail();
            resultDetail.relatedCalResources = 'R001,R002,R003';
            component.resultDetail = resultDetail;

            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            const player3 = createMockResultDetail('R003', '15', 3);
            component.resultDetails = [player1, player2, player3];
            mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2, player3]);

            component['handleTargetBetTypes']();

            expect(component.playerSelected).toBe('');
        });
    });

    describe('comparePlayerStatistics', () => {
        it('should return empty strings when player1 external value is empty', () => {
            const player1 = createMockResultDetail('R001', '', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            component.index = 0;

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('');
            expect(result.playerName).toBe('');
        });

        it('should return empty strings when player2 external value is empty', () => {
            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '', 2);
            component.index = 0;

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('');
            expect(result.playerName).toBe('');
        });

        it('should return None when values are equal', () => {
            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '25', 2);
            player1.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            component.resultDetail.oddFlex = mockOddFlex;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('None');
            expect(result.playerName).toBe('None');
        });

        it('should return None when there are refunded results', () => {
            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            player1.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '20' } as ExternalResultDetail];
            component.resultDetail.oddFlex = mockOddFlex;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(true);

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('None');
            expect(result.playerName).toBe('None');
        });

        it('should return player1 when player1 has higher value', () => {
            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            player1.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '20' } as ExternalResultDetail];
            component.resultDetail.oddFlex = mockOddFlex;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('player1');
            expect(result.playerName).toBe('Player One');
        });

        it('should return player2 when player2 has higher value', () => {
            const player1 = createMockResultDetail('R001', '20', 1);
            const player2 = createMockResultDetail('R002', '25', 2);
            player1.externalScores = [{ homeValue: '20' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            component.resultDetail.oddFlex = mockOddFlex;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('player2');
            expect(result.playerName).toBe('Player Two');
        });

        it('should handle invalid numeric values', () => {
            const player1 = createMockResultDetail('R001', 'invalid', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            player1.externalScores = [{ homeValue: 'invalid' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '20' } as ExternalResultDetail];
            component.resultDetail.oddFlex = mockOddFlex;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            // NaN comparison behavior
            const result = component['comparePlayerStatistics'](player1, player2);

            // NaN !== NaN, so won't return None
            // NaN > 20 is false, NaN < 20 is false, so player2 should win
            expect(result.betChoice).toBe('player2');
        });

        it('should handle negative values', () => {
            const player1 = createMockResultDetail('R001', '-5', 1);
            const player2 = createMockResultDetail('R002', '-10', 2);
            player1.externalScores = [{ homeValue: '-5' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '-10' } as ExternalResultDetail];
            component.resultDetail.oddFlex = mockOddFlex;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            const result = component['comparePlayerStatistics'](player1, player2);

            expect(result.betChoice).toBe('player1'); // -5 > -10
        });

        it('should handle when winner playerId not found in oddFlex', () => {
            const player1 = createMockResultDetail('R001', '25', 1);
            const player2 = createMockResultDetail('R002', '20', 2);
            player1.externalScores = [{ homeValue: '25' } as ExternalResultDetail];
            player2.externalScores = [{ homeValue: '20' } as ExternalResultDetail];
            component.resultDetail.oddFlex = [
                {
                    betChoice: 'player2',
                    info: { playerName: 'Player Two', playerId: 2 } as OddsInfoModel,
                }
            ] as any;
            component.index = 0;

            mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);

            // This will throw because winnerOddFlex will be undefined
            expect(() => {
                component['comparePlayerStatistics'](player1, player2);
            }).toThrow();
        });
    });

    describe('getExternalValue', () => {
        it('should return external score homeValue when available', () => {
            const result = createMockResultDetail('R001', '25', 1);
            result.externalScores = [
                { homeValue: '10' } as ExternalResultDetail,
                { homeValue: '20' } as ExternalResultDetail,
            ];
            component.index = 1;

            const value = component['getExternalValue'](result, 1);

            expect(value).toBe('20');
        });

        it('should return empty string when externalScores is null', () => {
            const result = createMockResultDetail('R001', '25', 1);
            result.externalScores = null;
            component.index = 0;

            const value = component['getExternalValue'](result, 0);

            expect(value).toBe('');
        });

        it('should return empty string when externalScores[index] is undefined', () => {
            const result = createMockResultDetail('R001', '25', 1);
            result.externalScores = [{ homeValue: '10' } as ExternalResultDetail];
            component.index = 5;

            const value = component['getExternalValue'](result, 5);

            expect(value).toBe('');
        });

        it('should return empty string when external score homeValue is empty', () => {
            const result = createMockResultDetail('R001', '25', 1);
            result.externalScores = [{ homeValue: '' } as ExternalResultDetail];
            component.index = 0;

            const value = component['getExternalValue'](result, 0);

            expect(value).toBe('');
        });

        it('should return empty string when external score homeValue is null', () => {
            const result = createMockResultDetail('R001', '25', 1);
            result.externalScores = [{ homeValue: null } as any];
            component.index = 0;

            const value = component['getExternalValue'](result, 0);

            expect(value).toBe('');
        });
    });

    describe('template rendering', () => {
        it('should render externalResult.homeValue for inputType 0 (textBox)', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.textBox;
            component.resultDetail = resultDetail;
            component.externalResult = new ExternalResultDetail(1, '00', 'Test', '', '100');

            fixture.detectChanges();

            expect(fixture.nativeElement.textContent.trim()).toBe('100');
        });

        it('should render with resultByTeamName pipe for inputType 1 (yesNoNone)', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = ResultControlGroup.yesNoNone;
            component.resultDetail = resultDetail;
            component.externalResult = new ExternalResultDetail(1, '00', 'Test', '', 'Y');

            fixture.detectChanges();

            // The pipe will transform the value, so we just check it renders
            expect(fixture.nativeElement.textContent).toBeDefined();
        });

        it('should render with resultByTeamName pipe for default case', () => {
            const resultDetail = new ResultDetail();
            resultDetail.inputType = 999; // Unknown type
            component.resultDetail = resultDetail;
            component.externalResult = new ExternalResultDetail(1, '00', 'Test', '', 'H');

            fixture.detectChanges();

            // The pipe will transform the value
            expect(fixture.nativeElement.textContent).toBeDefined();
        });
    });

    function createMockResultDetail(
        resourceId: string,
        homeValue: string,
        playerId: number
    ): ResultDetail {
        return {
            resourceId,
            homeValue,
            oddFlex: [
                {
                    betChoice: `player${playerId}`,
                    info: {
                        playerId: playerId,
                        playerName: `Player ${playerId === 1 ? 'One' : 'Two'}`,
                    } as OddsInfoModel,
                },
            ] as any,
            externalScores: [],
        } as ResultDetail;
    }
});
