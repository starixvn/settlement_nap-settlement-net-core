import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../shared/material-module';
import { PageComponent } from './components';
import AppComponent from './components/app.component';
import { FilterComponent } from './components/main-page/filter.component';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { DatepickerComponent } from "../shared/components/date-picker/date-picker.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';


@NgModule({
    declarations: [
        FilterComponent,
        AppComponent,
        PageComponent,
        DatepickerComponent
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
    ]
})
export class AppModule { }
