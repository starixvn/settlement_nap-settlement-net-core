
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';
import { ModalContentDialogComponent } from '../shared/components/modal-dialog/modal-content-dialog.component';
import { MaterialDialogWithResponseComponent } from '../shared/components/material-dialog-iframe/material-dialog-with-response.component';
import {
    AppComponent,
    FilterComponent,
} from './components';
import { LeagueComponent } from './components/league.component';
import { MaterialModule } from "../shared/material-module";
import { NewMultipleSelectComponent } from "../shared/components/multiple-select/multiple-select.component";
import { MaterialDialogComponent } from '../shared/components/material-dialog-iframe/material-dialog.component';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { DynamicHeightDirective } from '../shared/directives';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TimeConverterPipe } from '../shared/pipes/time-converter.pipe';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        MaterialModule,
        PipesModule,
        NgbModule,
        DatepickerComponent,
        DynamicHeightDirective,
        NewMultipleSelectComponent,
        NoopAnimationsModule,
        MaterialDialogWithResponseComponent,
        MaterialDialogComponent,
        TimeConverterPipe
    ],
    declarations: [
        AppComponent,
        FilterComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        LeagueComponent,
    ],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})

export class AppModule {
}