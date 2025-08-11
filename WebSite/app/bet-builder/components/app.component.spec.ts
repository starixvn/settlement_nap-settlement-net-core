import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService } from '../../shared/services';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { MaterialDialogComponent } from '../../shared/components/material-dialog-iframe/material-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';
import {
    FilterComponent,
    MatchesComponent,
    MatchDetailComponent,
    CalculationComponent,
} from './';
import { ResultStatusPipe, SelectionPipe, TicketStatusPipe } from '../pipes';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../../shared/material-module';

describe('Component: App', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                FilterComponent,
                MatchesComponent,
                MatchDetailComponent,
                CalculationComponent,
                ResultStatusPipe,
                SelectionPipe,
                TicketStatusPipe,
            ],
            providers: [
                { provide: BlockUIService },
            ],
            imports: [
                ScoreBySettlementPipe,
                MaterialDialogComponent,
                NewMultipleSelectComponent,
                DatepickerComponent,
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));
});