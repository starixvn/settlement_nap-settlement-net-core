import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import * as _ from 'lodash';
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { QueryService } from '../services';
import { NumberGame, Filter, GetMatchesQuery } from '../models';
import { CustomNgbDateParserFormatter } from '../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../shared/services';
import { FilterBaseComponent } from '../../shared/components/gaming/filter-base.component';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})

export class FilterComponent extends FilterBaseComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    public matchCode: string;
    private readonly allStatus = "All";
    public status: string;
    public readonly statuses: string[] = ['All', 'Running', 'Closed', 'Completed', 'Refund'];

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

    public search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);
        const query = new GetMatchesQuery(this.matchCode, this.status, fromDate, toDate);
        this.queryService.search(query).subscribe((numberGame: NumberGame) => {
            this.searchAction.emit({ numberGame, fromDate, toDate });
        });
    }
}
