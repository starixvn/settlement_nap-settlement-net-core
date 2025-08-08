import { TestBed } from '@angular/core/testing';
import { SaveOutsideScoreHandler } from './save-outside-score.handler';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { RequestService } from '../../../components/calc/services/request.service';
import { MessageBoxService } from '../../../../shared/services';
import { Language } from '../../../../shared/language.native';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { ExternalResultDetail, SaveScoreQuery } from '../../../../shared/models/sportsbook-sop';
import { ModalDialogMessage } from '../../../../shared/models';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { Match, MatchDetailSoccer } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { HedgeMatchDetail, ResultDetail } from '../../../../shared/models/sportsbook-sop';

const mockConfirm = jest.fn(
  (
    dialogModel: ModalDialogMessage,
    func: () => void,
    rejectedFunc: () => void = null
  ) => {
    func();
  }
);

describe('SaveOutsideScoreHandler', () => {
  let handler: SaveOutsideScoreHandler;
  let verificationService: VerificationBaseService;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;
  let storage: CalculateBaseStorage;

  const matchDetail = {
    matchId: 12345
  } as MatchDetailSoccer;

  const resultDetails = [
    {
      resourceId: '01',
      homeValue: '2',
      awayValue: '1',
      checked: true
    } as ResultDetail,
    {
      resourceId: '02',
      homeValue: '1',
      awayValue: '0',
      checked: false
    } as ResultDetail
  ];

  const originalResultDetail = [
    {
      resourceId: '01',
      homeValue: '1',
      awayValue: '1',
      checked: false
    } as ResultDetail,
    {
      resourceId: '02',
      homeValue: '1',
      awayValue: '0',
      checked: false
    } as ResultDetail
  ];

  const match: Match = {
    matchDetail,
    resultDetails,
    originalResultDetail,
    permission: new Permission(),
    ticketCounts: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    oldMatchDetail: new HedgeMatchDetail,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  const changedScores = [
    {
      resourceId: '01',
      homeValue: '2',
      awayValue: '1'
    }
  ] as ExternalResultDetail[];

  const checkedScores = [
    {
      resourceId: '01',
      homeValue: '2',
      awayValue: '1'
    }
  ] as ExternalResultDetail[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        SaveOutsideScoreHandler,
        VerificationBaseService,
        RequestService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        ResultByTeamNamePipe,
        {
          provide: MessageBoxService,
          useValue: {
            confirm: mockConfirm,
          },
        }
      ]
    });

    handler = TestBed.inject(SaveOutsideScoreHandler);
    verificationService = TestBed.inject(VerificationBaseService);
    requestService = TestBed.inject(RequestService);
    messageBoxService = TestBed.inject(MessageBoxService);
    storage = TestBed.inject(CalculateStorage);
    
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue(new ModalDialogMessage());
    storage.error = jest.fn();

    verificationService.getChangedScores = jest.fn().mockReturnValue(changedScores);
    verificationService.getOutsideScores = jest.fn().mockReturnValue(checkedScores);

    // Reset mock call history
    jest.clearAllMocks();
    
    // Reset checked status
    resultDetails[0].checked = true;
    resultDetails[1].checked = false;
  });

  it('should set confirm message and call messageBoxService.confirm', async () => {
    // Arrange
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.sop.saveScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.any(ModalDialogMessage),
      expect.any(Function)
    );
  });

  it('should get changed scores and outside scores from verification service', async () => {
    // Arrange
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.getChangedScores).toHaveBeenCalledWith(resultDetails, originalResultDetail);
    expect(verificationService.getOutsideScores).toHaveBeenCalledWith(resultDetails);
  });

  it('should call saveOutsideScore with correct query parameters', async () => {
    // Arrange
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    const expectedQuery: SaveScoreQuery = {
      matchId: matchDetail.matchId,
      scoresToSave: changedScores,
      checkedScores: checkedScores,
      apiKey: ""
    };

    // Act
    await handler.handle(storage);

    // Assert
    expect(requestService.saveOutsideScore).toHaveBeenCalledWith(expectedQuery);
  });

  it('should uncheck all result details when save is successful', async () => {
    // Arrange
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    // Act
    await handler.handle(storage);

    // Assert
    expect(resultDetails[0].checked).toBe(false);
    expect(resultDetails[1].checked).toBe(false);
    expect(storage.error).not.toHaveBeenCalled();
  });

  it('should call storage.error when save fails', async () => {
    // Arrange
    const errorResult = { isSuccessful: false, errMsg: 'Save failed' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(errorResult);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).toHaveBeenCalledWith('Save failed');
    expect(resultDetails[0].checked).toBe(true); // Should remain checked
    expect(resultDetails[1].checked).toBe(false);
  });

  it('should preserve original checked status when save fails', async () => {
    // Arrange
    resultDetails[0].checked = true;
    resultDetails[1].checked = true;
    const errorResult = { isSuccessful: false, errMsg: 'Network error' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(errorResult);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).toHaveBeenCalledWith('Network error');
    expect(resultDetails[0].checked).toBe(true);
    expect(resultDetails[1].checked).toBe(true);
  });

  it('should handle empty changed scores', async () => {
    // Arrange
    const emptyChangedScores: any[] = [];
    verificationService.getChangedScores = jest.fn().mockReturnValue(emptyChangedScores);
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    const expectedQuery: SaveScoreQuery = {
      matchId: matchDetail.matchId,
      scoresToSave: emptyChangedScores,
      checkedScores: checkedScores,
      apiKey: ""
    };

    // Act
    await handler.handle(storage);

    // Assert
    expect(requestService.saveOutsideScore).toHaveBeenCalledWith(expectedQuery);
  });

  it('should handle empty checked scores', async () => {
    // Arrange
    const emptyCheckedScores: any[] = [];
    verificationService.getOutsideScores = jest.fn().mockReturnValue(emptyCheckedScores);
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    const expectedQuery: SaveScoreQuery = {
      matchId: matchDetail.matchId,
      scoresToSave: changedScores,
      checkedScores: emptyCheckedScores,
      apiKey: ""
    };

    // Act
    await handler.handle(storage);

    // Assert
    expect(requestService.saveOutsideScore).toHaveBeenCalledWith(expectedQuery);
  });

  it('should handle case when no result details are present', async () => {
    // Arrange
    const matchWithEmptyResults = {
      ...match,
      resultDetails: [],
      originalResultDetail: []
    };
    storage.getMatch = jest.fn().mockReturnValue(matchWithEmptyResults);
    verificationService.getChangedScores = jest.fn().mockReturnValue([]);
    verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);

    // Act
    await handler.handle(storage);

    // Assert
    expect(verificationService.getChangedScores).toHaveBeenCalledWith([], []);
    expect(verificationService.getOutsideScores).toHaveBeenCalledWith([]);
    expect(requestService.saveOutsideScore).toHaveBeenCalled();
  });

  it('should call confirmation callback when user confirms', async () => {
    // Arrange
    const successResult = { isSuccessful: true, errMsg: '' };
    requestService.saveOutsideScore = jest.fn().mockResolvedValue(successResult);
    
    // Mock the confirmation to capture the callback
    let confirmCallback: Function;
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
      confirmCallback = callback;
    });

    // Act
    await handler.handle(storage);
    
    // Manually call the callback to simulate user confirmation
    await confirmCallback();

    // Assert
    expect(requestService.saveOutsideScore).toHaveBeenCalled();
    expect(resultDetails[0].checked).toBe(false);
    expect(resultDetails[1].checked).toBe(false);
  });
});
