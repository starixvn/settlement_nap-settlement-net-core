import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from '../environments/environment';

import { AppComponent } from './components/app.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { MaterialModule } from '../shared/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, HttpClientJsonpModule } from '@angular/common/http';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, FormsModule, ReactiveFormsModule, HttpClientJsonpModule, MaterialModule, PipesModule, NgbModule),
        { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideNoopAnimations(),
    ]
});