import { TestBed } from "@angular/core/testing";
import { ConfirmAllHandler } from "./confirm-all.handler";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { MessageBoxService } from "../../../../shared/services";
import { Language } from "../../../../shared/language.native";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { RequestService } from "../../../components/calc/services/request.service";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { ChildMatch, Match, MatchDetail } from "../../../components/calc/models/match.model";
import { Permission } from "../../../../shared/models/sportsbook-sop/permission.model";
import { Storage } from "../../../storage/storage.service.native";

describe('ConfirmAllHandler', () => {
  let handler: ConfirmAllHandler;
  let verifyActionService: VerifyActionService;
  let messageBoxService: MessageBoxService;
  let storage: Storage;

  const childMatch: ChildMatch = {
    matchId: 0,
    matchCode: "",
    isExistMarkedTicket: false,
    isExistRunningTicket: false,
    isPending: false,
    isRefund: "",
    eventStatus: "",
    eventStatusColor: "",
    betStatus: "",
    checked: false,
    homeName: "",
    awayName: ""
  }

  const match : Match = {
    matchDetail: {} as MatchDetail,
    childMatches: [childMatch],
    permission: new Permission,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ConfirmAllHandler,
        VerifyActionService,
        MessageBoxService,
        VerifyScoreGoalService,
        RequestService,
        CalculateStorage,
        ToastrService
      ]
    });

    handler = TestBed.inject(ConfirmAllHandler);
    verifyActionService = TestBed.inject(VerifyActionService);
    messageBoxService = TestBed.inject(MessageBoxService);
    storage = {
          getMatch: jest.fn(),
          setConfirmMessage: jest.fn(),
          getConfirmMessage: jest.fn(),
        } as unknown as Storage;
  });

  it('should handle when score is changed', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getIsResettleTicket = jest.fn().mockReturnValue(true);
    verifyActionService.isScoreChangedAll = jest.fn().mockResolvedValue(true);
    messageBoxService.confirm = jest.fn();

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.recalculateNotification);
    expect(messageBoxService.confirm).toHaveBeenCalled();
  });

  it('should handle when score is not changed and no child matches selected', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
    verifyActionService.isScoreChangedAll = jest.fn().mockResolvedValue(false);
    messageBoxService.confirm = jest.fn();

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.doubleCheckCalculateAll);
    expect(messageBoxService.confirm).toHaveBeenCalled();
  });

  it('should handle when score is not changed and child matches selected', async () => {
    childMatch.checked = true;
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
    verifyActionService.isScoreChangedAll = jest.fn().mockResolvedValue(false);
    messageBoxService.confirm = jest.fn();

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(`${Language.doubleCheckCalculateAll}${Language.soccer.confirmAutoRefundChildMatch}`);
    expect(messageBoxService.confirm).toHaveBeenCalled();
  });
});