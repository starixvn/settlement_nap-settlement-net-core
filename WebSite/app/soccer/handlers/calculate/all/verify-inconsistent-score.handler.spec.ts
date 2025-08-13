import { TestBed } from '@angular/core/testing';
import { VerifyInconsistentScoreHandler } from './verify-inconsistent-score.handler';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { MessageBoxService } from '../../../../shared/services';
import { Language } from '../../../../shared/language.native';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { RequestService } from '../../../components/calc/services/request.service';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Match } from '../../../components/calc/models/match.model';
import { ResourceIds } from '../../../constants';
import { AbstractHandler } from '../../abstract.handler.native';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { ModalDialogMessage } from '../../../../shared/models';
import { HedgeMatchDetail, ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';

const mockConfirm = jest.fn(
  (
    dialogModel: ModalDialogMessage,
    func: () => void,
    rejectedFunc: () => void = null
  ) => {
    func();
  }
);

describe('VerifyInconsistentScoreHandler', () => {
  let handler: VerifyInconsistentScoreHandler;
  let verificationService: VerificationBaseService;
  let messageBoxService: MessageBoxService;
  let storage: CalculateBaseStorage;

  const permission = new Permission();
  const match: Match = {
    matchDetail: undefined,
    permission,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: new HedgeMatchDetail,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyInconsistentScoreHandler,
        VerificationBaseService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        RequestService,
        ResultByTeamNamePipe,
        {
          provide: MessageBoxService,
          useValue: {
            confirm: mockConfirm,
          },
        }
      ]
    });

    handler = TestBed.inject(VerifyInconsistentScoreHandler);
    verificationService = TestBed.inject(VerificationBaseService);
    messageBoxService = TestBed.inject(MessageBoxService);
    storage = TestBed.inject(CalculateStorage);
    
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getIsIgnoreCheckHt = jest.fn().mockReturnValue(false);
    storage.error = jest.fn();
    storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue(new ModalDialogMessage());
  });

  it('should call storage.error for non-leader when mismatch score exists', async () => {
    // Arrange
    const resultDetails = [
      { checked: true, resourceId: ResourceIds.fullTime },
      { checked: true, resourceId: ResourceIds.halfTime }
    ] as ResultDetail[];
    match.resultDetails = resultDetails;
    permission.isLeader = false;
    verificationService.isExistMismatchScore = jest.fn().mockReturnValue(true);

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.isExistMismatchScore).toHaveBeenCalledWith(resultDetails);
    expect(storage.error).toHaveBeenCalledWith(Language.eSports.nonLeader.mismatchedScore);
  });

  it('should set confirm message and call messageBoxService.confirm for leader when mismatch score exists', async () => {
    // Arrange
    const resultDetails = [
      { checked: true, resourceId: ResourceIds.fullTime },
      { checked: true, resourceId: ResourceIds.halfTime }
    ] as ResultDetail[];
    match.resultDetails = resultDetails;
    permission.isLeader = true;
    verificationService.isExistMismatchScore = jest.fn().mockReturnValue(true);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.isExistMismatchScore).toHaveBeenCalledWith(resultDetails);
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.eSports.leader.mismatchedScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.any(ModalDialogMessage),
      expect.any(Function)
    );
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should call super.handle when no mismatch score exists', async () => {
    // Arrange
    const resultDetails = [
      { checked: true, resourceId: ResourceIds.fullTime },
      { checked: true, resourceId: ResourceIds.halfTime }
    ] as ResultDetail[];
    match.resultDetails = resultDetails;
    verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.isExistMismatchScore).toHaveBeenCalledWith(resultDetails);
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should filter out half-time results when isIgnoreCheckHt is true', async () => {
    // Arrange
    const resultDetails = [
      { checked: true, resourceId: ResourceIds.fullTime },
      { checked: true, resourceId: ResourceIds.halfTime },
      { checked: false, resourceId: ResourceIds.goalRecord }
    ] as ResultDetail[];
    match.resultDetails = resultDetails;
    storage.getIsIgnoreCheckHt = jest.fn().mockReturnValue(true);
    verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    const expectedFilteredResults = [
      { checked: true, resourceId: ResourceIds.fullTime }
    ];

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.isExistMismatchScore).toHaveBeenCalledWith(expectedFilteredResults);
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should include all checked results when isIgnoreCheckHt is false', async () => {
    // Arrange
    const resultDetails = [
      { checked: true, resourceId: ResourceIds.fullTime },
      { checked: true, resourceId: ResourceIds.halfTime },
      { checked: false, resourceId: ResourceIds.goalRecord }
    ] as ResultDetail[];
    match.resultDetails = resultDetails;
    storage.getIsIgnoreCheckHt = jest.fn().mockReturnValue(false);
    verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    const expectedFilteredResults = [
      { checked: true, resourceId: ResourceIds.fullTime },
      { checked: true, resourceId: ResourceIds.halfTime }
    ];

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.isExistMismatchScore).toHaveBeenCalledWith(expectedFilteredResults);
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should handle empty result details', async () => {
    // Arrange
    match.resultDetails = [];
    verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.isExistMismatchScore).toHaveBeenCalledWith([]);
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });
});
