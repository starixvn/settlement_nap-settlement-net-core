import { NgModule } from '@angular/core';
import { AppComponent, ProviderSourceComponent, OutsideSourceComponent, AddSourceDialogComponent, EditSourceDialogComponent } from './components';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../shared/material-module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewMultipleSelectComponent } from '../shared/components';
import { GameStatusPipe, SourceStatusPipe, ExternalLinkPipe } from './pipes';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";


@NgModule({
  declarations: [
    AppComponent,
    ProviderSourceComponent,
    OutsideSourceComponent,
    NewMultipleSelectComponent,
    AddSourceDialogComponent,
    EditSourceDialogComponent,
    GameStatusPipe,
    SourceStatusPipe,
    ExternalLinkPipe
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule { }
