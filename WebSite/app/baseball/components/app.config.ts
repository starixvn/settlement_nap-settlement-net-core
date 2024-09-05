import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    VerificationBaseService, 
    ResultByTeamNamePipe,
    provideHttpClient(),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot({
      disableTimeOut: true,
      enableHtml: true,
      tapToDismiss: false,
      maxOpened: 1,
    })),
  ],
};