import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from '../environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './components/app.component';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [importProvidersFrom(NoopAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot({
      disableTimeOut: true,
      enableHtml: true,
      tapToDismiss: false,
      maxOpened: 1,
    })),
    provideHttpClient()
    ],
  }).catch(err => console.error(err));