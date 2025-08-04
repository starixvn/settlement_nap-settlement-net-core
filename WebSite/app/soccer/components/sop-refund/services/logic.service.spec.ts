import { LogicService } from './logic.service';
import { TestBed } from '@angular/core/testing';
import { RefundStorage } from '../../../storage/refund.storage';
import { MessageBoxService } from '../../../../shared/services';
import { CalculateAction } from '../../../../shared/constants';
import { ResourceIds } from '../../../constants/resourceIds.native';
import { ScoreSourceType, SettlementStatusId } from '../../../../shared/constants';
import { ResultDetail } from '../../../models';
import { ToastrModule } from 'ngx-toastr';
import { Language } from '../../../../shared/language.native';
import { MatchDetail } from '../../refund/model/match.model';

describe('Soccer - LogicService', () => {
    let service: LogicService;
    let refundStorage: RefundStorage;
    let messageBoxService: MessageBoxService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LogicService,
                RefundStorage,
                MessageBoxService,
            ],
            imports: [
                ToastrModule.forRoot()
            ]
        });

        service = TestBed.inject(LogicService);
        refundStorage = TestBed.inject(RefundStorage);
        messageBoxService = TestBed.inject(MessageBoxService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getActionName', () => {
        it('should return refund when both HT and FT resources are selected', () => {
            // Arrange
            const selectedResources = [
                { resourceId: ResourceIds.halfTime },
                { resourceId: ResourceIds.fullTime }
            ] as any;
            jest.spyOn(refundStorage, 'getSelectedResource').mockReturnValue(selectedResources);

            // Act
            const result = service.getActionName();

            // Assert
            expect(result).toBe(CalculateAction.refund);
        });

        it('should return refundHalfTime when only HT resource is selected', () => {
            // Arrange
            const selectedResources = [
                { resourceId: ResourceIds.halfTime }
            ] as any;
            jest.spyOn(refundStorage, 'getSelectedResource').mockReturnValue(selectedResources);

            // Act
            const result = service.getActionName();

            // Assert
            expect(result).toBe(CalculateAction.refundHalfTime);
        });

        it('should return refundFullTime when only FT resource is selected', () => {
            // Arrange
            const selectedResources = [
                { resourceId: ResourceIds.fullTime }
            ] as any;
            jest.spyOn(refundStorage, 'getSelectedResource').mockReturnValue(selectedResources);

            // Act
            const result = service.getActionName();

            // Assert
            expect(result).toBe(CalculateAction.refundFullTime);
        });

        it('should return undefined when no resources are selected', () => {
            // Arrange
            const selectedResources = [];
            jest.spyOn(refundStorage, 'getSelectedResource').mockReturnValue(selectedResources);

            // Act
            const result = service.getActionName();

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('showConfirmMessage', () => {
        it('should call messageBoxService.confirm with confirm message and callback', () => {
            // Arrange
            const confirmMessage = { title: 'Test', message: 'Test confirm message' } as any;
            messageBoxService.confirm = jest.fn();
            jest.spyOn(refundStorage, 'getConfirmMessage').mockReturnValue(confirmMessage);

            // Act
            service.showConfirmMessage(() => { });

            // Assert
            expect(messageBoxService.confirm).toHaveBeenCalledWith(confirmMessage, expect.any(Function));
        });
    });

    describe('closePopup', () => {
        it('should call messageBoxService.closePopup', () => {
            // Arrange
            messageBoxService.closePopup = jest.fn();

            // Act
            service.closePopup();

            // Assert
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        });
    });

    describe('closePopupNotChanged', () => {
        it('should call messageBoxService.closePopupNotChanged', () => {
            // Arrange
            messageBoxService.closePopupNotChanged = jest.fn();

            // Act
            service.closePopupNotChanged();

            // Assert
            expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
        });
    });

    describe('resetScore', () => {
        it('should reset scores for non-calculated and non-abandoned results', () => {
            // Arrange
            const resultDetails = [
                {
                    settlementStatusId: SettlementStatusId.Running,
                    homeValue: '1',
                    awayValue: '0',
                    resultSettingData: { isConfirmedRefundSdt: false }
                },
                {
                    settlementStatusId: SettlementStatusId.Calculated,
                    homeValue: '2',
                    awayValue: '1',
                    resultSettingData: { isConfirmedRefundSdt: false }
                }
            ];
            const externalResults = [];
            const permission = { isLeader: false };

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                resultDetails,
                externalResults,
                permission
            } as any);

            // Act
            service.resetScore();

            // Assert
            expect(resultDetails[0].homeValue).toBe('');
            expect(resultDetails[0].awayValue).toBe('');
            expect(resultDetails[1].homeValue).toBe('2'); // Should not be reset
            expect(resultDetails[1].awayValue).toBe('1'); // Should not be reset
        });

        it('should set confirmed refund SDT scores when user is leader', () => {
            // Arrange
            const resultDetails = [
                {
                    resourceId: ResourceIds.halfTime,
                    settlementStatusId: SettlementStatusId.Running,
                    homeValue: '',
                    awayValue: '',
                    resultSettingData: { isConfirmedRefundSdt: true }
                }
            ];
            const externalResults = [
                {
                    sourceId: ScoreSourceType.confirmRefundSource,
                    resultDetails: [
                        {
                            resourceId: ResourceIds.halfTime,
                            homeValue: '3',
                            awayValue: '2'
                        }
                    ]
                }
            ];
            const permission = { isLeader: true };

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                resultDetails,
                externalResults,
                permission
            } as any);

            // Act
            service.resetScore();

            // Assert
            expect(resultDetails[0].homeValue).toBe('3');
            expect(resultDetails[0].awayValue).toBe('2');
        });
    });

    describe('autoSelect', () => {
        it('should auto-select results when user is leader and conditions are met', () => {
            // Arrange
            const resultDetails = [
                {
                    checked: false,
                    settlementStatusId: SettlementStatusId.Running,
                    resultSettingData: { isConfirmedRefundSdt: true }
                },
                {
                    checked: false,
                    settlementStatusId: SettlementStatusId.Running,
                    resultSettingData: { isConfirmedRefund: true }
                },
                {
                    checked: false,
                    settlementStatusId: SettlementStatusId.Running,
                    resultSettingData: { isConfirmedRefundSdt: false, isConfirmedRefund: false }
                }
            ];
            const permission = { isLeader: true };
            const matchDetail = { isMarkedRefundAll: false };

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                resultDetails,
                permission,
                matchDetail
            } as any);

            // Act
            service.autoSelect();

            // Assert
            expect(resultDetails[0].checked).toBe(true);
            expect(resultDetails[1].checked).toBe(true);
            expect(resultDetails[2].checked).toBe(false);
        });

        it('should auto-select marked refund all results when isMarkedRefundAll is true', () => {
            // Arrange
            const resultDetails = [
                {
                    checked: false,
                    settlementStatusId: SettlementStatusId.Running,
                    resultSettingData: { isConfirmedRefundSdt: false, isConfirmedRefund: false }
                }
            ];
            const permission = { isLeader: true };
            const matchDetail = { isMarkedRefundAll: true };

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                resultDetails,
                permission,
                matchDetail
            } as any);

            // Act
            service.autoSelect();

            // Assert
            expect(resultDetails[0].checked).toBe(true);
        });

        it('should not auto-select when user is not leader', () => {
            // Arrange
            const resultDetails = [
                {
                    checked: false,
                    settlementStatusId: SettlementStatusId.Running,
                    resultSettingData: { isConfirmedRefundSdt: true }
                }
            ];
            const permission = { isLeader: false };
            const matchDetail = { isMarkedRefundAll: false };

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                resultDetails,
                permission,
                matchDetail
            } as any);

            // Act
            service.autoSelect();

            // Assert
            expect(resultDetails[0].checked).toBe(false);
        });
    });

    describe('autoSelectGoalRecordAndSettleDetermined', () => {
        it('should set goal record when confirmed goal record exists and user is leader', () => {
            // Arrange
            const externalResults = [
                {
                    sourceId: ScoreSourceType.confirmRefundSource,
                    resultDetails: [
                        {
                            resourceId: ResourceIds.goalRecord,
                            homeValue: '5'
                        }
                    ]
                }
            ];
            const permission = { isLeader: true };
            const matchDetail = { goalRecord: '', applyGoalRecord: false, isSettleDetermined: false };
            const resultDetails = [];

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                externalResults,
                permission,
                matchDetail,
                resultDetails
            } as any);

            // Act
            service.autoSelectGoalRecordAndSettleDetermined();

            // Assert
            expect(matchDetail.goalRecord).toBe('5');
            expect(matchDetail.applyGoalRecord).toBe(true);
        });

        it('should set isSettleDetermined to true when confirmed refund SDT exists', () => {
            // Arrange
            const externalResults = [];
            const permission = { isLeader: false };
            const matchDetail = { goalRecord: '', applyGoalRecord: false, isSettleDetermined: false };
            const resultDetails = [
                {
                    resultSettingData: { isConfirmedRefundSdt: true }
                }
            ];

            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                externalResults,
                permission,
                matchDetail,
                resultDetails
            } as any  );

            // Act
            service.autoSelectGoalRecordAndSettleDetermined();

            // Assert
            expect(matchDetail.isSettleDetermined).toBe(true);
        });
    });

    describe('settleDetermineUpdate', () => {
        it('should disable both HT and FT when settleDeterminableTickets is false', () => {
            // Arrange
            const halfTime = { isEnabled: true, checked: false } as ResultDetail;
            const fullTime = { isEnabled: true, checked: false } as ResultDetail;
            const matchDetail = { isSettleDetermined: false } as MatchDetail;

            jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue(halfTime);
            jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue(fullTime);
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                matchDetail
            } as any);

            // Act
            service.settleDetermineUpdate();

            // Assert
            expect(halfTime.isEnabled).toBe(false);
            expect(fullTime.isEnabled).toBe(false);
        });

        it('should disable FT and enable HT when both are checked', () => {
            // Arrange
            const halfTime = { isEnabled: false, checked: true } as ResultDetail;
            const fullTime = { isEnabled: true, checked: true } as ResultDetail;
            const matchDetail = { isSettleDetermined: true } as MatchDetail;

            jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue(halfTime);
            jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue(fullTime);
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                matchDetail
            } as any);

            // Act
            service.settleDetermineUpdate();

            // Assert
            expect(halfTime.isEnabled).toBe(true);
            expect(fullTime.isEnabled).toBe(false);
        });

        it('should enable FT and disable HT when only FT is checked', () => {
            // Arrange
            const halfTime = { isEnabled: true, checked: false } as ResultDetail;
            const fullTime = { isEnabled: false, checked: true } as ResultDetail;
            const matchDetail = { isSettleDetermined: true } as MatchDetail;

            jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue(halfTime);
            jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue(fullTime);
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue({
                matchDetail
            } as any);

            // Act
            service.settleDetermineUpdate();

            // Assert
            expect(halfTime.isEnabled).toBe(false);
            expect(fullTime.isEnabled).toBe(true);
        });
    });

    describe('createContentSpecificBetTypes', () => {
        it('should return both BetDaq and BetFair when both are settle determined', () => {
            // Arrange
            const betDaq = { settleDeterminedBetDaq: true } as any;
            const betFair = { settleDeterminedBetFair: true } as any;

            // Act
            const result = service.createContentSpecificBetTypes(betDaq, betFair);

            // Assert
            expect(result).toContain(Language.specificBetType.betFair);
            expect(result).toContain(Language.specificBetType.betDaq);
        });

        it('should return only BetDaq when only BetDaq is settle determined', () => {
            // Arrange
            const betDaq = { settleDeterminedBetDaq: true } as any;
            const betFair = { settleDeterminedBetFair: false } as any;

            // Act
            const result = service.createContentSpecificBetTypes(betDaq, betFair);

            // Assert
            expect(result).toBe(Language.specificBetType.betDaq);   
            expect(result).not.toBe(Language.specificBetType.betFair);
        });

        it('should return only BetFair when only BetFair is settle determined', () => {
            // Arrange
            const betDaq = { settleDeterminedBetDaq: false } as any;
            const betFair = { settleDeterminedBetFair: true } as any;

            // Act
            const result = service.createContentSpecificBetTypes(betDaq, betFair);

            // Assert
            expect(result).toBe(Language.specificBetType.betFair);
            expect(result).not.toBe(Language.specificBetType.betDaq);
        });

        it('should return empty string when neither is settle determined', () => {
            // Arrange
            const betDaq = { settleDeterminedBetDaq: false } as any;
            const betFair = { settleDeterminedBetFair: false } as any;

            // Act
            const result = service.createContentSpecificBetTypes(betDaq, betFair);

            // Assert
            expect(result).toBe('');
          });
    });

    describe('getMarkRemainTicket', () => {
        it('should return formatted string with bet ticket', () => {
            // Arrange
            const betTicket = '12345';

            // Act
            const result = service.getMarkRemainTicket(betTicket);

            // Assert
            expect(result).toContain(betTicket);
        });
    });
}); 