import { TestBed } from "@angular/core/testing";
import { RequestService } from "../../../components/calc/services/request.service";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { AbstractHandler } from "../../abstract.handler.native";
import { VerifyScoreInstantHandler } from "./verify-score-instant.handler";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";


describe('VerifyScoreHandler', () => {
  let handler: VerifyScoreInstantHandler;
  let requestService: RequestService;
  let storage: CalculateStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyScoreInstantHandler,
        RequestService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService
      ],
    });

    handler = TestBed.inject(VerifyScoreInstantHandler);
    requestService = TestBed.inject(RequestService);
    storage = TestBed.inject(CalculateStorage);
  });

  it('should call super.handle if there is no error message', async () => {
    const matchDetail = { matchId: '123' };
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
    requestService.undoCheckingScore = jest.fn().mockResolvedValue({ errMsg: '' });

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
    storage.setInstantScore = jest.fn();

    await handler.handle(storage);

    expect(requestService.undoCheckingScore).toHaveBeenCalledWith(matchDetail.matchId);
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
    expect(storage.setInstantScore).toHaveBeenCalled();
  });

  it('should call storage.error if there is an error message', async () => {
    const matchDetail = { matchId: '123' };
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
    requestService.undoCheckingScore = jest.fn().mockResolvedValue({ errMsg: 'Error' });
    
    storage.error = jest.fn();

    await handler.handle(storage);

    expect(requestService.undoCheckingScore).toHaveBeenCalledWith(matchDetail.matchId);
    expect(storage.error).toHaveBeenCalledWith('Error');
  });
});