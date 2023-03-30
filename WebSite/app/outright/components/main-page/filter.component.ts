import { SportLeague, SportLeagueFilter } from './../../models/sport-league.model';
import { GenerateFilterService } from './../../../shared/services/generate-filter.service';
import { NewMultipleSelectComponent } from './../../../shared/components/multiple-select/multiple-select.component';
import { DatePipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Statuses } from '../../constants/options';
import { HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { OutrightService } from '../../services/outright.service';
import { FilterRequest } from '../../models/filter-request.model';
import { ItemsSelect, League, ModalDialogMessage, MultipleSelect, Sport } from '../../../shared/models';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';
import { Resources } from '../../constants/resources';
import { MaterialModule } from '../../../shared/material-module';
import * as _ from "lodash";
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent, MaterialModule, NewMultipleSelectComponent],
    providers: [DatePipe, VerifyDateService, OutrightService, HttpRequestService, MessageBoxService, GenerateFilterService],
})
export class FilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly requestEmitter = new EventEmitter();
    @Output() public readonly enableRefresh = new EventEmitter();

    @ViewChild('league') leagueMultiSelect: NewMultipleSelectComponent;

    private verifyDateService: VerifyDateService;
    private outrightService: OutrightService;
    private messageBoxService: MessageBoxService;
    private generateFilterService: GenerateFilterService;

    fromDate: NgbDateStruct;
    toDate: NgbDateStruct;
    disableToDate = false;
    today: NgbDateStruct;

    sportTypesSelected: string;
    sportOptions$ = new BehaviorSubject(new MultipleSelect());

    leagueSelected: string;
    originalLeagues: League[];
    leagueOptions$ = new BehaviorSubject(new MultipleSelect());

    statusOptions: any[] = Statuses;
    statusSelected: number;

    isIncludeTestLeague = false

    moveBetsDay: NgbDateStruct;

    warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(protected injector: Injector) { }

    trackByFn = (index: number, item: any) => item.leagueId;


    async ngOnInit(): Promise<void> {
        this.initSportLeague();
        this.verifyDateService = this.injector.get(VerifyDateService);
        this.outrightService = this.injector.get(OutrightService);
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.generateFilterService = this.injector.get(GenerateFilterService);
        await this.initFilterData();
    }

    onSelectFromDate(value: NgbDateStruct) {
        this.fromDate = value;
        this.getSportLeague(this.fromDate, this.toDate);
    }

    onSelectToDate(value: NgbDateStruct) {
        this.toDate = value;
        this.getSportLeague(this.fromDate, this.toDate);
    }

    private async initFilterData() {
        const initDate = await this.outrightService.getFilterView();
        this.fromDate = this.verifyDateService.convertToDateStruct(initDate.fromDate);
        this.toDate = this.verifyDateService.convertToDateStruct(initDate.toDate);
        this.moveBetsDay = this.verifyDateService.convertToDateStruct(initDate.moveBetsDay);
        this.statusSelected = 1;
        this.today = this.toDate;
        this.getSportLeague(this.fromDate, this.toDate);
    }

    private async getSportLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);
        let sportLeague: SportLeagueFilter;
        if (this.disableToDate || this.isValidInput(fromDate, toDate)) {
            sportLeague = await this.outrightService.getSportLeague({ fromDate: fromDateValue, toDate: toDateValue });
            this.originalLeagues = sportLeague.leagues;
        }
        this.updateLeague(_.isUndefined(sportLeague) ? [] : sportLeague.leagues);
        this.updateSport(_.isUndefined(sportLeague) ? [] : sportLeague.sports);
    }

    onSelectSport(value: ItemsSelect[]) {
        this.sportTypesSelected = value.map(item => Number(item.value)).join(',');
        const leagueFiltered = _.filter(this.originalLeagues, item => _.includes(this.sportTypesSelected, item.sportType.toString()));
        this.updateLeague(leagueFiltered);
    }

    onSelectLeague(value: ItemsSelect[]) {
        this.leagueSelected = value.length> 0 ? value.map(item => Number(item.value)).join(',') : '';
    }

    private updateSport(sports: Sport[]) {
        const updateList = { ... this.sportOptions$.getValue(), items: this.generateFilterService.renderSportTypes(sports, false) };
        this.sportOptions$.next(updateList);
    }

    private updateLeague(leagues: League[]) {
        const updateList = { ... this.leagueOptions$.getValue(), items: this.generateFilterService.renderLeagues(leagues) };
        this.leagueOptions$.next(updateList);
    }

    private initSportLeague() {
        const showAllLeagues = "--- Show All Leagues ---";
        const initLeagueSelect = new MultipleSelect();
        initLeagueSelect.allItemsCheckedText = showAllLeagues;
        initLeagueSelect.maxWidth = '85%';
        initLeagueSelect.enableSearchBox = true;
        initLeagueSelect.haveGroup = true;
        this.leagueOptions$.next(initLeagueSelect);
        const initSportSelect = new MultipleSelect();
        initSportSelect.haveGroup = true;
        initSportSelect.isCheckAll = true;
        initSportSelect.maxWidth = "180px";
        this.sportOptions$.next(initSportSelect);
    }

    private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        return this.verifyDateService.validDate(fromDate, toDate);
    }

    private showWarningMessage(message: string) {
        this.warningDialogMessage.title = Resources.warningTitle;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }

    changeStatus() {
        if (this.disableToDate) {
            this.toDate = this.today;
        } else {
            this.toDate = null;
        }
    }

    async search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);

        const request: FilterRequest = {
            fromDate: fromDate,
            toDate,
            statusId: this.statusSelected,
            leagueIds: this.GetLeagueId(),
            isIncludeTest: this.isIncludeTestLeague
        }

        if (!(this.disableToDate || this.verifyDateService.validDate(this.fromDate, this.toDate))) {
            this.showWarningMessage(Resources.invalidDate);
            return;
        }
        
        if(_.isEmpty(this.sportTypesSelected)) {
            this.showWarningMessage(Resources.atLeastSport);
            return;
        }

        await this.outrightService.filter(request).then((res) => {
            this.searchAction.emit(res);
            this.requestEmitter.emit(request);
        })
    }

    private GetLeagueId(){
        if(_.isEmpty(this.leagueSelected)) {
            return _.filter(this.originalLeagues, item => _.includes(this.sportTypesSelected, item.sportType.toString())).map(item => item.leagueId).join(',');
        }
        return this.leagueSelected;
    }
}
