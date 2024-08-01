import { HttpClientModule } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import AppComponent from './components/app.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserAnimationsModule),
  importProvidersFrom(ToastrModule.forRoot({
    disableTimeOut: true,
    enableHtml: true,
    tapToDismiss: false,
    maxOpened: 1,
  })),
  importProvidersFrom(HttpClientModule)
  ],
});