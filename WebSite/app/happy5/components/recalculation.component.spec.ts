import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReCalculationComponent } from './recalculation.component';
import { Ball, MatchDetail } from '../models';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { QueryService, VerifyBallService } from '../services';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
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
                BrowserAnimationsModule,
                NoopAnimationsModule,
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
            jest.spyOn(toastrService, 'clear');
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('reCalculate', () => {
        it('should error message when list are existed numberBall empty', fakeAsync(() => {
            const balls = { matchId : null , seq : null };
            
            jest.spyOn(verifyBallService, 'emptyBall').mockReturnValue(balls);

            jest.spyOn(toastrService, 'error');
            component.reCalculate();
            tick(6000);
            
            expect(toastrService.error).toHaveBeenCalledWith(Language.gaming.emptyBall);
        }));

        it('should error message when numberball is out of range', fakeAsync(() => {
            const balls = { matchId : null , seq : null };

            jest.spyOn(verifyBallService, 'outOfRangeBall').mockReturnValue(balls);

            jest.spyOn(toastrService, 'error');
            component.reCalculate();
            tick(6000);

            const expectedMessage = Language.gaming.outOfRangeBall.replace(/MIN/g, "1").replace(/MAX/g, "20");
            expect(toastrService.error).toHaveBeenCalledWith(expectedMessage);
        }));

        it('should error message when numberball is duplicated ball', fakeAsync(() => {
            jest.spyOn(verifyBallService, 'isDuplicateBall').mockReturnValue(true);

            jest.spyOn(toastrService, 'error');
            component.reCalculate();
            tick(6000);

            const expectedMessage = Language.gaming.duplicationBalls;
            expect(toastrService.error).toHaveBeenCalledWith(expectedMessage);
        }));

        it('should not error message when result is successful', fakeAsync(() => {
            jest.spyOn(queryService, 'settle').mockReturnValue(of(successfulResult));
            jest.spyOn(component.dialogRef, 'close').mockImplementation();
            jest.spyOn(queryService, 'getBallsByMatchId').mockReturnValue(of(balls));
            jest.spyOn(toastrService, 'error');

            component.reCalculate();
           
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick(6000);

            expect(toastrService.error).not.toHaveBeenCalled();
        }));

        it('should error message when result is unsuccessful', fakeAsync(() => {
            jest.spyOn(queryService, 'settle').mockReturnValue(of(unSuccessfulResult));
            jest.spyOn(component.dialogRef, 'close').mockImplementation();
            jest.spyOn(queryService, 'getBallsByMatchId').mockReturnValue(of(balls));
            jest.spyOn(toastrService, 'error');

            component.reCalculate();
            
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick(6000);

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