import { HttpClientModule } from "@angular/common/http";
import { ElementRef } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DatepickerComponent } from "../../shared/components/date-picker/date-picker.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { MaterialModule } from "../../shared/material-module";
import { PipesModule } from "../../shared/pipes/pipes.module.native";
import { BlockUIService,
        DialogBoxService,
        GenerateFilterService,
        HttpRequestService,
        MessageBoxService,
        ReCheckInService,
        SportMatchService,
        VerifyDateService
} from "../../shared/services";
import { AppComponent } from "./app.component";
import { CricketComponent, FilterComponent, LeagueComponent } from "./cricket";
import { MoveTicketsTemplateModule } from "./move-tickets-template.module";

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
            AppComponent,
            CricketComponent,
            LeagueComponent,
            FilterComponent,
        ],
        providers: [
            BlockUIService,
            MessageBoxService,
            VerifyDateService,
            MessageBoxService,
            GenerateFilterService,
            BlockUIService,
            HttpRequestService,
            NgbActiveModal,
            ReCheckInService,
            DialogBoxService,
            SportMatchService,
        ],
        imports: [
            BrowserModule,
            FormsModule,
            ReactiveFormsModule,
            HttpClientModule,
            MaterialModule,
            PipesModule,
            NgbModule,
            MoveTicketsTemplateModule,
            DatepickerComponent,
            ModalContentDialogComponent,
            NewMultipleSelectComponent,
            NoopAnimationsModule,
        ],
      })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
        });
    }));

    it('should create',  waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should have blockUI property', () => {
        expect(component.blockUI).toBeDefined();
        expect(typeof component.blockUI).toBe('boolean');
    });

    it('should render container div', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('div')).toBeTruthy();
    });
});