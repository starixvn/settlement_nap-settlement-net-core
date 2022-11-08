import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { AioService } from './aio.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { of } from 'rxjs';
import { ResultDetail, SaveScoreQuery } from '../models/sportsbook-sop';
import { GeneralResultDetail, ResultSettingModel, ResultSettingQuery } from '../models';
import { ResultSettingType, SettlementStatusId, TicketStatusText } from '../constants';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClosePopupService } from './close-popup.service.native';

describe('AioService', () => {
  let service: AioService = null;
  let httpRequestService: HttpRequestService;
  let messageBoxService: MessageBoxService;
  let closePopupService: ClosePopupService;
  const result = new ResultDetail();
  result.resultSettingData = new ResultSettingModel();
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      providers: [
        AioService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        ClosePopupService,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [
        HttpClientModule,
        NgbModule
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    });

    service = TestBed.inject(AioService);
    httpRequestService = TestBed.inject(HttpRequestService);
    messageBoxService = TestBed.inject(MessageBoxService);
    closePopupService = TestBed.inject(ClosePopupService);
  });

  beforeEach(inject([AioService], (aioService: AioService) => {
    service = aioService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it('getMatch - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = '7000000';
        const url = 'api/aio/get-match';
        const query = {
          matchId,
          apikey: "api-key",
        };

        // Act
        spyOn(httpRequestService, 'postJson');
        service.getMatch(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      }));

  it('push - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = 'api/aio/settle';
        const query = { matchId };

        // Act
        spyOn(httpRequestService, 'postJson');
        service.push(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      }));

  it('saveScore - Call exact Url and param', fakeAsync(() => {
    const query = new SaveScoreQuery();

    spyOn(httpRequestService, 'postJson');
    service.saveScore(query);
    tick();

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, 'api/aio/save-score');
  }));


  describe('verifyChangedSettledTickets', () => {
    const lastestResult = new GeneralResultDetail();
    lastestResult.resourceId = '12345';
    lastestResult.resultStatus = 'Complete';
    lastestResult.homeValue = '4';
    lastestResult.awayValue = '5';
    const lastestResults = [lastestResult];

    it('should return false when no need to check for recalc tickets', fakeAsync(() => {
      let actualResult: boolean;
      spyOn(httpRequestService, 'postJson').and.returnValue(of(lastestResults));

      service.verifyChangedSettledTickets(lastestResults, { matchId: 123 }).subscribe((result) => {
        actualResult = result;
      });

      expect(actualResult).toBe(false);
    }));

    it('should return true when need to check for recalc tickets', fakeAsync(() => {
      const newResult = new GeneralResultDetail();
      newResult.resourceId = '12345';
      newResult.resultStatus = 'Complete';
      newResult.homeValue = '7';
      newResult.awayValue = '5';
      const newResults = [newResult];
      let actualResult: boolean;
      spyOn(httpRequestService, 'postJson').and.returnValue(of(lastestResults));

      service.verifyChangedSettledTickets(newResults, { matchId: 123 }).subscribe((result) => {
        actualResult = result;
      });

      expect(actualResult).toBe(true);
    }));
  });
  describe('undoConfirmedResult', () => {
    it('should show alert when exist result not confirmed', () => {
      result.resultSettingData.isConfirmedRefund = false;
      spyOn(messageBoxService, 'alert');

      service.undoConfirmedResult([result], 0, '', null);

      expect(messageBoxService.alert).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("WARNING! Cannot continue due to selected results have different confirm states! Please select confirmed or not confirmed results only.");
    });

    it('should show confirm when all result confirmed', () => {
      result.resultSettingData.isConfirmedRefund = true;

      spyOn(messageBoxService, 'confirm');

      service.undoConfirmedResult([result], 0, '', null);

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("WARNING! Are you sure you want to undo confirm-refund for selected results?");
    });

    it('should push request when click ok on confirm box', fakeAsync(async () => {
      result.resultSettingData.isConfirmedRefund = true;
      spyOn(service, 'changeResultSetting').and.returnValue(of(true));
      const query = new ResultSettingQuery(0, ResultSettingType.confirmRefund,
        false, '');

      service.undoConfirmedResult([result], 0, '', null);

      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toHaveBeenCalledWith(query);
    }));
  });

  describe("confirmResult", () => {
    it('should show alert when exist result refunded and has no running ticket', () => {
      result.resultSettingData.isConfirmedRefund = false;
      result.settlementStatusId = SettlementStatusId.Refund;
      result.ticketStatus = TicketStatusText.calculated;

      spyOn(messageBoxService, 'alert');

      service.confirmResult([result], 0, '', null);

      expect(messageBoxService.alert).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("WARNING! Cannot continue due to selected results are Refund and have no Running ticket.");
    });

    it('should show confirm when all result confirmed', () => {
      result.resultSettingData.isConfirmedRefund = false;
      result.settlementStatusId = SettlementStatusId.Running;
      spyOn(messageBoxService, 'confirm');

      service.confirmResult([result], 0, '', null);

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("WARNING! Are you sure you want to confirm-refund for selected results?");
    });

    it('should push request when click ok on confirm box', fakeAsync(async () => {
      result.resultSettingData.isConfirmedRefund = true;
      result.settlementStatusId = SettlementStatusId.Running;
      spyOn(service, 'changeResultSetting').and.returnValue(of(true));
      const query = new ResultSettingQuery(0, ResultSettingType.confirmRefund,
        true, '');

      service.confirmResult([result], 0, '', null);

      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toHaveBeenCalledWith(query);
    }));
  });
});
