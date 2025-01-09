import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../environments/environment';
import { AppModule } from './app.module.native';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './components/app.component';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

// bootstrapApplication(AppComponent, {
//     providers: [
//         importProvidersFrom(BrowserAnimationsModule),
//         importProvidersFrom(ToastrModule.forRoot({
//             disableTimeOut: true,
//             enableHtml: true,
//             tapToDismiss: false,
//             maxOpened: 1,
//             to
//         }))
//     ]
// })