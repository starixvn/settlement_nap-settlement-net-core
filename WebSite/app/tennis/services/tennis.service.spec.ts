import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { TennisService } from './tennis.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('TennisService', () => {
  let service: TennisService = null;
  let intervalBackgroundPipe: IntervalBackgroundPipe = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        TennisService,
        MessageBoxService,
        IntervalBackgroundPipe,
        NgbModule,
        HttpRequestService,
        HttpClient,
        HttpHandler,
        BlockUIService,
      ],
      imports: [
        NgbModule
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    });

    service = TestBed.inject(TennisService);
    intervalBackgroundPipe = TestBed.inject(IntervalBackgroundPipe);
  });

  beforeEach(inject([TennisService], (tennisService: TennisService) => {
    service = tennisService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it('getResultDetail - should add total games to result details', () => {
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = '01';
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '2';
    resultDetail.settlementStatusId = 0;
    const totalSet = new ResultDetail();
    totalSet.resourceId = '00';
    totalSet.settlementStatusId = 0;
    const resultDetails = [resultDetail, resultDetail, resultDetail, totalSet];

    const result = service.getResultDetail(resultDetails);

    expect(result.length).toEqual(5);
  });

  it('getIntervalBackground - should call pipes transform', () => {
    spyOn(intervalBackgroundPipe, 'transform');

    service.getIntervalBackground(0);

    expect(intervalBackgroundPipe.transform).toHaveBeenCalled();
  });
});