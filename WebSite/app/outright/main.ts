
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { environment } from '../environments/environment';
import AppComponent from './components/app.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserAnimationsModule),
  importProvidersFrom(NoopAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot({
        disableTimeOut: true,
        enableHtml: true,
        tapToDismiss: false,
        positionClass: 'inline',
        maxOpened: 1,
    })),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(MatDialogModule),

    ]
}).catch(err => console.error(err));