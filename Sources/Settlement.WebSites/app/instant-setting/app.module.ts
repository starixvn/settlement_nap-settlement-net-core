import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective } from '../shared/directives';
import { ModalContentDialogComponent } from "../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { TimeSettingComponent, AppComponent, AutoSettingComponent, RemarkSettingComponent } from './components';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
    ],
    declarations: [
        TimeSettingComponent,
        AppComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        OnlyIntegerDirective,
        AutoSettingComponent,
        RemarkSettingComponent,
    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}