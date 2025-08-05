import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResourceNameByIdPipe, ExcludeTotalPointPipe, ResourceHeaderPipe } from '../pipes';
import { RefundActionsComponent } from './';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService
} from '../../shared/services';
import { Match } from '../models';
import { TennisApiKeys, ResourcesIds } from '../constants';
import { of } from 'rxjs';
import { Language } from '../../shared/language.native';
import { CalculateAction } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetail, SettleQuery } from '../../shared/models/sportsbook-sop';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultSettingModel } from '../../shared/models';
import { VerificationService } from '../services';
import { ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { MatchDetailComponent } from './match-detail.component';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { Result } from '../../shared/models';

describe('Tennis - Refund actions component', () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  let messageBoxService: MessageBoxService;
  let toastrService: ToastrService;

  beforeEach(() => {
    jest.useFakeTimers();
  });
  const buttonName = "btn-danger";
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  const resultDetail = new ResultDetail();
  match.resultDetails = [resultDetail, resultDetail];
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
  
  const existMarkedTicket = {
    isExistMarkedTicket: true,
  };
  const notExistMarkedTicket = {
    isExistMarkedTicket: false,
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        AioService,
        VerificationService,
        NgbModal,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
        RefundActionsComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        MatchDetailComponent,
        ResourceNameByIdPipe,
        ExcludeTotalPointPipe,
        IntervalBackgroundPipe,
        ResourceHeaderPipe,
        ScoreBySettlementPipe
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RefundActionsComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        jest.spyOn(closePopupService, 'closePopup').mockImplementation(() => { });
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('get selectedResources - should return correct items checked', () => {
    // Arrange
    resultDetail.checked = true;
    const resultDetail1 = new ResultDetail();
    resultDetail1.checked = false;
    component.resultDetails = [resultDetail, resultDetail1];

    // Act
    const result = component.selectedResources;

    // Assert
    expect(result).toEqual([resultDetail]);
  });

  describe('refund()', () => {
    beforeEach(() => {
      resultDetail.resultSettingData = new ResultSettingModel();
      resultDetail.resultSettingData.isConfirmedRefund = true;
      component.resultDetails = [resultDetail];
      component.matchDetail = matchDetail;
    });

    it('should invoke messageBoxService alert when markedTickets exist',
      fakeAsync(() => {
        // Arrange
        resultDetail.checked = true;
        component.match = match;
        jest.spyOn(aioService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(existMarkedTicket));
        jest.spyOn(toastrService, 'error');

        // Act
        component.refund();
        tick();

        // Assert
        expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        jest.runOnlyPendingTimers(); // flush any remaining timers
      }));

    it('should invoke verifySelectedOnMap() when no marked tickets exist',
      fakeAsync(() => {
        // Arrange
        resultDetail.checked = true;
        component.match = match;

        jest.spyOn(aioService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(notExistMarkedTicket));
        jest.spyOn(component, 'verifySelectedOnMap');

        // Act
        component.refund();
        tick();

        // Assert
        expect(component.verifySelectedOnMap).toHaveBeenCalled();
      }));

    it('should invoke messageBoxService.confirm when no marked tickets exist',
      fakeAsync(() => {
        // Arrange
        resultDetail.checked = true;
        component.match = match;
        jest.spyOn(aioService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(notExistMarkedTicket));
        jest.spyOn(component, 'verifySelectedOnMap').mockReturnValue(resultDetail);
        jest.spyOn(messageBoxService, 'confirm');

        // Act
        component.refund();
        tick();

        // Assert
        expect(messageBoxService.confirm).toHaveBeenCalled();
      }));

    it('should alert when exist result not confirmed', fakeAsync(async () => {
      resultDetail.resultSettingData = new ResultSettingModel();
      resultDetail.resultSettingData.isConfirmedRefund = false;
      resultDetail.checked = true;
      component.match = match;
      component.resultDetails = [resultDetail];
      jest.spyOn(aioService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(notExistMarkedTicket));
      jest.spyOn(toastrService, 'error');

      await component.refund();
      tick();
      jest.runOnlyPendingTimers(); // flush any remaining timers

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.");
    }));
  });

  describe('verifySelectedOnMap', () => {
    it('should alert when no map is checked', () => {
      // Arrange
      resultDetail.checked = false;
      match.resultDetails = [resultDetail];
      component.match = match;
      jest.spyOn(toastrService, "error");

      // Act
      component.verifySelectedOnMap();

      // Assert
      expect(toastrService.error).toHaveBeenCalledWith(Language.NotSelectRefundTypeMessage);
    });

    it('should return checked map', () => {
      // Arrange
      resultDetail.checked = true;
      component.match = match;

      // Act
      const result = component.verifySelectedOnMap();

      // Assert
      expect(result).toEqual(resultDetail);
    });
  });

  describe('doRefund', () => {
    beforeEach(() => {
      component.resultDetails = [resultDetail];
      component.matchDetail = matchDetail;
    });

    it('should push with exact params', () => {
      // Arrange
      resultDetail.resourceId = ResourcesIds.totalSets;
      resultDetail.checked = true;
      match.resultDetails = [resultDetail];
      component.match = match;
      const param = new SettleQuery(matchDetail,
        match.resultDetails,
        CalculateAction.refund,
        false,
        "Refund;",
        TennisApiKeys.Settle);
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(successfulResult));

      // Act
      component.doRefund();

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(param);
    });

    it('should be successful, error message is empty, close pop-up', () => {
      // Arrange
      resultDetail.resourceId = ResourcesIds.totalSets;
      resultDetail.checked = true;
      component.match = match;
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(toastrService, 'error');

      // Act
      component.doRefund();

      // Assert
      expect(toastrService.error).not.toHaveBeenCalled();
    });

    it('should be unsuccessful, return error message', async () => {
      // Arrange
      resultDetail.resourceId = ResourcesIds.totalSets;
      resultDetail.checked = true;
      component.match = match;
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(unSuccessfulResult));
      jest.spyOn(toastrService, 'error');

      // Act
      await component.doRefund();

      // Assert
      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    });
  });
});