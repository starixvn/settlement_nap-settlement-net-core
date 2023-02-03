import { DatePipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { League, Sport } from '../../models';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { allLeague, Statuses } from '../../constants/Options';
import { HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { OutrightService } from '../../services/outright.service';
import { FilterRequest } from '../../models/filter-request.model';
import { ModalDialogMessage } from '../../../shared/models';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';
import { Resources } from '../../constants/Resources';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent],
    providers: [DatePipe, VerifyDateService, OutrightService, HttpRequestService, MessageBoxService,
    ],
})
export class FilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly requestEmitter = new EventEmitter();
    @Output() public readonly enableRefresh = new EventEmitter();

    private verifyDateService: VerifyDateService;
    private outrightService: OutrightService;
    private calendar: NgbCalendar;
    private messageBoxService: MessageBoxService

    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;

    public sportSelected: number;
    public sportOptions: Sport[] = [];

    public leagueSelected: number;
    public leagueOptions: League[] = [];

    public statusOptions: any[] = Statuses;
    public statusSelected: number;

    public moveBetsDay: NgbDateStruct;
    public maxDate: NgbDateStruct;

    public warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(protected injector: Injector) { }

    ngOnInit(): void {
        this.verifyDateService = this.injector.get(VerifyDateService);
        this.outrightService = this.injector.get(OutrightService);
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.calendar = this.injector.get(NgbCalendar);

        this.initFilterData();
    }

    private initFilterData() {
        this.outrightService.getFilterView().subscribe((res: any) => {
            this.fromDate = this.verifyDateService.convertToDateStruct(res.fromDate);
            this.toDate = this.verifyDateService.convertToDateStruct(res.toDate);
            this.moveBetsDay = this.verifyDateService.convertToDateStruct(res.moveBetsDay);
            this.maxDate = this.calendar.getToday();

            this.sportOptions = res.sports;
            this.leagueOptions = [allLeague, ...res.leagues];
            this.leagueSelected = 0;
            this.sportSelected = 1;
            this.statusSelected = 0;
        })
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
            this.renderLeague(this.fromDate, this.toDate, this.sportSelected)
        }
    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
            this.renderLeague(this.fromDate, this.toDate, this.sportSelected)
        }
    }

    public onSelectSport(value: any) {
        this.sportSelected = value;
        this.renderLeague(this.fromDate, this.toDate, this.sportSelected)
    }

    private async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct, sportType: number) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);

        if (this.isValidInput(fromDate, toDate)) {
            this.outrightService.getLeagues({ fromDate: fromDateValue, toDate: toDateValue, sportType }).subscribe(res => {
                this.leagueOptions = [allLeague, ...res]
            })
        } else {
            this.leagueOptions = [allLeague]
        }
    }

    private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        return this.verifyDateService.validDate(fromDate, toDate);
    }

    private showWarningMessage(message: string) {
        this.warningDialogMessage.title = Resources.warningTitle;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }

    search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);
        const moveBetsDay = this.verifyDateService.dateFormat(this.moveBetsDay);

        const request: FilterRequest = {
            fromDate: fromDate,
            toDate,
            statusId: this.statusSelected,
            sportType: this.sportSelected,
            leagueId: this.leagueSelected,
            moveBetsDay
        }

        if (!this.isValidInput(this.fromDate, this.toDate)) {
            this.showWarningMessage(Resources.invalidDate);
            return;
        }

        this.outrightService.filter(request).subscribe(res => {
            this.searchAction.emit(res);
            this.requestEmitter.emit(request);
        })
    }
}
