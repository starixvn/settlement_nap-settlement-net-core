import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { TennisService } from './tennis.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ResultStatusId } from '../../shared/constants';
import { ResourcesIds } from '../constants';

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
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      const totalGames = new ResultDetail();
      const totalPoint = new ResultDetail();
      const totalSets = new ResultDetail();
      totalSets.resourceId = ResourcesIds.totalSets;
      totalSets.ticketStatus = "";

      totalPoint.resourceId = ResourcesIds.totalGames;
      totalPoint.resultStatusId = ResultStatusId.ManualCompleted;
      totalGames.resourceId = ResourcesIds.totalGames;
      totalGames.resultStatusId = ResultStatusId.ManualCompleted;
      resultOne.resourceId = "0101";
      resultTwo.resourceId = "0102";
      resultOne.resultStatusId = ResultStatusId.ManualCompleted;
      resultOne.homeValue = "1";
      resultOne.awayValue = "1";
      resultTwo.homeValue = "1";
      resultTwo.awayValue = "2";
      resultTwo.ticketStatus  = "";
      resultTwo.resultStatusId = ResultStatusId.ManualCompleted;
    
      totalPoint.resultStatusId = 5;
      totalPoint.resourceId = "06"

      const actual = service.getResultDetail([resultOne, resultTwo, totalSets, totalGames]);
      expect([actual[0],actual[1],actual[2]]).toEqual([resultOne, resultTwo, totalPoint]);
  });

  it('getIntervalBackground - should call pipes transform', () => {
    spyOn(intervalBackgroundPipe, 'transform');

    service.getIntervalBackground(0);

    expect(intervalBackgroundPipe.transform).toHaveBeenCalled();
  });
});