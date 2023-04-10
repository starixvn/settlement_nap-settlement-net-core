import { PopupProperties } from './../models/popup-properties.model';
import { NgbDateStruct, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { DefaultValue, MatchType, Resources } from '../constants';
import { Component, OnInit, Output, EventEmitter, Injector } from "@angular/core";
import { DatePipe } from "@angular/common";
import { CustomNgbDateParserFormatter } from '../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MultiSportService } from '../services';
import { ModalDialogMessage, MultipleSelect, ItemsSelect } from '../../shared/models';
import { GenerateFilterService, MessageBoxService, VerifyDateService } from '../../shared/services';
import {
    FilterRequest,
    LeagueFilterRequest,
    MatchWaitingRequest,
    SportFilterRequest,
    SportMatch
} from '../models';
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class FilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly requestEmitter = new EventEmitter();
    @Output() public readonly enableRefresh = new EventEmitter();
    private multiSportService: MultiSportService;
    private generateFilterService: GenerateFilterService;
    private verifyDateService: VerifyDateService;
    private messageBoxService: MessageBoxService;
    public readonly warningDialogMessage = new ModalDialogMessage();
    public matchCode = "";
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public sportTypesSelected: string;
    public leaguesSelected: string;
    public autoPayoutSelected: string;
    public matchStatusSelected: string;
    public holdStatusSelected: string;
    public overStatusSelected: string;
    public matchType = 0;
    public isIncludeTestMatch = false;
    public matchTypes = MatchType;
    public sportSelect = new MultipleSelect();
    public leagueSelect = new MultipleSelect();
    public readonly holdStatusSelect = new MultipleSelect();
    public readonly autoPayoutSelect = new MultipleSelect();
    public readonly matchStatusSelect = new MultipleSelect();
    public readonly overStatusSelect = new MultipleSelect();
    public getLeagueParams: LeagueFilterRequest;
    private readonly widthMultiSelect = "205px";

    constructor(protected injector: Injector) {
    }

    ngOnInit() {
        this.initServices();
        this.initialData();
        this.generateFilter();
    }

    public initServices() {
        this.multiSportService = this.injector.get(MultiSportService);
        this.generateFilterService = this.injector.get(GenerateFilterService);
        this.verifyDateService = this.injector.get(VerifyDateService);
        this.messageBoxService = this.injector.get(MessageBoxService);
    }

    private async initialData() {
        const date = await this.multiSportService.getDate();
        this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
        this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
        this.getSport(this.fromDate, this.toDate);
    }

    private generateFilter() {
        this.overStatusSelect.items = this.generateFilterService.renderOverStatus();
        this.holdStatusSelect.items = this.generateFilterService.renderRemarks();
        this.matchStatusSelect.items = this.generateFilterService.renderMatchStatusGroupSelect();
        this.autoPayoutSelect.items = this.generateFilterService.renderAutoPayout();
        this.overStatusSelect.maxWidth = this.sportSelect.maxWidth = this.widthMultiSelect;
        this.matchStatusSelect.maxWidth = "190px";
        this.matchStatusSelect.haveGroup = true;
    }

    public async search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);
        const query: FilterRequest = {
            fromDate,
            toDate,
            autoPayout: this.autoPayoutSelected,
            matchStatus: this.matchStatusSelected,
            matchCode: this.matchCode,
            leagueIds: this.leaguesSelected,
            holdStatus: this.holdStatusSelected,
            overStatus: this.overStatusSelected,
            sportTypes: this.sportTypesSelected,
            isIncludeTest: this.isIncludeTestMatch,
            matchType: this.matchType.toString()
        };

        if (!this.isValidInput(this.fromDate, this.toDate)) {
            this.showWarningMessage(Resources.invalidDate);
            return;
        }

        if (this.sportTypesSelected.length < 1) {
            this.showWarningMessage(Resources.atLeastSport);
            return;
        }

        if (this.validateQuery(query)) {
            this.showWarningMessage(Language.calculatePageWarning);
            return;
        }

        this.enableRefresh.emit(false);
        const multiSport = await this.multiSportService.filter(query);
        const matchIds = this.getAllMatchId(multiSport.sports);
        this.searchAction.emit(multiSport);
        const request = new MatchWaitingRequest(this.leaguesSelected, matchIds, fromDate, toDate, this.overStatusSelected, this.matchCode);
        this.requestEmitter.emit(request);
        this.enableRefresh.emit(true);
        this.updateLeagues();
    }

    private getAllMatchId(sports: SportMatch[]) {
        let matchIds = "";
        _.forEach(sports, (sport) => {
            _.forEach(sport.leagues, (league) => {
                const ids = league.matches.map(match => match.matchId).join();
                matchIds = _.isEmpty(matchIds) ? ids : `${matchIds},${ids}`;
            });
        });

        return matchIds;
    }

    public onSelectLeague(value: ItemsSelect[]) {
        this.leaguesSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    public onSelectSport(value: ItemsSelect[]) {
        this.sportTypesSelected = value.map(item => Number(item.value)).join();
        this.renderLeague(this.fromDate, this.toDate, this.sportTypesSelected);
    }

    public onSelectAutoPayout(value: ItemsSelect[]) {
        this.autoPayoutSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : '';
    }

    public onSelectMatchStatus(value: ItemsSelect[]) {
        this.matchStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    public onSelectHoldStatus(value: ItemsSelect[]) {
        this.holdStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    public onSelectOverStatus(value: ItemsSelect[]) {
        this.overStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
            this.getSport(this.fromDate, this.toDate);
        }
    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
            this.getSport(this.fromDate, this.toDate);
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

    private async getSport(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);
        const params = new SportFilterRequest(fromDateValue, toDateValue);
        const listSport = await this.multiSportService.getSport(params);
        this.sportSelect = new MultipleSelect();
        this.sportSelect.haveGroup = true;
        this.sportSelect.isCheckAll = true;
        this.sportSelect.maxWidth = this.widthMultiSelect;
        this.sportSelect.items = this.generateFilterService.renderSportTypes(listSport);
        this.sportTypesSelected = this.sportSelect.items.map(item => Number(item.value)).join();
    }

    private async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct, sportTypes: string) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);
        this.getLeagueParams = new LeagueFilterRequest(fromDateValue, toDateValue, sportTypes);
        if (this.isValidInput(fromDate, toDate)) {
            const league = await this.multiSportService.getLeague(this.getLeagueParams);
            this.initLeague();
            this.leagueSelect.items = this.generateFilterService.renderLeagues(league);
        } else {
            this.initLeague();
        }
    }

    private initLeague() {
        const showAllLeagues = "--- Show All Leagues ---";
        this.leagueSelect = new MultipleSelect();
        this.leagueSelect.allItemsCheckedText = showAllLeagues;
        this.leagueSelect.maxWidth = '85%';
        this.leagueSelect.enableSearchBox = true;
        this.leagueSelect.haveGroup = true;
        this.leagueSelect.disableCheckAll = true;
        this.leagueSelect.disableSelectGroup = true;
    }

    private async updateLeagues() {
        const league = await this.multiSportService.getLeague(this.getLeagueParams);
        const newLeague = this.generateFilterService.renderNewestLeagues(league, _.cloneDeep(this.leagueSelect.items));
        if (newLeague.length > this.leagueSelect.items.length) {
            this.initLeague();
            this.leagueSelect.items = newLeague;
        }
    }

    private validateQuery(query: FilterRequest) {
        return _.isEmpty(query.matchCode)
            && _.isEqual(query.leagueIds, DefaultValue.unCheckAll)
            && _.isEqual(query.overStatus.toString(), DefaultValue.unCheckAll)
            && _.isEqual(query.matchType.toString(), this.matchTypes[0].value);
    }
}