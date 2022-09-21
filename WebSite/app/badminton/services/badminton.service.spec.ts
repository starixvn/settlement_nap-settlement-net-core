import { Match } from '../models';
import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BadmintonService } from './badminton.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop/result-detail.model';
import { ResourcesIds } from '../constants';
import { SettlementStatusId, SportType } from '../../shared/constants';
import { MatchDetail } from '../../shared/models/sportsbook-sop';


describe('BadmintonService', () => {
  let service: BadmintonService = null;
  let httpRequestService: HttpRequestService;
  let intervalBackgroundPipe: IntervalBackgroundPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        BadmintonService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        IntervalBackgroundPipe,
        NgbModule,
      ],
      imports: [
        HttpClientModule,
        NgbModule
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      });

    service = TestBed.inject(BadmintonService);
    httpRequestService = TestBed.inject(HttpRequestService);
    intervalBackgroundPipe = TestBed.inject(IntervalBackgroundPipe);
  });

  beforeEach(inject([BadmintonService], (badmintonService: BadmintonService) => {
    service = badmintonService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  describe('getResultDetail', () => {
    it('should add total point with refund status when match refunded', () => {
      const resultOne = new ResultDetail();
      const totalGames = new ResultDetail();
      const totalPoint = new ResultDetail();
      totalPoint.resourceId = ResourcesIds.totalPoints;
      totalPoint.settlementStatusId = SettlementStatusId.Refund;
      totalGames.resourceId = ResourcesIds.totalGames;
      totalGames.settlementStatusId = SettlementStatusId.Refund;
      resultOne.resourceId = "0101";

      const actual = service.getResultDetail([resultOne, totalGames]);

      expect(actual).toEqual([resultOne, totalPoint, totalGames]);
    });

    it('should add total point with score is sum of set and status of total game', () => {
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      const totalGames = new ResultDetail();
      const totalPoint = new ResultDetail();
      totalPoint.resourceId = ResourcesIds.totalPoints;
      totalPoint.settlementStatusId = SettlementStatusId.Calculated;
      totalGames.resourceId = ResourcesIds.totalGames;
      totalGames.settlementStatusId = SettlementStatusId.Calculated;
      resultOne.resourceId = "0101";
      resultTwo.resourceId = "0102";
      resultOne.homeValue = "1";
      resultOne.awayValue = "1";
      resultTwo.homeValue = "1";
      resultTwo.awayValue = "2";
      totalPoint.awayValue = "3";
      totalPoint.homeValue = "2";

      const actual = service.getResultDetail([resultOne, resultTwo, totalGames]);

      expect(actual).toEqual([resultOne, resultTwo, totalPoint, totalGames]);
    });
  });

  it('getIntervalBackground - return value from pipe', () => {

    spyOn(intervalBackgroundPipe, 'transform').and.returnValue('123abc');

    const actual = service.getIntervalBackground(1);

    expect(actual).toEqual('123abc');
  });

  describe('getBetStatus', () => {
    const matchDetail = new MatchDetail();
    const match = new Match(matchDetail);
    const totalGames = new ResultDetail();
    totalGames.resourceId = ResourcesIds.totalGames;
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    match.resultDetails = [totalGames, resultOne, resultTwo];
    it('should return null when match is not volleyball', () => {
      match.matchDetail.sportType = SportType.badminton;

      const betStatus = service.getBetStatus(false, match);

      expect(betStatus).toBeNull();
    });

    it('should include refund betStatus when total game not checked and current betStatus include refund', () => {
      match.matchDetail.sportType = SportType.volleyBall;
      match.matchDetail.betStatus = "Refund;0-1";
      match.isScoreDirect = true;

      const betStatus = service.getBetStatus(false, match);

      expect(betStatus).toEqual("Refund;");
    });

    it('should return correct betStatus', () => {
      match.matchDetail.sportType = SportType.volleyBall;
      match.matchDetail.betStatus = "Refund;0-1";
      match.isScoreDirect = false;
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.homeValue = "1";
      resultOne.awayValue = "1";
      resultTwo.originalHomeValue = "1";
      resultTwo.originalAwayValue = "2";
      resultOne.checked = true;
      match.resultDetails = [totalGames, resultOne, resultTwo];

      const betStatus = service.getBetStatus(false, match);

      expect(betStatus).toEqual("Refund;1-1,1-2");
    });

    it('should return correct betStatus when unCal', () => {
      match.matchDetail.sportType = SportType.volleyBall;
      match.matchDetail.betStatus = "Refund;0-1";
      match.isScoreDirect = false;
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.homeValue = "1";
      resultOne.awayValue = "1";
      resultTwo.originalHomeValue = "1";
      resultTwo.originalAwayValue = "2";
      resultOne.checked = true;
      match.resultDetails = [totalGames, resultOne, resultTwo];

      const betStatus = service.getBetStatus(true, match);

      expect(betStatus).toEqual("Refund;0-0,1-2");
    });
  });
});