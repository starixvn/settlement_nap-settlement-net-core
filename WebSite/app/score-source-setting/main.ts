import { AppComponent } from './components/app.component';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import {  NoopAnimationsModule } from '@angular/platform-browser/animations';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(NoopAnimationsModule),
        provideHttpClient()
    ],
  });