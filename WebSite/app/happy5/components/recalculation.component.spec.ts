import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReCalculationComponent } from './recalculation.component';
import { Ball, MatchDetail } from '../models';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { QueryService, VerifyBallService } from '../services';
import {
    ModalDialogComponent,
    ModalContentDialogComponent,
} from '../../shared/components';
import {
    HttpRequestService,
    BlockUIService,
    MessageBoxService,
} from '../../shared/services';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Language } from '../../shared/language.native';

describe('Recalculation Component', () => {
    const buttonName = "btn-danger";
    let component: ReCalculationComponent;
    let queryService: QueryService;
    let verifyBallService: VerifyBallService;
    let messageBoxService: MessageBoxService;
    let modalService: NgbModal;
    let toastrService: ToastrService;
    let fixture: ComponentFixture<ReCalculationComponent>;
    const balls: Ball[] = [];
    balls.push(new Ball(12345, 1, 9));
    balls.push(new Ball(12345, 2, 10));
    balls.push(new Ball(12345, 3, 11));

    const match = new MatchDetail();
    match.matchId = 12345;

    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const unSuccessfulResult = {
        errCode: 0,
        errMsg: "error message",
        isSuccessful: false,
    };
    const dialogMock = {
        close: () => { }
    };
   
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReCalculationComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                QueryService,
                VerifyBallService,
                HttpRequestService,
                BlockUIService,
                NgbModal,
                MessageBoxService,
                ToastContainerDirective,
                ToastrService,
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: match }
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()
            ],
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(ReCalculationComponent);
            component = fixture.componentInstance;
            component.match = match;
            component.balls = balls;
            queryService = fixture.debugElement.injector.get(QueryService);
            verifyBallService = fixture.debugElement.injector.get(VerifyBallService);
            messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
            modalService = fixture.debugElement.injector.get(NgbModal);
            toastrService = fixture.debugElement.injector.get(ToastrService);
            spyOn(toastrService, 'clear');
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('reCalculate', () => {
        it('should error message when list are existed numberBall empty', fakeAsync(() => {
            spyOn(verifyBallService, 'emptyBall').and.returnValue(balls);

            spyOn(toastrService, 'error');
            component.reCalculate();

            expect(toastrService.error).toHaveBeenCalledWith(Language.gaming.emptyBall);
        }));

        it('should error message when numberball is out of range', fakeAsync(() => {
            spyOn(verifyBallService, 'outOfRangeBall').and.returnValue(balls);

            spyOn(toastrService, 'error');
            component.reCalculate();

            const expectedMessage = Language.gaming.outOfRangeBall.replace(/MIN/g, "1").replace(/MAX/g, "20");
            expect(toastrService.error).toHaveBeenCalledWith(expectedMessage);
        }));

        it('should error message when numberball is duplicated ball', fakeAsync(() => {
            spyOn(verifyBallService, 'isDuplicateBall').and.returnValue(true);

            spyOn(toastrService, 'error');
            component.reCalculate();

            const expectedMessage = Language.gaming.duplicationBalls;
            expect(toastrService.error).toHaveBeenCalledWith(expectedMessage);
        }));

        it('should not error message when result is successful', fakeAsync(() => {
            spyOn(queryService, 'settle').and.returnValue(of(successfulResult));
            spyOn(component.dialogRef, 'close').and.callThrough();
            spyOn(queryService, 'getBallsByMatchId').and.returnValue(of(balls));
            spyOn(toastrService, 'error');

            component.reCalculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).not.toHaveBeenCalled();
        }));

        it('should error message when result is unsuccessful', fakeAsync(() => {
            spyOn(queryService, 'settle').and.returnValue(of(unSuccessfulResult));
            spyOn(component.dialogRef, 'close').and.callThrough();
            spyOn(queryService, 'getBallsByMatchId').and.returnValue(of(balls));
            spyOn(toastrService, 'error');

            component.reCalculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
        }));
    });

    describe('isWarningOnBall', () => {
        it('should return "true" when input out of range number', () => {
            // Arrange
            component.isPressedCalculate = true;

            // Act
            const result = component.isWarningOnBall(21);

            // Assert
            expect(result).toBe(true);
        });

        it('should return "true" when input acceptable number', () => {
            // Arrange
            component.isPressedCalculate = true;

            // Act
            const result = component.isWarningOnBall(1);

            // Assert
            expect(result).toBe(false);
        });
    });
});