import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AutoCalculatePageComponent } from './auto-calculation/auto-calculate-page.component';
import { AutoCalculateFilterComponent } from './auto-calculation/auto-calculate-filter.component';
import { AutoCalculateMatchesComponent } from './auto-calculation/auto-calculate-matches.component';
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { MatchesBaseComponent, PageBaseComponent } from './base-component';
import { PageComponent} from './calculation/page.component'
import { FilterComponent} from './calculation/filter.component'
import { MatchesComponent} from './calculation/matches.component'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../../shared/material-module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        AppComponent,
        PageComponent,
        AutoCalculatePageComponent,
        AutoCalculateFilterComponent,
        AutoCalculateMatchesComponent,
        FilterComponent,
        MatchesComponent,
        DatepickerComponent,
        ModalDialogComponent,
        NewMultipleSelectComponent,
        MatchesBaseComponent, 
        PageBaseComponent,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      providers: [
      ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
});
