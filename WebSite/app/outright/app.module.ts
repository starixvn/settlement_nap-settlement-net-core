import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../shared/material-module';
import AppComponent from './components/app.component';
import { FilterComponent } from './components/main-page/filter.component';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { DatepickerComponent } from "../shared/components/date-picker/date-picker.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { OutrightService } from './services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../shared/services';
import { LeagueTeamComponent } from './components/main-page/league-team.component';
import { DynamicHeightDirective } from '../shared/directives';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { LogComponent } from './components';


@NgModule({
    declarations: [
        FilterComponent,
        AppComponent,
        LeagueTeamComponent,
        DatepickerComponent,
        DynamicHeightDirective,
        LogComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        MaterialModule,
        PipesModule,
        NgbModule,
        HttpClientModule,
        HttpClientJsonpModule,
    ],
    providers: [
        OutrightService,
        VerifyDateService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService 
    ],
    entryComponents: [ModalDialogComponent],

})
export class AppModule { }
