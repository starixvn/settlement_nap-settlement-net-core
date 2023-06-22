import { Component, EventEmitter, Output, OnInit, Input } from "@angular/core";
import { DatePipe } from "@angular/common";
import * as _ from 'lodash';
import { NgbDateStruct, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { CustomNgbDateParserFormatter } from '../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { UrlHelper } from '../../helper';
import { SearchService } from '../services';
import { ModalDialogMessage } from '../../shared/models';
import { MessageBoxService, VerifyDateService } from '../../shared/services';
import { Match, Filter, LogQuery } from '../models';
import { LogType, LogTypeFilter, ResettleType } from "../constants/log-Type";

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})

export class FilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter<LogQuery>();
    @Output() public readonly matches = new EventEmitter<Match[]>();
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public filter = new Filter();
    readonly filterType = LogTypeFilter;
    readonly resettleType = ResettleType;

    constructor(
        private readonly verifyDateService: VerifyDateService,
        private readonly messageBoxService: MessageBoxService,
        private readonly searchService: SearchService) {
    }

    public ngOnInit() {
        const matchCode = decodeURIComponent(UrlHelper.getUrlParameter('matchCode'));
        if (_.isEmpty(matchCode)) {
            this.searchService.filter().subscribe((query: LogQuery) => {
                this.filter.productType = query.productType;
                this.filter.fromDate = this.verifyDateService.convertToDateStruct(query.fromDate);
                this.filter.toDate = this.verifyDateService.convertToDateStruct(query.toDate);
            });
        } else {
            this.getMatchCode();
        }
    }

    private getMatchCode() {
        this.filter.matchCode = decodeURIComponent(UrlHelper.getUrlParameter('matchCode'));
        this.filter.fromDate = this.verifyDateService.convertToDateStruct(UrlHelper.getUrlParameter('fromDate'));
        this.filter.toDate = this.verifyDateService.convertToDateStruct(UrlHelper.getUrlParameter('toDate'));
        this.filter.productType = UrlHelper.getUrlParameter('productType');

        this.search();
    }

    public search() {
        const fromDate = this.verifyDateService.dateFormat(this.filter.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.filter.toDate);
        const query = new LogQuery(this.filter.matchCode, this.filter.productType, fromDate, toDate);

        if (this.isValidInput()) {
            this.searchService.search(query).subscribe((matches: Match[]) => {
                this.searchAction.emit(query);
                this.matches.emit(matches);
            });
        } else {
            this.showWarningMessage();
        }
    }

    private isValidInput() {
        return !_.isEmpty(this.filter.matchCode) && (this.filter.productType !== this.resettleType && this.verifyDateService.validDate(this.filter.fromDate, this.filter.toDate));
    }

    private getErrorMessage() {
        if (_.isEmpty(this.filter.matchCode)) {
            return "Please input the Match Code/ID.";
        } else {
            return "From date must be before To date.";
        }
    }

    private showWarningMessage() {
        this.warningDialogMessage.title = "Warning!";
        this.warningDialogMessage.message = this.getErrorMessage();
        this.messageBoxService.alert(this.warningDialogMessage);
    }

    public onSelectFromDate(value: NgbDateStruct) {
        this.filter.fromDate = value;
    }

    public onSelectToDate(value: NgbDateStruct) {
        this.filter.toDate = value;
    }

    public get isHideLogType() {
        return _.isEqual(this.filter.productType, LogType.BetBuilder)
            || _.isEqual(this.filter.productType, LogType.Happy5)
            || _.isEqual(this.filter.productType, LogType.NumberGame);
    }
}