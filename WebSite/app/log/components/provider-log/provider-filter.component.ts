import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import * as _ from 'lodash';
import { UrlHelper } from '../../../helper';
import { SearchService, ProviderService } from '../../services';
import { ModalDialogMessage, MultipleSelect, ItemsSelect } from '../../../shared/models';
import { MessageBoxService } from '../../../shared/services';
import { Match, Filter, ProviderName } from '../../models';
import { LogTypeFilter, ResettleType } from "../../constants/log-Type";

@Component({
    selector: 'provider-filter',
    templateUrl: './provider-filter.component.html'
})

export class ProviderFilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly matches = new EventEmitter<Match[]>();
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public providerSelect = new MultipleSelect();
    public providerSelected: string;
    public filter = new Filter();
    readonly filterType = LogTypeFilter;
    readonly resettleType = ResettleType;

    constructor(
        private readonly messageBoxService: MessageBoxService,
        private readonly providerService: ProviderService) {
    }

    public ngOnInit() {
            this.providerService.getProviderName().subscribe((listProvider: ProviderName[]) => {
                this.providerSelect = new MultipleSelect();
                this.providerSelect.isCheckAll = true;
                this.providerSelect.maxWidth = "180px";
                this.providerSelect.items = this.providerService.renderProviderName(listProvider);
                this.providerSelected = this.providerSelect.items
                  .map((item) => Number(item.value))
                  .join();
            });
    }

    public onSelectProvider(value: ItemsSelect[]) {
    }

    public search() {
        // const query = new LogQuery(this.filter.matchCode, this.filter.productType, , toDate);

        // if (this.isValidInput()) {
        //     this.searchService.search(query).subscribe((matches: Match[]) => {
        //         this.searchAction.emit(query);
        //         this.matches.emit(matches);
        //     });
        // } else {
        //     this.showWarningMessage();
        // }
    }

    private isValidInput() {
        return !_.isEmpty(this.filter.matchCode);
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
}