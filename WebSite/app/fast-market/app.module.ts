import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  HttpClientModule,
  HttpClientJsonpModule,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import {
  AppComponent,
  MatchDetailComponent,
  FilterComponent,
  BetTypesComponent,
  SpecialSessionComponent,
  InputScoreFormComponent,
} from "./components";
import {
  ResultStatusPipe,
  TicketStatusPipe,
  IntervalPipe,
  SpecialTimePipe,
  SpecialTimeEventCounterPipe,
} from "./pipes";
import { OnlyIntegerDirective, FocusDirective } from "../shared/directives";
import { MaterialModule } from "../shared/material-module";
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { ToastContainerModule, ToastNoAnimationModule } from "ngx-toastr";
import { NewMultipleSelectComponent } from "../shared/components/multiple-select/multiple-select.component";

import { ModalDialogComponent } from "../shared/components/modal-dialog/modal-dialog.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { InputOuScoreComponent } from "./components/input-ou-score/input-ou-score.component";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    NgbModule,
    MaterialModule,
    ToastNoAnimationModule.forRoot({
      disableTimeOut: true,
      enableHtml: true,
      tapToDismiss: false,
      positionClass: "inline",
      maxOpened: 3,
    }),
    ToastContainerModule,
    OnlyIntegerDirective,
    NoopAnimationsModule,
    NewMultipleSelectComponent,
    ModalDialogComponent,
  ],
  declarations: [
    AppComponent,
    MatchDetailComponent,
    FilterComponent,
    BetTypesComponent,
    ResultStatusPipe,
    TicketStatusPipe,
    IntervalPipe,
    FocusDirective,
    SpecialSessionComponent,
    SpecialTimePipe,
    SpecialTimeEventCounterPipe,
    InputScoreFormComponent,
    InputOuScoreComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpRequestInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
