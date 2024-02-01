import { NgbDateStruct, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { DefaultValue, MatchType, Resources } from '../constants';
import { Component, OnInit, Output, EventEmitter, Injector, inject, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
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
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { DatepickerComponent } from "../../shared/components/date-picker/date-picker.component";
import { MultiSportsStore } from "../services/multi-sports.store";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
    standalone: true,
    imports: [
        DatepickerComponent,
        NewMultipleSelectComponent,
        ReactiveFormsModule,
        FormsModule,
        CommonModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {
    private multiSportService = inject(MultiSportService);
    private generateFilterService = inject(GenerateFilterService);
    private verifyDateService = inject(VerifyDateService);
    private messageBoxService = inject(MessageBoxService);
    private multiSportsStore = inject(MultiSportsStore);
    readonly warningDialogMessage = new ModalDialogMessage();
    matchCode = "";
    fromDate: NgbDateStruct;
    toDate: NgbDateStruct;
    sportTypesSelected: string;
    leaguesSelected: string;
    autoPayoutSelected: string;
    matchStatusSelected: string;
    holdStatusSelected: string;
    overStatusSelected: string;
    matchType = 0;
    isIncludeTestMatch = false;
    matchTypes = MatchType;
    sportOptions$ = new BehaviorSubject(new MultipleSelect());
    leagueOption$ = new BehaviorSubject(new MultipleSelect());
    readonly holdStatusSelect = new MultipleSelect();
    readonly autoPayoutSelect = new MultipleSelect();
    readonly matchStatusSelect = new MultipleSelect();
    readonly overStatusSelect = new MultipleSelect();
    getLeagueParams: LeagueFilterRequest;
    private readonly widthMultiSelect = "205px";

    async ngOnInit() {
        this.generateFilter();
        await this.initialData();
    }


    ChangeDetectionCount = 0
    get GetChangeDetectionCount() {
        return this.ChangeDetectionCount++
    }

    private async initialData() {
        const date = await this.multiSportService.getDate();
        this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
        this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
        this.initLeague();
        await this.getSport(this.fromDate, this.toDate);
        // this.matchCode = '79648780';
        // this.search();
    }

    private generateFilter() {
        this.overStatusSelect.items = this.generateFilterService.renderOverStatus();
        this.holdStatusSelect.items = this.generateFilterService.renderRemarks();
        this.matchStatusSelect.items = this.generateFilterService.renderMatchStatusGroupSelect();
        this.autoPayoutSelect.items = this.generateFilterService.renderAutoPayout();
        this.overStatusSelect.maxWidth = this.widthMultiSelect;
        this.matchStatusSelect.maxWidth = "190px";
        this.matchStatusSelect.haveGroup = true;
    }

    async search() {
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

        const multiSport = await this.multiSportService.filter(query);

        const matchIds = this.getAllMatchId(multiSport.sports);
        const request = new MatchWaitingRequest(this.leaguesSelected, matchIds, fromDate, toDate, this.overStatusSelected, this.matchCode);
        this.multiSportsStore.request = { ...request };
        this.multiSportsStore.enableRefresh = multiSport.sports.length > 0;
        this.multiSportsStore.setState(multiSport);
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

    onSelectLeague(value: ItemsSelect[]) {
        this.leaguesSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    onSelectSport(value: ItemsSelect[]) {
        this.sportTypesSelected = value.map(item => Number(item.value)).join();
        this.renderLeague(this.fromDate, this.toDate, this.sportTypesSelected);
    }

    onSelectAutoPayout(value: ItemsSelect[]) {
        this.autoPayoutSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : '';
    }

    onSelectMatchStatus(value: ItemsSelect[]) {
        this.matchStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    onSelectHoldStatus(value: ItemsSelect[]) {
        this.holdStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    onSelectOverStatus(value: ItemsSelect[]) {
        this.overStatusSelected = value.length > 0 ? value.map(item => Number(item.value)).join() : DefaultValue.unCheckAll;
    }

    onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
            this.getSport(this.fromDate, this.toDate);
        }
    }

    onSelectToDate(value: NgbDateStruct) {
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
        const newSportOptions = { ...this.sportOptions$.value, items: this.generateFilterService.renderSportTypes(listSport)};
        this.sportOptions$.next(newSportOptions);
        this.sportTypesSelected = this.sportOptions$.value.items.map(item => Number(item.value)).join();
    }

    private async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct, sportTypes: string) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);
        this.getLeagueParams = new LeagueFilterRequest(fromDateValue, toDateValue, sportTypes);
        let newLeagueOption;
        if (this.isValidInput(fromDate, toDate)) {
            const league = await this.multiSportService.getLeague(this.getLeagueParams);
            newLeagueOption = { ...this.leagueOption$.value, items: this.generateFilterService.renderLeagues(league) };
        } else {
            newLeagueOption = { ...this.leagueOption$.value, items: [] };
        }

        this.leagueOption$.next(newLeagueOption);
    }

    private initLeague() {
        const showAllLeagues = "--- Show All Leagues ---";
        let initLeagueSelect = new MultipleSelect();
        initLeagueSelect.allItemsCheckedText = showAllLeagues;
        initLeagueSelect.maxWidth = '85%';
        initLeagueSelect.enableSearchBox = true;
        initLeagueSelect.haveGroup = true;
        initLeagueSelect.disableCheckAll = true;
        initLeagueSelect.disableSelectGroup = true;
        this.leagueOption$.next(initLeagueSelect);
        let initSportSelect = new MultipleSelect();
        initSportSelect.maxWidth = this.widthMultiSelect;
        initSportSelect.haveGroup = true;
        initSportSelect.isCheckAll = true;
        this.sportOptions$.next(initSportSelect);
    }

    private async updateLeagues() {
        const league = await this.multiSportService.getLeague(this.getLeagueParams);
        const newLeague = this.generateFilterService.renderNewestLeagues(league, _.cloneDeep(this.leagueOption$.value.items));
        if (newLeague.length > this.leagueOption$.value.items.length) {
            this.leagueOption$.next({ ... this.leagueOption$.getValue(), items: newLeague });
        }
    }

    private validateQuery(query: FilterRequest) {
        return _.isEmpty(query.matchCode)
            && _.isEqual(query.leagueIds, DefaultValue.unCheckAll)
            && _.isEqual(query.overStatus.toString(), DefaultValue.unCheckAll)
            && _.isEqual(query.matchType.toString(), this.matchTypes[0].value);
    }
}