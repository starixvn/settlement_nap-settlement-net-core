import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DialogBoxService, HttpRequestService, BlockUIService, MessageBoxService } from './../../../shared/services';
import { RequestService, HandleActionsService, BackGroundService, DetectChangesService, PopupService } from './../../services';
import { MatchesComponent } from './matches.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material-module';
import { CalculationMatch, FilterQuery, } from '../../models';
import { BackgroundColor, CalculationStatus, EventStatus } from '../../../shared/constants';
import { Permission } from '../../../shared/models/sportsbook-sop/permission.model';
import { Remark } from '../../../shared/models/match-details/remark.model';


describe('MatchesComponent', () => {
    let component: MatchesComponent;
    let fixture: ComponentFixture<MatchesComponent>;
    let requestService: RequestService;
    let popupService: PopupService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MatchesComponent],
            providers: [
                BackGroundService,
                RequestService,
                PopupService,
                BlockUIService,
                DialogBoxService,
                HandleActionsService,
                HttpRequestService,
                MessageBoxService,
                DetectChangesService
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MatchesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        requestService = fixture.debugElement.injector.get(RequestService);
        popupService = fixture.debugElement.injector.get(PopupService);


    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit - should refresh matches', fakeAsync(() => {
        component.leagues = [{ leagueId: 1, leagueName: "A", directWaitingTime: 1, instantWaitingTime: 2, autoCalcSetting: null, matches: [] }];
        component.filterQuery = new FilterQuery();
        spyOn(requestService, 'refreshMatches');

        component.ngOnInit();
        tick(6000);
        component.ngOnDestroy();

        expect(requestService.refreshMatches).toHaveBeenCalled();
    }));

    describe('getStatusBackground', () => {
        it('should return background calculated when match is calculated', () => {
            const result = component.getStatusBackground(EventStatus.completed, EventStatus.completed);

            expect(result).toEqual(BackgroundColor.calculated);
        });

        it('should return background calculated when match is running', () => {
            const result = component.getStatusBackground(EventStatus.running, EventStatus.completed);

            expect(result).toEqual(BackgroundColor.autoSettleRunning);
        });
    });

    describe('getFastMarketsBackground', () => {
        it('should return background calculated when match is running', () => {
            const match: CalculationMatch = new CalculationMatch();
            match.fastMarketStatus = EventStatus.running;
            match.eventStatus = "";

            const result = component.getFastMarketsBackground(match);

            expect(result).toEqual(BackgroundColor.autoSettleRunningBlinking);
        });

        it('should return background calculated when match is calculated', () => {
            const match: CalculationMatch = new CalculationMatch();
            match.fastMarketStatus = EventStatus.completed;
            match.eventStatus = "";

            const result = component.getFastMarketsBackground(match);

            expect(result).toEqual(BackgroundColor.calculated);
        });
    });

    describe('isShowRefundLink', () => {
        it('should show refund link', () => {
            const match = new CalculationMatch()
            match.showLink = true;
            match.remark = new Remark();
            const per = new Permission();
            per.canRefund = true;
            component.permission = per;

            const result = component.isShowRefundLink(match);

            expect(result).toEqual(BackgroundColor.codeLink);
        });

        it('should hide refund link', () => {
            const match = new CalculationMatch()
            match.showLink = false;
            match.remark = new Remark();
            const per = new Permission();
            per.canRefund = false;
            component.permission = per;

            const result = component.isShowRefundLink(match);

            expect(result).toEqual('');
        });
    });

    describe('isShowEarlySettleLink', () => {
        it('should show early settle link', () => {
            const match = new CalculationMatch()
            match.showLink = true;
            match.remark = new Remark();
            const per = new Permission();
            per.canCalculate = true;
            per.canUncalculate = true;
            per.canRefund = true;
            component.permission = per;

            const result = component.isShowEarlySettleLink(match);

            expect(result).toEqual(BackgroundColor.codeLink);
        });

        it('should hide early settle link', () => {
            const match = new CalculationMatch();
            match.showLink = false;
            match.remark = new Remark();
            const per = new Permission();
            per.canCalculate = false;
            per.canUncalculate = false;
            per.canRefund = false;
            component.permission = per;

            const result = component.isShowEarlySettleLink(match);

            expect(result).toEqual('');
        });
    });

    it('getLog - should call popupService', () => {
        component.filterQuery = new FilterQuery();
        spyOn(popupService, 'popupLog');

        component.getLog('12345');

        expect(popupService.popupLog).toHaveBeenCalled();
    });

    it('popupEarly - should call popupService', () => {
        const match: CalculationMatch = new CalculationMatch();
        match.remark = new Remark();
        const per = new Permission();
        per.canRefund = true;
        component.permission = per;

        spyOn(popupService, 'openAndHandlePopup');

        component.popupEarly(match);

        expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it('popupFastMarkets - should call popupService', () => {
        const match: CalculationMatch = new CalculationMatch();
        match.remark = new Remark();
        match.isCalculatingSingle = 2;
        const per = new Permission();
        per.canRefund = true;
        component.permission = per;

        spyOn(popupService, 'popupFastMarkets');

        component.popupFastMarkets(match);

        expect(popupService.popupFastMarkets).toHaveBeenCalled();
    });
});
