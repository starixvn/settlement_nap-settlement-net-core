import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from "@angular/core";
import { DatePipe } from "@angular/common";
import * as _ from 'lodash';
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { QueryService } from '../services';
import { HappyFive, Filter, GetMatchesQuery } from '../models';
import { CustomNgbDateParserFormatter } from '../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../shared/services';
import { FilterBaseComponent } from '../../shared/components/gaming/filter-base.component';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})

export class FilterComponent extends FilterBaseComponent implements OnInit, OnChanges {
    @Input() public change = 0;
    @Output() public readonly searchAction = new EventEmitter();
    private readonly matchCode: string;
    private readonly allStatus = "All";
    public status: string;
    public readonly statuses: string[] = ['All', 'Completed', 'Refund', 'Closed'];

    constructor(
        private readonly queryService: QueryService,
        protected verifyDateService: VerifyDateService,
        protected messageBoxService: MessageBoxService) {
            super(verifyDateService, messageBoxService);
        }

    public ngOnInit() {
        this.status = this.allStatus;
        this.queryService.filter().subscribe((filter: Filter) => {
            this.fromDate = this.verifyDateService.convertToDateStruct(filter.fromDate);
            this.toDate = this.verifyDateService.convertToDateStruct(filter.toDate);
        });
    }

    public ngOnChanges() {
        if (this.change > 0 && !this.isDisabled) {
            this.search();
        }
    }

    public search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);
        const selectedAll = _.join(this.statuses.filter((status) => status !== this.allStatus), ',');
        const statusValue = _.isEqual(this.status, this.allStatus) ? selectedAll : this.status;
        const query = new GetMatchesQuery(this.matchCode, statusValue, fromDate, toDate);
        this.queryService.search(query).subscribe((happyFive: HappyFive) => {
            this.searchAction.emit({ happyFive, fromDate, toDate });
        });
    }
}
