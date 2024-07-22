import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './components/app.component';
import { appConfig } from './components/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
