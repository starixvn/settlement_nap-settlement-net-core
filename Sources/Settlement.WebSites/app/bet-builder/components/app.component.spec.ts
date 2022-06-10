import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService } from '../../shared/services';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import {
    DatepickerComponent,
    MultipleSelectComponent,
    TreeViewComponent,
    ModalContentDialogComponent,
    MaterialDialogComponent,
    ModalDialogComponent,
    NewMultipleSelectComponent,
} from '../../shared/components';
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
                DatepickerComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                MultipleSelectComponent,
                TreeViewComponent,
                NewMultipleSelectComponent,
                MaterialDialogComponent,
                ScoreBySettlementPipe,
                ResultStatusPipe,
                SelectionPipe,
                TicketStatusPipe,
            ],
            providers: [
                { provide: BlockUIService },
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
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