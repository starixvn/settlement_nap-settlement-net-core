import { provideHttpClient } from "@angular/common/http";
import { enableProdMode, importProvidersFrom } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "../environments/environment";
import { AppComponent } from "./components/app.component";
import { ToastrModule } from 'ngx-toastr';


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(),
    importProvidersFrom(ToastrModule.forRoot({
      disableTimeOut: true,
      enableHtml: true,
      tapToDismiss: false,
      maxOpened: 1,
    })),
  ],
});
