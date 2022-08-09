import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TennisService } from '../services';
import { MatchDetailComponent } from './match-detail.component';
import { ResourceHeaderPipe } from '../pipes';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';

import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  AioService
} from '../../shared/services';
import {Match } from '../models';
import * as _ from 'lodash';
import { MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';

describe('MatchDetailComponent', () => {
  let component: MatchDetailComponent;
  let fixture: ComponentFixture<MatchDetailComponent>;
  let tennisService: TennisService;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  match.permission = new Permission();
  match.permission.isLeader = true;
  const resultDetail = new ResultDetail();
  const resultDetails = [resultDetail, resultDetail];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MatchDetailComponent,
        ResourceHeaderPipe,
        ScoreBySettlementPipe],
      providers: [
        TennisService,
        AioService,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        IntervalBackgroundPipe,
        NgbModal,
        { provide: MessageBoxService, useClass: MessageBoxService },

      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(MatchDetailComponent);
        component = fixture.componentInstance;
        tennisService = fixture.debugElement.injector.get(TennisService);
        spyOn(tennisService, 'getResultDetail').and.returnValue(resultDetails);
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set matchDetail and call tennisService.getResultDetail', () => {
    // Arrange
    component.match = match;

    // Act
    component.ngOnInit();

    // Assert
    expect(component.matchDetail).toEqual(component.match.matchDetail);
    expect(tennisService.getResultDetail).toHaveBeenCalled();
  });

  describe('getClass', () => {
    it('should return final-score when resourceId == 00', () => {
      const result = _.clone(resultDetail);
      result.resourceId = "00";
      const className = component.getClass(result);
      expect("final-score ").toEqual(className);
    });

    it('should return total-point when resourceId == 06', () => {
      const result = _.clone(resultDetail);
      result.resourceId = "06";
      const className = component.getClass(result);
      expect("total-point ").toEqual(className);
    });

    it('should return calculated when settlementStatusId == 4', () => {
      const result = _.clone(resultDetail);
      result.settlementStatusId = 4;
      result.ticketStatus = "Calculated";
      const className = component.getClass(result);
      expect("calculated").toEqual(className);
    });

    it('should return empty when settlementStatusId != 4', () => {
      const result = _.clone(resultDetail);
      result.settlementStatusId = 0;
      result.ticketStatus = "Running";
      const className = component.getClass(result);
      expect(className).toEqual("");
    });

    it('should return Refunded when settlementStatusId == 1', () => {
      const result = _.clone(resultDetail);
      result.settlementStatusId = 1;
      result.ticketStatus = "Refunded";
      const className = component.getClass(result);
      expect(className).toEqual("refunded");
    });
  });
});
