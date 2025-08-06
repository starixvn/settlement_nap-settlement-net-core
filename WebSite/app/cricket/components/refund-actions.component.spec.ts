import {
  TestBed,
  waitForAsync,
  ComponentFixture,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RefundActionsComponent } from "./refund-actions.component";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService,
} from "../../shared/services";
import {
  Match,
  HedgeMatchDetail,
} from "../models";
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import { Language } from "../../shared/language.native";
import { ScoreBySettlementPipe } from "../../shared/pipes/score-by-settlement.pipe";
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultNameByIdPipe } from "../pipes";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "../../shared/material-module";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ApiKeys } from "../constants";
import { ResultSettingModel, Result } from "../../shared/models";
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";

describe("Cricket - Refund Component", () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  
  let messageBoxService: MessageBoxService;
  let aioService: AioService;
  let toastrService: ToastrService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = new Result();
  successfulResult.errCode = 0;
  successfulResult.errMsg = "";
  successfulResult.isSuccessful = true;
  successfulResult.childMatchIds = "";
  successfulResult.settledSessionId = "";
  successfulResult.hasResultAmendment = false;
  successfulResult.isOrg = false;
  
  const unSuccessfulResult = new Result();
  unSuccessfulResult.errCode = 1;
  unSuccessfulResult.errMsg = errorMessage;
  unSuccessfulResult.isSuccessful = false;
  unSuccessfulResult.childMatchIds = "";
  unSuccessfulResult.settledSessionId = "";
  unSuccessfulResult.hasResultAmendment = false;
  unSuccessfulResult.isOrg = false;
  
  const successfulResultWithCommand = new Result();
  successfulResultWithCommand.errCode = 0;
  successfulResultWithCommand.errMsg = "";
  successfulResultWithCommand.isSuccessful = true;
  successfulResultWithCommand.childMatchIds = "123";
  successfulResultWithCommand.settledSessionId = "456";
  successfulResultWithCommand.hasResultAmendment = false;
  successfulResultWithCommand.isOrg = false;
  const existMarkedTicket = {
    isExistMarkedTicket: true,
  };
  const notExistMarkedTicket = {
    isExistMarkedTicket: false,
  };

  const resultDetail = new ResultDetail();
  resultDetail.resourceId = "H1";
  resultDetail.betTypeName = "betTypeName";
  resultDetail.homeValue = 'H';
  resultDetail.isShow = true;
  resultDetail.resultSettingData = new ResultSettingModel();

  const finalResultDetail = new ResultDetail();
  finalResultDetail.resourceId = "00"; // ResourcesIds.final
  finalResultDetail.betTypeName = "Final Score";
  finalResultDetail.homeValue = '2';
  finalResultDetail.awayValue = '1';
  finalResultDetail.isShow = true;
  finalResultDetail.resultSettingData = new ResultSettingModel();

  const permission = new Permission();
  permission.canCalculate = true;
  permission.canUncalculate = true;
  permission.canRefund = true;
  permission.canChangeScoreSource = true;
  permission.isLeader = true;
  permission.isTrader = true;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  match.permission = permission;
  match.resultDetails = [resultDetail, finalResultDetail];

  const apiUrl = 'mock Url';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        ResultNameByIdPipe,
        IntervalBackgroundPipe,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,

        AioService,
        NgbModal,
        ToastContainerDirective,
        ToastrService
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        RefundActionsComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        IntervalBackgroundPipe,
        ResultNameByIdPipe,
        ScoreBySettlementPipe,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NgbModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot()
      ],
    })
      
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RefundActionsComponent);
        component = fixture.componentInstance;
        component.match = match;
    
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        aioService = fixture.debugElement.injector.get(AioService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        component.resultDetails = [resultDetail];
        component.permission = new Permission();
        fixture.detectChanges();
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should call getMatch function with correct param', () => {
    const matchId = 123;
    const matchQuery = {
      matchId,
      apikey: ApiKeys.NormalMatch,
      settleType: "MNL"
    };
    jest.spyOn(aioService, 'getMatch').mockResolvedValue(match);
    component.getMatch(matchId);

    expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
  });

  describe("refund", () => {
    beforeEach(() => {
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(toastrService, 'error');
      resultDetail.resultSettingData.isConfirmedRefund = true;
      component.match = match;
      component.matchDetail = matchDetail;
      component.applyHedgeMatch = false;
      component.resultDetails = [resultDetail];
    });

    it("should alert when exist marked ticket", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        existMarkedTicket
      );

      component.refund();
      tick(1000);
      tick(1000);

      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    }));

    it('should alert when exist result not confirmed', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = false;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        notExistMarkedTicket
      );

      component.refund();
      tick(1000);
      tick(1000);

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.");
    }));

    it("should pass all validation and successfully refund and there are no hedge match", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        notExistMarkedTicket
      );
      jest.spyOn(aioService, "push").mockResolvedValue(successfulResult);
      jest.spyOn(messageBoxService, "closePopup");

      component.refund();
      tick(1000);
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick(1000);
      tick(1000);

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(1);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should call net position when successfully refund and return result with command", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        notExistMarkedTicket
      );
      jest.spyOn(aioService, "push").mockResolvedValue(successfulResultWithCommand);
      jest.spyOn(messageBoxService, "closePopup");

      component.refund();
      tick(1000);
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick(1000);
      tick(1000);

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(1);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should call net position when successfully refund and return result with command for both main and hedge match", fakeAsync(async () => {
      match.hedgeMatchDetail = new HedgeMatchDetail();
      match.hedgeMatchDetail.matchId = 700000;
      component.applyHedgeMatch = true;
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        notExistMarkedTicket
      );
      jest.spyOn(aioService, "push").mockResolvedValue(successfulResultWithCommand);
      jest.spyOn(messageBoxService, "closePopup");

      component.refund();
      tick(1000);
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick(1000);
      tick(1000);

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(2);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should pass all validation and successfully refund and there are hedge match", fakeAsync(async () => {
      match.hedgeMatchDetail = new HedgeMatchDetail();
      match.hedgeMatchDetail.matchId = 700000;
      component.applyHedgeMatch = true;
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        notExistMarkedTicket
      );
      jest.spyOn(aioService, "push").mockResolvedValue(successfulResult);
      jest.spyOn(messageBoxService, "closePopup");

      component.refund();
      tick(1000);
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick(1000);
      tick(1000);

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(2);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should return error message when unsuccessfully refund", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockResolvedValue(
        notExistMarkedTicket
      );
      jest.spyOn(aioService, "push").mockResolvedValue(unSuccessfulResult);

      component.refund();
      tick(1000);
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick(1000);
      tick(1000);

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    }));
  });
});
