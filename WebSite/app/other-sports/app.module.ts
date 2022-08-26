import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
    ModalDialogComponent,
    ModalContentDialogComponent
} from '../shared/components';
import {
    AppComponent,
} from './components/app.component';
import { SportTemplateModule } from './components/sport-template.module';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { ToastContainerModule, ToastNoAnimationModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        SportTemplateModule,
        BrowserAnimationsModule,
        ToastNoAnimationModule.forRoot({
            disableTimeOut: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: 'inline',
            maxOpened: 1,
        }),
        ToastContainerModule,
    ],
    declarations: [
        AppComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    bootstrap: [AppComponent],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }
    ],
})
export class AppModule {
}