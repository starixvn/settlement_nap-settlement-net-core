import { AppSettingComponent } from './components/app.component';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppSettingComponent, {
    providers: [
    importProvidersFrom(HttpClientModule)
    ],
  }).catch(err => console.error(err));