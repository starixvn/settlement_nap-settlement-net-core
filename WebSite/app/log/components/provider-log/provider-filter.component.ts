import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import * as _ from 'lodash';
import { ProviderService } from '../../services';
import { ModalDialogMessage, MultipleSelect, ItemsSelect } from '../../../shared/models';
import { MessageBoxService } from '../../../shared/services';
import { ProviderResultLog, ProviderFilter, ProviderName, ProviderLog } from '../../models';

@Component({
    selector: 'provider-filter',
    templateUrl: './provider-filter.component.html',
})

export class ProviderFilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly providerLog = new EventEmitter<ProviderLog>();
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public providerSelect = new MultipleSelect();
    public providerSelected: string;
    public filter = new ProviderFilter();

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
        this.providerSelected = value.map(item => Number(item.value)).join();
    }

    public search() {
        if (this.isValidInput()) {
            this.filter.sourceIds = this.providerSelected;
            this.providerService.search(this.filter).subscribe((providerLog: ProviderLog) => {
                this.providerLog.emit(providerLog);
            });
        } else {
            this.showWarningMessage();
        }
    }

    private isValidInput() {
        return !_.isEmpty(this.filter.matchId);
    }

    private getErrorMessage() {
        if (_.isEmpty(this.filter.matchId)) {
            return "Please input the Match ID.";
        }
    }

    private showWarningMessage() {
        this.warningDialogMessage.title = "Warning!";
        this.warningDialogMessage.message = this.getErrorMessage();
        this.messageBoxService.alert(this.warningDialogMessage);
    }
}