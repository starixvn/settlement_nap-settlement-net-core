import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from "@angular/core/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { MatchDetailComponent } from ".";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
} from "../../shared/services";
import { ScoreBySettlementPipe } from "../../shared/pipes/score-by-settlement.pipe";
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import * as _ from 'lodash';
import { ResultDetail } from "../../shared/models/sportsbook-sop";

describe("E-sport - Refund Match Detail Component", () => {
  let component: MatchDetailComponent;
  let fixture: ComponentFixture<MatchDetailComponent>;
  const resultDetail = new ResultDetail();
  resultDetail.betTypeName = "Test bet type name";
  resultDetail.resourceId = "M1";
  resultDetail.resultStatusId = 1;
  resultDetail.checked = false;
  resultDetail.isShow = true;
  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [
        MatchDetailComponent,
        ScoreBySettlementPipe,
      ],
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        IntervalBackgroundPipe,
        NgbModal,
      ],
      imports: [FormsModule, HttpClientModule, NgbModule],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(MatchDetailComponent);
        component = fixture.componentInstance;
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  describe("getClass", () => {
    describe('getClass', () => {
      it('should return final-score when resourceId == 00', () => {
        const result = _.clone(resultDetail);
        result.resourceId = "00";
        const className = component.getClass(result);
        expect("final-score ").toEqual(className);
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
});
