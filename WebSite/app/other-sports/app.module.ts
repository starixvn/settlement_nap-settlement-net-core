import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
    AppComponent,
} from './components/app.component';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { ToastContainerModule, ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../shared/components/modal-dialog/modal-content-dialog.component';
import { SportTemplateModule } from './components/sport-template.module';
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
        ToastrModule.forRoot({
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
    bootstrap: [AppComponent],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }
    ],
})
export class AppModule {
}