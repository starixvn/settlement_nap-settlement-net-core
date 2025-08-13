import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RefundComponent } from './refund.component';
import { Ball, MatchDetail } from '../models';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { QueryService } from '../services';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import {
    HttpRequestService,
    BlockUIService,
    MessageBoxService,
} from '../../shared/services';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('Refund Component', () => {
    const buttonName = "btn-danger";
    let toastrService: ToastrService;
    let component: RefundComponent;
    let queryService: QueryService;
    let fixture: ComponentFixture<RefundComponent>;
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
                RefundComponent
            ],
            providers: [
                QueryService,
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
                BrowserAnimationsModule,
                NoopAnimationsModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(RefundComponent);
            component = fixture.componentInstance;
            component.match = match;
            component.balls = balls;
            queryService = fixture.debugElement.injector.get(QueryService);
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

    describe('refund', () => {
        it('should set error message when result is unsuccessful', fakeAsync(() => {
            jest.spyOn(queryService, 'settle').mockReturnValue(of(unSuccessfulResult));
            jest.spyOn(toastrService, 'error');
            component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick(6000);
            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
        }));

        it('should not error message when result is successful', fakeAsync(() => {
            jest.spyOn(queryService, 'settle').mockReturnValue(of(successfulResult));
            jest.spyOn(toastrService, 'error');

            component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).not.toHaveBeenCalled();
        }));
    });

    it('should returns Red or Blue ball color with ball number', () => {
        const redBall = new Ball(123, 1, 3);
        expect(component.getColorBall(redBall)).toEqual("red");

        const blueBall = new Ball(123, 1, 2);
        expect(component.getColorBall(blueBall)).toEqual("blue");
    });
});