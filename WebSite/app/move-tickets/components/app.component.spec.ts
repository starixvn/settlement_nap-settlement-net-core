import { HttpClientModule } from "@angular/common/http";
import { ElementRef } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DatepickerComponent, ModalContentDialogComponent, NewMultipleSelectComponent } from "../../shared/components";
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
import { RunningTicketsComponent } from "./running-tickets/running-tickets.component";
import { PageType } from '../constants';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let elementRef: ElementRef<HTMLElement>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
            AppComponent,
            CricketComponent,
            LeagueComponent,
            FilterComponent,
            RunningTicketsComponent,
            DatepickerComponent,
            NewMultipleSelectComponent,
            ModalContentDialogComponent,
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
        ],
      })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
            elementRef = fixture.debugElement.injector.get(ElementRef);
        });
    }));

    it('should create',  waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should render cricket tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.cricket)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("cricket").length).toBeGreaterThanOrEqual(1);
    });

    it('should render running-tickets tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.runningTickets)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("running-tickets").length).toBeGreaterThanOrEqual(1);
    });
});