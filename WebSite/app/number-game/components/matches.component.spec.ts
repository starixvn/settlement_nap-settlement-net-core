import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import { MatchesComponent, ReCalculationComponent, BallsComponent } from './index';
import { Permission, Leagues, NumberGame, MatchDetail } from '../models';
import { MaterialModule } from '../../shared/material-module';
import { PopupService } from '../services/popup.service';
import { DialogBoxService } from '../../shared/services';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('NumberGame - Matches Component', () => {
    let component: MatchesComponent;
    let fixture: ComponentFixture<MatchesComponent>;
    let popupService: PopupService;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                MatchesComponent,
                ReCalculationComponent,
                BallsComponent
            ],
            providers: [
                PopupService , 
                DialogBoxService,
                ToastContainerDirective,
                ToastrService,
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(MatchesComponent);
                component = fixture.componentInstance;
                const numberGame = new NumberGame();
                numberGame.permission = new Permission(true, true);
                const leagues: Leagues[] = [];
                leagues.push(new Leagues());
                numberGame.leagues = leagues;
                component.numberGame =  numberGame;
                component.permission = numberGame.permission;
                popupService = fixture.debugElement.injector.get(PopupService);
            });
    }));

    it('should returns true when have permission on Recal', () => {
        const isRecal = component.isRecalculate(true);
        
        expect(isRecal).toBe(true);
    });

    it('should returns false when have not permission on Recal', () => {
        component.permission.canItAdmin = false;
        const isRecal = component.isRecalculate(false);
        
        expect(isRecal).toBe(false);
    });

    it('should returns calculated background when match is completed', () => {
        expect(component.getBackground("completed")).toEqual("bg-calculated");
    });

    it('should returns refund background when match is refund', () => {
        expect(component.getBackground("refund")).toEqual("bg-refund");
    });

    it('should expected leagues and permission', () => {
        component.ngOnChanges();
        const expectedPermission = new Permission(true, true);
        expect(expectedPermission).toEqual(component.permission);
        expect(component.leagues.length).toBeGreaterThanOrEqual(1);
    });

    describe('openPopup function', () => {
        it('should open Popup log when click on link.', () => {
            const matchId = 123;
            jest.spyOn(popupService, 'popupLog');
            component.openLog(matchId);
            expect(popupService.popupLog).toHaveBeenCalled();
        });

        it('should open Popup Calc when click on link.', () => {
            const match = new MatchDetail();
            jest.spyOn(popupService, 'popupReCalc');
            component.openReCalc(match);
            expect(popupService.popupReCalc).toHaveBeenCalled();
        });
    });
});