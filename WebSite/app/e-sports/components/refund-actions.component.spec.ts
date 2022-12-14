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
import { ResourceNameByIdPipe } from "../pipes";
import { RefundActionsComponent, CalculationMatchDetailComponent } from ".";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  AioService,
} from "../../shared/services";
import {
  Match,
} from "../models";
import { of } from "rxjs";
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
} from "../../shared/components";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { Language } from "../../shared/language";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";
import { ResultSettingModel } from "../../shared/models";
import { HedgeMatchDetail, MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { VerificationService } from "../services";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";
import { MaterialModule } from "../../shared/material-module";
import { ApiKeys } from "../constants";
import { NO_ERRORS_SCHEMA } from "@angular/core";
describe("E-sport - Refund Component", () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  let aioService: AioService;
  let messageBoxService: MessageBoxService;
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
  const existMarkedTicket = {
    isExistMarkedTicket: true,
  };
  const notExistMarkedTicket = {
    isExistMarkedTicket: false,
  };
  const resultSettingData = new ResultSettingModel();
  const permission = new Permission();
  permission.canCalculate = true;
  permission.canUncalculate = true;
  permission.canRefund = true;
  permission.canChangeScoreSource = true;
  permission.isLeader = true;
  permission.isTrader = false;
  const resultDetail = new ResultDetail();
  resultDetail.resourceId = "H1";
  resultDetail.betTypeName = "Test bet type name";
  resultDetail.homeValue = 'H';
  resultDetail.isShow = true;
  resultDetail.inputType = 0;
  resultDetail.resultSettingData = resultSettingData;
  resultDetail.checked = true;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 12345;
  const match = new Match(matchDetail);
  match.resultDetails = [resultDetail];
  match.permission = permission;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RefundActionsComponent,
        ResourceNameByIdPipe,
        ModalDialogComponent,
        IntervalBackgroundPipe,
        ModalContentDialogComponent,
        CalculationMatchDetailComponent,
      ],
      providers: [
        AioService,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        VerificationService,
        NgbModal,
        ResultByTeamNamePipe,
        ToastContainerDirective,
        ToastrService
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule, 
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RefundActionsComponent);
        
        aioService = fixture.debugElement.injector.get(AioService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        component = fixture.componentInstance;
        component.match = match;
        component.resultDetails = [resultDetail];
        component.permission = new Permission();
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
    component.getMatch(matchId);

    expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
  });


  describe("refund", () => {
    beforeEach(() => {
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');
      resultDetail.resultSettingData.isConfirmedRefund = true;
      component.resultDetails = [resultDetail];
      component.matchDetail = matchDetail;
    });

    it("should pass all validation and successfully refund and there are no hedge match", fakeAsync(async () => {
      component.match = match;
      component.applyHedgeMatch = false;
      spyOn(aioService, "checkMarkedTickets").and.returnValue(of(notExistMarkedTicket));
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

    it("should pass all validation and successfully refund and there are hedge match", fakeAsync(async () => {
      match.hedgeMatchDetail = new HedgeMatchDetail();
      match.hedgeMatchDetail.matchId = 700000;
      component.match = match;
      component.applyHedgeMatch = true;
      component.hedgeMatchDetail = match.hedgeMatchDetail;
      spyOn(aioService, "checkMarkedTickets").and.returnValue(of(notExistMarkedTicket));
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

    it("should show error message when unsuccessfully refund", fakeAsync(async () => {
      component.match = match;
      spyOn(aioService, "checkMarkedTickets").and.returnValue(of(notExistMarkedTicket));
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

    it("should show error message when exist marked ticket", fakeAsync(async () => {
      component.match = match;
      spyOn(aioService, "checkMarkedTickets").and.returnValue(of(existMarkedTicket));

      component.refund();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    }));

    it('should show error message when exist result not confirmed refund', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = false;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      spyOn(aioService, "checkMarkedTickets").and.returnValue(of(notExistMarkedTicket));

      debugger;
      await component.refund();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.refundResultNotConfirmed);
    }));

    it("should refund successfully when match pinGoal and not confirm refund ", fakeAsync(async () => {
      component.match = match;
      component.applyHedgeMatch = false;
      component.match.matchDetail = matchDetail;
      component.match.matchDetail.leagueGroupId = 151;
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = false;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      spyOn(aioService, "checkMarkedTickets").and.returnValue(of(notExistMarkedTicket));
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

  });
});
