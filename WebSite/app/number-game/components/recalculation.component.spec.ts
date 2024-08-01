import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
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
import { MaterialModule } from '../../shared/material-module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../shared/language.native';

describe('NumberGame - Matches Component', () => {
    const buttonName = "btn-danger";
    let component: ReCalculationComponent;
    let queryService: QueryService;
    let verifyBallService: VerifyBallService;
    let toastrService: ToastrService;
    let fixture: ComponentFixture<ReCalculationComponent>;
    const balls: Ball[] = [];
    balls.push(new Ball(12345, 1, 9));
    balls.push(new Ball(12345, 2, 10));
    balls.push(new Ball(12345, 3, 11));
    const dialogMock = {
        close: () => { }
    };

    const match = new MatchDetail();
    match.matchId = 12345;
    const data = match;

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
                ToastContainerDirective,
                ToastrService,
                MessageBoxService,
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: data }
            ],
            imports: [
                BrowserAnimationsModule,
                NoopAnimationsModule,
                FormsModule,
                HttpClientModule,
                MaterialModule,
                NgbModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot()
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(ReCalculationComponent);
                component = fixture.componentInstance;
                component.balls = balls;
                component.matchDetail = match;
                queryService = fixture.debugElement.injector.get(QueryService);
                verifyBallService = fixture.debugElement.injector.get(VerifyBallService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
                jest.spyOn(toastrService, 'clear');
              });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call close function when click close popup', () => {
        jest.spyOn(component.dialogRef, 'close').mockImplementation();
        component.closePopup();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });

    it('getBalls - should return list balls', () => {
        const listBalls: Ball[] = [];
        listBalls.push(new Ball(12345, 1, 9));
        listBalls.push(new Ball(12345, 2, 10));
        jest.spyOn(queryService, 'getBallsByMatchId').mockReturnValue(of(listBalls));

        component.getBalls();

        const expectedBalls: Ball[] = [];
        expectedBalls.push(new Ball(12345, 1, 9));
        expectedBalls.push(new Ball(12345, 2, 10));
        expectedBalls.push(new Ball(12345, 3, null));
        expect(component.balls).toEqual(expectedBalls);
    });

    describe('onCheckBoxChange', () => {
        it('should set 2nd and 3rd ball disable when check 1st ball', () => {
            // Arrange
            balls[0].isNA = true;

            // Act
            component.onCheckBoxChange(balls[0]);

            // Assert
            expect(component.balls[1].isNA).toBe(true);
            expect(component.balls[1].isDisableCheckbox).toBe(true);
            expect(component.balls[2].isNA).toBe(true);
            expect(component.balls[2].isDisableCheckbox).toBe(true);
        });

        it('should set 3rd ball disable when check 2nd ball', () => {
            // Arrange
            balls[1].isNA = true;

            // Act
            component.onCheckBoxChange(balls[1]);

            // Assert
            expect(component.balls[2].isNA).toBe(true);
            expect(component.balls[2].isDisableCheckbox).toBe(true);
        });

        it('should enable checkbox when uncheck 1st ball', () => {
            // Arrange
            balls[0].isNA = false;

            // Act
            component.onCheckBoxChange(balls[0]);

            // Assert
            expect(component.balls[0].isDisableCheckbox).toBe(false);
        });
    });

    describe('reCalculate', () => {
        it('should error message when list are existed numberBall empty', fakeAsync(() => {
            const balls = { matchId : null , seq : null, color:null, eventStatus: null, isNA: false, isDisableCheckbox: false  };
            jest.spyOn(verifyBallService, 'emptyBall').mockReturnValue(balls);

            jest.spyOn(toastrService, 'error');
            component.reCalculate();
            tick(6000);

            expect(toastrService.error).toHaveBeenCalledWith(Language.gaming.emptyBall);
        }));

        it('should error message when numberball is out of range', fakeAsync(() => {
            const balls = { matchId : null , seq : null, color:null, eventStatus: null, isNA: false, isDisableCheckbox: false  };
            jest.spyOn(verifyBallService, 'outOfRangeBall').mockReturnValue(balls);

            jest.spyOn(toastrService, 'error');
            component.reCalculate();
            tick(6000);

            const expectedMessage = Language.gaming.outOfRangeBall.replace(/MIN/g, "1").replace(/MAX/g, "75");
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
        it('should return true when input out of range number', () => {
            // Arrange
            component.isPressedCalculate = true;

            // Act
            const result = component.isWarningOnBall(100);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when input acceptable number', () => {
            // Arrange
            component.isPressedCalculate = true;

            // Act
            const result = component.isWarningOnBall(1);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('getColorBall', () => {
        it('should return "disable" when input ball with out of range number', () => {
            // Act
            const result = component.getColorBall(new Ball(12345, 1, 100));

            // Assert
            expect(result).toEqual('disable');
        });

        it('should return "red" when input red ball', () => {
            // Act
            const result = component.getColorBall(new Ball(12345, 1, 10));

            // Assert
            expect(result).toEqual('red');
        });

        it('should return "blue" when input blue ball', () => {
            // Act
            const result = component.getColorBall(new Ball(12345, 1, 9));

            // Assert
            expect(result).toEqual('blue');
        });
    });
});