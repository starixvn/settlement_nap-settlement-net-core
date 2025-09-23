import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
    AppComponent,
} from './components/app.component';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { ToastContainerDirective, ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SportTemplateModule } from './components/sport-template.module';
import { FullTimeCalculationComponent } from './components/only-fulltime/fulltime-calculation.component';
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
        ToastContainerDirective 
    ],
    declarations: [
        AppComponent,
        
    ],
    bootstrap: [AppComponent],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }
    ],
})
export class AppModule {
}