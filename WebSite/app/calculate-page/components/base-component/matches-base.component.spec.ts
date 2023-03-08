import { Remark } from './../../../shared/models/match-details/remark.model';
import { Language } from '../../../shared/language.native';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MaterialModule } from "../../../shared/material-module";
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { BackGroundService, DetectChangesService, HandleActionsService, PopupService, RequestService } from "../../services";
import { MatchesBaseComponent } from "./matches-base.component";
import { CalculationMatch } from '../../models';
import { BackgroundColor, CalculationStatus } from '../../../shared/constants';
import { Permission } from '../../../shared/models/sportsbook-sop';

describe('MatchesBaseComponent', () => {
    let component: MatchesBaseComponent;
    let fixture: ComponentFixture<MatchesBaseComponent>;
    let backGroundService: BackGroundService;
    let popupService: PopupService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                MatchesBaseComponent],
            providers: [
                PopupService,
                RequestService,
                BackGroundService,
                DialogBoxService,
                HandleActionsService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                DetectChangesService
            ],
            imports: [
                MaterialModule,
                HttpClientModule
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MatchesBaseComponent);
        component = fixture.componentInstance;
        backGroundService = fixture.debugElement.injector.get(BackGroundService);
        popupService = fixture.debugElement.injector.get(PopupService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('popupCalc - Open popup Calculation', () => {
        const match = new CalculationMatch();
        match.matchId = "123";
        spyOn(popupService, 'openAndHandlePopup');

        component.popupCalc(match);

        expect(popupService.openAndHandlePopup).toHaveBeenCalledWith("apps/soccer-recalculate?matchId=123", Language.CalcPopupTitle, "800px", "800px", match);
    });

    it('popupRefund - Open popup refund', () => {
        const match = new CalculationMatch();
        match.matchId = "123";
        spyOn(popupService, 'openAndHandlePopup');

        component.popupRefund(match);

        expect(popupService.openAndHandlePopup).toHaveBeenCalledWith("apps/soccer-refund?matchId=123", Language.RefundPopupTitle, "790px", "600px", match);
    });

    describe('isChangeSetting', () => {
        const match = new CalculationMatch();
        test.each([
            [CalculationStatus.calculating, CalculationStatus.success],
            [CalculationStatus.waiting, CalculationStatus.success],
            [CalculationStatus.success, CalculationStatus.calculating],
            [CalculationStatus.success, CalculationStatus.waiting],
            [CalculationStatus.waiting, CalculationStatus.waiting],
            [CalculationStatus.calculating, CalculationStatus.calculating],
        ])('Not open popup when match in processing', (isCalculatingSingle: number, isCalculatingMP: number) => {
            match.isCalculatingSingle = isCalculatingSingle;
            match.isCalculatingMP = isCalculatingMP;
            spyOn(popupService, 'popupChangeRemark');

            component.popupChangeRemarkSetting(match);

            expect(popupService.popupChangeRemark).not.toHaveBeenCalled();
        });

        it('should open popup when match not in process', () => {
            match.isCalculatingSingle = CalculationStatus.success;
            match.isCalculatingMP = CalculationStatus.manualFail;
            spyOn(popupService, 'popupChangeRemark');

            component.popupChangeRemarkSetting(match);

            expect(popupService.popupChangeRemark).toHaveBeenCalled();

        });
    });

    test.each([
        [true, false, false, false, false, `${BackgroundColor.undecidedRow} `],
        [false, true, false, false, false, `${BackgroundColor.undecidedRow} `],
        [false, false, true, false, false, `${BackgroundColor.undecidedRow} `],
        [false, false, false, true, false, `${BackgroundColor.undecidedRow} `],
        [false, false, false, false, true, ' even'],
        [true, false, false, false, true, `${BackgroundColor.undecidedRow} even`],
        [false, false, false, false, false, " "]])
        ('rowColor - should return color undecided and even', (mtdHold: boolean, undecided: boolean, underSettle: boolean, keyHold: boolean, isEven: boolean, expected: string) => {
            const remark = new Remark();
            remark.isKeyHold = keyHold;
            remark.isMtdHold = mtdHold;
            remark.isUnderSettle = underSettle;
            remark.isUndecided = undecided;

            const actual = component.rowColor(remark, isEven);

            expect(actual).toEqual(expected);
        });

    test.each([
        [true, false, ""],
        [false, true, ""],
        [false, false, ""],
        [true, true, BackgroundColor.codeLink]
    ])('isShowCalculationLink - enable link when has permission and can show link', (isShow: boolean, hasPermission: boolean, expected: string) => {
        const permission = new Permission();
        permission.canCalculate = hasPermission;
        component.permission = permission;
        spyOn(backGroundService, 'isShowLink').and.returnValue(isShow);

        const actual = component.isShowCalculationLink(new CalculationMatch());

        expect(actual).toEqual(expected);
    });

    test.each([
        [true, false, ""],
        [false, true, ""],
        [false, false, ""],
        [true, true, BackgroundColor.codeLink]
    ])('isShowRefundLink - enable link when has permission and can show link', (isShow: boolean, hasPermission: boolean, expected: string) => {
        const permission = new Permission();
        permission.canRefund = hasPermission;
        component.permission = permission;
        spyOn(backGroundService, 'isShowLink').and.returnValue(isShow);

        const actual = component.isShowRefundLink(new CalculationMatch());

        expect(actual).toEqual(expected);
    });
});