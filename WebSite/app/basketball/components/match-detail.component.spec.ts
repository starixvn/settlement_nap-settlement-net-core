import * as _ from 'lodash';
import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatchDetailComponent } from './match-detail.component';
import { Match } from '../models';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { BasketballService, BetStatusService } from '../services';
import { ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';

describe('Component: MatchDetailComponent', () => {
    let component: MatchDetailComponent;
    let fixture: ComponentFixture<MatchDetailComponent>;
    let basketballService: BasketballService;

    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "Q1";
    resultDetail.map = 0;
    resultDetail.awayValue = "1";
    resultDetail.homeValue = "2";
    resultDetail.resultStatusId = 1;
    resultDetail.resultSettingData = new ResultSettingModel();
    const matchDetail = new MatchDetail();
    matchDetail.playTime = 1;
    const match = new Match(matchDetail);
    match.permission = new Permission();
    match.permission.isLeader = true;
    match.resultDetails = [resultDetail];
    const resultDetails = [resultDetail, resultDetail];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                MessageBoxService,
                BasketballService,
                HttpRequestService,
                BlockUIService,
                BetStatusService,
                IntervalBackgroundPipe,
                ResourceNameByIdPipe,
                NgbModal,
                { provide: MessageBoxService, useClass: MessageBoxService },
            ],
            imports: [
                HttpClientModule,
                MatchDetailComponent,
                ScoreBySettlementPipe
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(MatchDetailComponent);
                component = fixture.componentInstance;
                basketballService = fixture.debugElement.injector.get(BasketballService);
                basketballService.getResultDetail = jest.fn().mockReturnValue(resultDetails);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnInit - should set components properties', () => {
        component.match = match;

        component.ngOnInit();
        expect(component.matchDetail).toEqual(match.matchDetail);
        expect(component.resultDetails).not.toBeNull();
    });

    describe('getClass', () => {
        it('should return final-score when resourceId == 00', () => {
            const result = _.clone(resultDetail);
            result.resourceId = "00";
            result.ticketStatus = "Running";
            const className = component.getClass(result);
            expect("final-score ").toEqual(className);
        });

        it('should return ht-score when resourceId == 01', () => {
            const result = _.clone(resultDetail);
            result.resourceId = "01";
            result.ticketStatus = "Running";
            const className = component.getClass(result);
            expect("ht-score ").toEqual(className);
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
    });
});
