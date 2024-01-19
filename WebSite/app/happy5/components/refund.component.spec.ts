import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RefundComponent } from './refund.component';
import { Ball, MatchDetail } from '../models';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { QueryService } from '../services';
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

describe('Refund Component', () => {
    const buttonName = "btn-danger";
    let toastrService: ToastrService;
    let component: RefundComponent;
    let queryService: QueryService;
    let messageBoxService: MessageBoxService;
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
                RefundComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
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
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()
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
            spyOn(toastrService, 'clear');

            messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call close function when click close popup', () => {
        spyOn(component.dialogRef, 'close').and.callThrough();
        component.closePopup();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });

    describe('refund', () => {
        it('should set error message when result is unsuccessful', fakeAsync(() => {
            spyOn(queryService, 'settle').and.returnValue(of(unSuccessfulResult));
            spyOn(toastrService, 'error');
            component.refund();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
        }));

        it('should not error message when result is successful', fakeAsync(() => {
            spyOn(queryService, 'settle').and.returnValue(of(successfulResult));
            spyOn(toastrService, 'error');

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