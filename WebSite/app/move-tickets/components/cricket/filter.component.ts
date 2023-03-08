import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { DatePipe } from "@angular/common";
import { NgbDateStruct, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { ModalDialogMessage, MultipleSelect, ItemsSelect, League } from '../../../shared/models';
import { MessageBoxService, VerifyDateService, GenerateFilterService } from '../../../shared/services';
import {
    DateFilter,
    FilterRequest,
    LeagueFilterRequest,
    MatchWaitingRequest,
    MultiSport,
} from '../../models';
import { SportType } from '../../../shared/constants';
import { Language } from "../../../shared/language.native";
import { DefaultValue } from "../../constants";
import { MoveTicketsService } from "./move-tickets.service";
import * as _ from "lodash";

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class FilterComponent implements OnInit {
    @Output() public searchAction = new EventEmitter();
    @Output() public requestEmitter = new EventEmitter();
    public readonly warningDialogMessage = new ModalDialogMessage();
    public matchCode = "";
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public sportTypesSelected: string;
    public leaguesSelected: string;
    public matchStatusSelected: string;
    public isIncludeTestMatch = false;
    public leagueSelect = new MultipleSelect();
    public readonly matchStatusSelect = new MultipleSelect();

    constructor(
        private readonly moveTicketsService: MoveTicketsService,
        private readonly generateFilterService: GenerateFilterService,
        private readonly verifyDateService: VerifyDateService,
        private readonly messageBoxService: MessageBoxService) {
    }

    public ngOnInit() {
        this.initiateData();
    }

    private initiateData() {
        this.moveTicketsService.getDate()
            .subscribe((date: DateFilter) => {
                this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
                this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
                this.sportTypesSelected = SportType.cricket.toString();
                this.renderLeague(this.fromDate, this.toDate, this.sportTypesSelected);
            });

        this.matchStatusSelect.items = this.generateFilterService.renderMatchStatusGroupSelect();
        this.matchStatusSelect.haveGroup = true;
    }

    public search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);
        const params: FilterRequest = {
            fromDate,
            toDate,
            matchStatus: this.matchStatusSelected,
            matchCode: this.matchCode,
            leagueIds: this.leaguesSelected,
            sportTypes: this.sportTypesSelected,
            isIncludeTest: this.isIncludeTestMatch,
        };
        if (!this.isValidInput(this.fromDate, this.toDate)) {
            this.showWarningMessage(Language.invalidDate);
            return;
        }

        if (this.sportTypesSelected.length < 1) {
            this.showWarningMessage(Language.atLeastSport);
            return;
        }

        if (this.leaguesSelected.length < 1 && _.isEmpty(this.matchCode)) {
            this.showWarningMessage(Language.atLeastLeague);
            return;
        }

        this.moveTicketsService.filter(params).subscribe((multiSport: MultiSport) => {
            this.searchAction.emit(multiSport);
            const request = new MatchWaitingRequest(this.matchCode, this.leaguesSelected, fromDate, toDate);
            this.requestEmitter.emit(request);
        });
    }

    public onSelectLeague(value: ItemsSelect[]) {
        this.leaguesSelected = value.map(item => Number(item.value)).join();
    }

    public onSelectMatchStatus(value: ItemsSelect[]) {
        this.matchStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
            this.renderLeague(this.fromDate, this.toDate, this.sportTypesSelected);
        }

    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
            this.renderLeague(this.fromDate, this.toDate, this.sportTypesSelected);
        }
    }

    private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        return this.verifyDateService.validDate(fromDate, toDate);
    }

    private showWarningMessage(message: string) {
        this.warningDialogMessage.title = Language.warningTitle;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }

    private renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct, sportTypes: string) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);
        const params = new LeagueFilterRequest(fromDateValue, toDateValue, sportTypes);
        if (this.isValidInput(fromDate, toDate)) {
            this.moveTicketsService.getLeague(params).subscribe((league: League[]) => {
                this.initLeague();
                this.leagueSelect.items = this.generateFilterService.renderLeagues(league);
            });
        } else {
            this.initLeague();
        }
    }

    private initLeague() {
        const showAllLeagues = "--- Show All Leagues ---";
        this.leagueSelect = new MultipleSelect();
        this.leagueSelect.allItemsCheckedText = showAllLeagues;
        this.leagueSelect.maxWidth = '450px';
        this.leagueSelect.enableSearchBox = true;
        this.leagueSelect.disableCheckAll = true;
    }
}