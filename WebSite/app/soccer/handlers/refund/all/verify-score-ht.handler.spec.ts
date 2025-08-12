import { TestBed } from '@angular/core/testing';
import { VerifyScoreHTHandler } from './verify-score-ht.handler';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetailSoccer as MatchDetail } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';


describe('VerifyScoreHTHandler', () => {
  let handler: VerifyScoreHTHandler;
  let storage: RefundBaseStorage;
  let verificationBaseService: VerificationBaseService;

  const createMatchDetail = (): MatchDetail => ({
    matchId: 1,
    halfTimeHomeScore: '',
    halfTimeAwayScore: ''
  } as any);

  const match: Match = {
    matchDetail: createMatchDetail(),
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: null,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: null,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyScoreHTHandler,
        VerificationBaseService,
        RefundStorage,
        ToastrService
      ]
    });

    handler = TestBed.inject(VerifyScoreHTHandler);
    storage = TestBed.inject(RefundStorage);
    verificationBaseService = TestBed.inject(VerificationBaseService);

    // Arrange
    match.matchDetail = createMatchDetail();
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getHalfTimeResult = jest.fn();
    storage.error = jest.fn();
  });

  it('should call storage.error when HT score is invalid (empty values)', () => {
    // Arrange
    const halfTime = { homeValue: '', awayValue: '', isInvalidValue: false } as any;
    (storage.getHalfTimeResult as jest.Mock).mockReturnValue(halfTime);
    jest.spyOn(verificationBaseService, 'isEmptyScore').mockImplementation((v: any) => v === '');
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(verificationBaseService.isEmptyScore).toHaveBeenCalledWith('');
    expect(verificationBaseService.isEmptyScore).toHaveBeenCalledWith('');
    expect(halfTime.isInvalidValue).toBe(true);
    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
    expect(superHandleSpy).not.toHaveBeenCalled();
    expect(match.matchDetail.halfTimeHomeScore).toBe('');
    expect(match.matchDetail.halfTimeAwayScore).toBe('');
  });

  it('should set HT scores and call super.handle when score is valid', () => {
    // Arrange
    const halfTime = { homeValue: '1', awayValue: '2', isInvalidValue: false } as any;
    (storage.getHalfTimeResult as jest.Mock).mockReturnValue(halfTime);
    jest.spyOn(verificationBaseService, 'isEmptyScore').mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(verificationBaseService.isEmptyScore).toHaveBeenCalledWith('1');
    expect(verificationBaseService.isEmptyScore).toHaveBeenCalledWith('2');
    expect(halfTime.isInvalidValue).toBe(false);
    expect(match.matchDetail.halfTimeHomeScore).toBe('1');
    expect(match.matchDetail.halfTimeAwayScore).toBe('2');
    expect(storage.error).not.toHaveBeenCalled();
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should mark isInvalidValue when only one side is empty (home empty)', () => {
    // Arrange
    const halfTime = { homeValue: '', awayValue: '2', isInvalidValue: false } as any;
    (storage.getHalfTimeResult as jest.Mock).mockReturnValue(halfTime);
    jest.spyOn(verificationBaseService, 'isEmptyScore').mockImplementation((v: any) => v === '');

    // Act
    handler.handle(storage);

    // Assert
    expect(halfTime.isInvalidValue).toBe(true);
    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });

  it('should mark isInvalidValue when only one side is empty (away empty)', () => {
    // Arrange
    const halfTime = { homeValue: '1', awayValue: '', isInvalidValue: false } as any;
    (storage.getHalfTimeResult as jest.Mock).mockReturnValue(halfTime);
    jest.spyOn(verificationBaseService, 'isEmptyScore').mockImplementation((v: any) => v === '');

    // Act
    handler.handle(storage);

    // Assert
    expect(halfTime.isInvalidValue).toBe(true);
    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });
});
