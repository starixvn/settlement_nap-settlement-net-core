import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from "@angular/common";
import { AioService } from './aio.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { HedgeMatchDetail, ResultDetail, SaveScoreQuery } from '../models/sportsbook-sop';
import { GeneralResultDetail, ResourceItem, ResultSettingModel, ResultSettingQuery } from '../models';
import { ResourceIds, ResultSettingType } from '../constants';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClosePopupService } from './close-popup.service.native';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { Language } from '../../shared/language.native';

describe('AioService', () => {
  let service: AioService = null;
  let httpRequestService: HttpRequestService;
  let messageBoxService: MessageBoxService;
  const result = new ResultDetail();
  result.resultSettingData = new ResultSettingModel();
  const resourceItem = new ResourceItem('resourceId', 'resourceName', 'resourceType', 'resourceValue')
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatePipe,
        AioService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        ClosePopupService,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [
        ModalDialogComponent,
        ModalContentDialogComponent,
        HttpClientModule,
        NgbModule
      ],
    });

    service = TestBed.inject(AioService);
    httpRequestService = TestBed.inject(HttpRequestService);
    messageBoxService = TestBed.inject(MessageBoxService);
  });

  beforeEach(inject([AioService], (aioService: AioService) => {
    service = aioService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it('getMatch - Call exact Url and param', () => {
    // Arrange
    const matchId = '7000000';
    const url = '/api/aio/get-match';
    const query = {
      matchId,
      apikey: "api-key",
    };

    // Act
    httpRequestService.postJson = jest.fn();
    service.getMatch(query);

    // Assert
    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('push - Call exact Url and param', () => {
    // Arrange
    const matchId = 7000000;
    const url = '/api/aio/settle';
    const query = { matchId };

    // Act
    httpRequestService.postJson = jest.fn();
    service.push(query);

    // Assert
    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('saveScore - Call exact Url and param', () => {
    const query = new SaveScoreQuery();

    httpRequestService.postJson = jest.fn();
    service.saveScore(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, '/api/aio/save-score');
  });


  describe('verifyChangedSettledTickets', () => {
    const lastestResult = new GeneralResultDetail();
    lastestResult.resourceId = '12345';
    lastestResult.resultStatus = 'Completed';
    lastestResult.homeValue = '4';
    lastestResult.awayValue = '5';
    const lastestResults = [lastestResult];

    it('should return false when no need to check for recalc tickets', async () => {
      service.getLastestMatchResult = jest.fn().mockReturnValue(lastestResults);

      const actualResult = await service.verifyChangedSettledTickets(lastestResults, { matchId: 123 });

      expect(actualResult).toBe(false);
    });

    it('should return true when need to check for recalc tickets', async () => {
      const newResult = new GeneralResultDetail();
      newResult.resourceId = '12345';
      newResult.resultStatus = 'Complete';
      newResult.homeValue = '7';
      newResult.awayValue = '5';
      const newResults = [newResult];
      service.getLastestMatchResult = jest.fn().mockReturnValue(lastestResults);

      const actualResult = await service.verifyChangedSettledTickets(newResults, { matchId: 123 });

      expect(actualResult).toBe(true);
    });
  });


  describe('undoConfirmedResult', () => {
    it('should show alert when exist result not confirmed', () => {
      result.resultSettingData.isConfirmedRefund = false;
      messageBoxService.alert = jest.fn();

      service.undoConfirmedResult([result], 0, '', null);

      expect(messageBoxService.alert).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("WARNING! Cannot continue due to selected results have different confirm states! Please select confirmed or not confirmed results only.");
    });

    it('should show confirm when all result confirmed', () => {
      result.resultSettingData.isConfirmedRefund = true;

      messageBoxService.confirm = jest.fn();

      service.undoConfirmedResult([result], 0, '', null);

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("WARNING! Are you sure you want to undo confirm-refund for selected results?");
    });

    it('should push request when click ok on confirm box', fakeAsync(async () => {
      result.resultSettingData.isConfirmedRefund = true;
      service.changeResultSetting = jest.fn().mockReturnValue(Promise.resolve(true));
      const query = new ResultSettingQuery(0, ResultSettingType.confirmRefund,
        false, '');
        query.confirmRefundResources = []

      service.undoConfirmedResult([result], 0, '', null);

      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toHaveBeenCalledWith(query);
    }));
  });

  describe('changeConfirmResultSDTSetting', () => {
    test.each([[true, Language.confirmRefund.sdtConfirm], [false, Language.confirmRefund.undoConfirmAll]])('show correct confirm when enbale is %p', (isEnable: boolean, message: string) => {

      messageBoxService.confirm = jest.fn();

      service.changeConfirmResultSDTSetting(0, 3, [resourceItem], isEnable, null);

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual(message.replace('{0}', 'resourceName: resourceType - resourceValue'));
    });

    it('should change push request and close popup when click ok on confirm box', fakeAsync(() => {
      service.changeResultSetting = jest.fn().mockReturnValue(Promise.resolve(true));
      messageBoxService.closePopupNotChanged = jest.fn();
      const query = new ResultSettingQuery(0, ResultSettingType.confirmRefundSDT,
        true, 'resourceId', [resourceItem]);
        query.is3x3 = false

      service.changeConfirmResultSDTSetting(0, 3, [resourceItem], true, null);
      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toHaveBeenCalledWith(query);
      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    }));

    it('should change setting for hedgeMatch when select hedgeMatch', fakeAsync(() => {
      service.changeResultSetting = jest.fn().mockReturnValue(Promise.resolve(true));
      messageBoxService.closePopupNotChanged = jest.fn();
      const hedgeMatch = new HedgeMatchDetail();
      hedgeMatch.matchId = 1;

      service.changeConfirmResultSDTSetting(0, 3, [resourceItem], true, hedgeMatch);
      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toBeCalledTimes(2);
      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    }));
  });

  describe('changeConfirmResultSetting', () => {
    it('should show confirm box ', () => {

      messageBoxService.confirm = jest.fn();

      service.changeConfirmResultSetting("message", 0, '', true, null);

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(service.warningDialogMessage.message).toEqual("message");
    });

    it('should change push request and close popup when click ok on confirm box', fakeAsync(() => {
      service.changeResultSetting = jest.fn().mockReturnValue(Promise.resolve(true));
      messageBoxService.closePopupNotChanged = jest.fn();
      const query = new ResultSettingQuery(0, ResultSettingType.confirmRefund,
        true, '01');
        query.confirmRefundResources = []

      service.changeConfirmResultSetting("", 0, '01', true, null);
      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toHaveBeenCalledWith(query);
      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    }));

    it('should change setting for hedgeMatch when select hedgeMatch', fakeAsync(() => {
      service.changeResultSetting = jest.fn().mockReturnValue(Promise.resolve(true));
      messageBoxService.closePopupNotChanged = jest.fn();
      const hedgeMatch = new HedgeMatchDetail();
      hedgeMatch.matchId = 1;

      service.changeConfirmResultSetting("", 0, '01', true, hedgeMatch);
      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toBeCalledTimes(2);
      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    }));

    it('should change setting for old match and hedgeMatch when select old match and hedgeMatch', fakeAsync(() => {
      service.changeResultSetting = jest.fn().mockReturnValue(Promise.resolve(true));
      messageBoxService.closePopupNotChanged = jest.fn();
      const hedgeMatch = new HedgeMatchDetail();
      hedgeMatch.matchId = 1;

      const oldMatch = {...hedgeMatch};

      service.changeConfirmResultSetting("", 0, '01', true, hedgeMatch, oldMatch);
      const buttonYes = document.getElementsByClassName("btn-danger")[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(service.changeResultSetting).toBeCalledTimes(3);
      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    }));
  });

  describe('generateDeterminedType', () => {
    it('should generate the determined type for full-time result', () => {
      const resultDetails = [
        { resourceId: ResourceIds.fullTime, checked: true, homeValue: '1', awayValue: '2' },
        { resourceId: ResourceIds.halfTime, checked: true, homeValue: '', awayValue: '' },
        { resourceId: 'OtherId', checked: false, homeValue: '', awayValue: '' },
      ] as ResultDetail[];

      const result = service.generateDeterminedType(resultDetails);

      expect(result).toBe(4);
    });

    it('should generate the determined type for half-time result', () => {
      const resultDetails: ResultDetail[] = [
        { resourceId: ResourceIds.fullTime, checked: true, homeValue: '', awayValue: '' },
        { resourceId: ResourceIds.halfTime, checked: true, homeValue: '1', awayValue: '2' },
        { resourceId: 'OtherId', checked: false, homeValue: '', awayValue: '' },
      ] as ResultDetail[];


      const result = service.generateDeterminedType(resultDetails);

      expect(result).toBe(1);
    });

    it('should generate the determined type for other results', () => {
      const resultDetails = [
        { resourceId: ResourceIds.fullTime, checked: false, homeValue: '', awayValue: '' },
        { resourceId: ResourceIds.halfTime, checked: false, homeValue: '', awayValue: '' },
        { resourceId: 'OtherId1', checked: true, homeValue: '1', awayValue: '2' },
        { resourceId: 'OtherId2', checked: true, homeValue: '3', awayValue: '4' },
      ] as ResultDetail[];

      const result = service.generateDeterminedType(resultDetails);

      expect(result.toString(2)).toBe("11000");
    });

    it('should generate the determined type when no results are checked', () => {
      const resultDetails = [
        { resourceId: ResourceIds.fullTime, checked: false, homeValue: '', awayValue: '' },
        { resourceId: ResourceIds.halfTime, checked: false, homeValue: '', awayValue: '' },
        { resourceId: 'OtherId', checked: false, homeValue: '', awayValue: '' },
      ] as ResultDetail[];

      const result = service.generateDeterminedType(resultDetails);

      expect(result).toBe(0);
    });
  });
});
