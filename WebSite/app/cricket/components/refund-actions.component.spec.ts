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
import { RefundActionsComponent } from ".";
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
import { of } from "rxjs";
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
} from "../../shared/components";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { Language } from "../../shared/language";
import { ScoreBySettlementPipe } from "../../shared/pipes/score-by-settlement.pipe";
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultNameByIdPipe } from "../pipes";
import { CricketService } from "../services";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "../../shared/material-module";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ApiKeys } from "../constants";
import { ResultSettingModel } from "../../shared/models";
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";

describe("Cricket - Refund Component", () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  let cricketService: CricketService;
  let messageBoxService: MessageBoxService;
  let aioService: AioService;
  let toastrService: ToastrService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  const successfulResultWithCommand = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
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
  match.resultDetails = [resultDetail];

  const apiUrl = 'mock Url';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RefundActionsComponent,
        ModalDialogComponent,
        IntervalBackgroundPipe,
        ModalContentDialogComponent,
        ResultNameByIdPipe,
        ScoreBySettlementPipe,
      ],
      providers: [
        ResultNameByIdPipe,
        IntervalBackgroundPipe,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        CricketService,
        AioService,
        NgbModal,
        ToastContainerDirective,
        ToastrService
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
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
        cricketService = fixture.debugElement.injector.get(CricketService);
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
    spyOn(aioService, 'getMatch').and.returnValue(of(match));
    component.getMatch(matchId, apiUrl);

    expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
  });

  describe("refund", () => {
    beforeEach(() => {
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');
      resultDetail.resultSettingData.isConfirmedRefund = true;
      component.match = match;
      component.matchDetail = matchDetail;
      component.applyHedgeMatch = false;
      component.resultDetails = [resultDetail];
    });

    it("should alert when exist marked ticket", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(existMarkedTicket)
      );

      component.refund();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    }));

    it('should alert when exist result not confirmed', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = false;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );

      component.refund();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.");
    }));

    it("should pass all validation and successfully refund and there are no hedge match", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(successfulResult));
      spyOn(messageBoxService, "closePopup");

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(1);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should call net position when successfully refund and return result with command", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(successfulResultWithCommand));
      spyOn(messageBoxService, "closePopup");
      spyOn(cricketService, "netPosition").and.returnValue(of(successfulResult));

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(1);
      expect(cricketService.netPosition).toHaveBeenCalled();
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should call net position when successfully refund and return result with command for both main and hedge match", fakeAsync(async () => {
      match.hedgeMatchDetail = new HedgeMatchDetail();
      match.hedgeMatchDetail.matchId = 700000;
      component.applyHedgeMatch = true;
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(successfulResultWithCommand));
      spyOn(messageBoxService, "closePopup");
      spyOn(cricketService, "netPosition").and.returnValue(of(successfulResult));

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(2);
      expect(cricketService.netPosition).toHaveBeenCalledTimes(2);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should pass all validation and successfully refund and there are hedge match", fakeAsync(async () => {
      match.hedgeMatchDetail = new HedgeMatchDetail();
      match.hedgeMatchDetail.matchId = 700000;
      component.applyHedgeMatch = true;
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(successfulResult));
      spyOn(messageBoxService, "closePopup");

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalledTimes(2);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it("should return error message when unsuccessfully refund", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(unSuccessfulResult));

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    }));
  });
});
