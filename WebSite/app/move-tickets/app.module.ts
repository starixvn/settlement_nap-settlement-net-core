import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TreeViewComponent } from './../shared/components/multiple-selection/tree-view.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
    AppComponent
} from './components/app.component';
import {
    CricketComponent,
    FilterComponent,
    LeagueComponent,
} from './components/cricket';
import {
    RunningTicketsComponent
} from './components/running-tickets/running-tickets.component';
import { MaterialModule } from "./../shared/material-module";
import {NewMultipleSelectComponent} from "./../shared/components/multiple-select/multiple-select.component";
import { MaterialDialogComponent } from '../shared/components/material-dialog-iframe/material-dialog.component';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { MoveTicketsTemplateModule } from './components/move-tickets-template.module';
import { OnlyIntegerDirective } from '../shared/directives';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';
import { ModalContentDialogComponent } from '../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { MultipleSelectComponent } from '../shared/components/multiple-selection/multiple-select.component.native';
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        MaterialModule,
        NgbModule,
        PipesModule,
        MoveTicketsTemplateModule,
        NewMultipleSelectComponent,
        DatepickerComponent,
        NoopAnimationsModule,
        OnlyIntegerDirective,
    ],
    declarations: [
        MultipleSelectComponent,
        TreeViewComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        MaterialDialogComponent,
        FilterComponent,
        LeagueComponent,
        CricketComponent,
        AppComponent,
        RunningTicketsComponent
    ],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})

export class AppModule {
}