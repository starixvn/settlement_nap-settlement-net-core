import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective } from '../shared/directives';
import { ModalContentDialogComponent } from "../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { TimeSettingComponent, AutoSettingComponent, RemarkSettingComponent } from './components';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { AppComponent } from './components/app.component';
import { ProviderSelectionComponent } from './components/league-auto-settings/auto-payout-setting/provider-selection/provider-selection.component';
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        OnlyIntegerDirective
    ],
    declarations: [
        TimeSettingComponent,
        AppComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        AutoSettingComponent,
        RemarkSettingComponent
    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}