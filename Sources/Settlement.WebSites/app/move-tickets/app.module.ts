
import { TreeViewComponent } from './../shared/components/multiple-selection/tree-view.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
    ModalDialogComponent,
    DatepickerComponent,
    MultipleSelectComponent,
    ModalContentDialogComponent,
} from '../shared/components';
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
    ],
    declarations: [
        DatepickerComponent,
        MultipleSelectComponent,
        TreeViewComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        NewMultipleSelectComponent,
        MaterialDialogComponent,
        FilterComponent,
        LeagueComponent,
        CricketComponent,
        AppComponent,
        RunningTicketsComponent,
        OnlyIntegerDirective,
    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})

export class AppModule {
}