import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    ModalDialogComponent,
    ModalContentDialogComponent,
} from "../../shared/components";
import { MatchesComponent,
    ReCalculationComponent,
    RefundComponent,
} from './index';
import { Permission, Ball, HappyFive, Leagues, MatchDetail } from '../models';
import { PopupService, BallService } from '../services';
import { DialogBoxService } from '../../shared/services';
import { MaterialModule } from '../../shared/material-module';

describe('Happy 5 - Matches Component', () => {
    let component: MatchesComponent;
    let fixture: ComponentFixture<MatchesComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                MatchesComponent,
                ReCalculationComponent,
                RefundComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                NgbModal,
                PopupService,
                BallService,
                DialogBoxService
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(MatchesComponent);
                component = fixture.componentInstance;
                const league = new Leagues();
                const match = new MatchDetail();
                league.matches =  [match];
                const leagues: Leagues[] = [];
                const happyFive = new HappyFive();
                happyFive.leagues = leagues;
                happyFive.permission = new Permission(true, true, true);
                component.happyFive =  happyFive;
                component.permission = happyFive.permission;
            });
    }));


    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should returns leagues and permission not null', () => {
        component.ngOnChanges();

        expect(component.permission).not.toBeNull();
        expect(component.leagues).not.toBeNull();
    });

    it('should returns true when have permission on Recal', () => {
        const isRecal = component.isRecalculate(true);
        expect(isRecal).toBe(true);
    });

    it('should returns false when have not permission on Recal', () => {
        component.permission.canItAdmin = false;
        const isRecal = component.isRecalculate(false);
        expect(isRecal).toBe(false);
    });

    it('should returns true when have permission on Refund', () => {
        const isRecal = component.isRefund(true);
        expect(isRecal).toBe(true);
    });

    it('should returns false when have not permission on Refund', () => {
        component.permission.canItAdmin = false;
        const isRecal = component.isRefund(false);
        expect(isRecal).toBe(false);
    });

    it('should returns Red or Blue ball color with ball number', () => {
        const redBall = new Ball(123, 1, 3);
        expect(component.getColorBall(redBall)).toEqual("red");

        const blueBall = new Ball(123, 1, 2);
        expect(component.getColorBall(blueBall)).toEqual("blue");
    });

    it('should returns calculated background when match is completed', () => {
        expect(component.getBackground("completed")).toEqual("bg-calculated");
    });

    it('should returns refund background when match is refund', () => {
        expect(component.getBackground("refund")).toEqual("bg-refund");
    });

    it('should returns true when match is completed', () => {
        expect(component.isCompletedMatch("completed")).toBe(true);
    });
});