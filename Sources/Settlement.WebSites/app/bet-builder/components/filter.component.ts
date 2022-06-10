import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit
} from "@angular/core";
import { DatePipe } from "@angular/common";
import * as _ from "lodash";
import {
  NgbDateStruct,
  NgbDateParserFormatter,
} from "@ng-bootstrap/ng-bootstrap";
import { RequestService, GenerateListService } from "../services";
import {
  League,
  GetMatchesQuery,
  SportFilterRequest,
  LeagueFilterRequest,
  SportType,
  MultiSports,
  DateFilter,
  MatchWaitingRequest
} from "../models";
import { CustomNgbDateParserFormatter } from "../../shared/components/date-picker/custom-ngb-date-parser-formatter";
import { Resources } from "../constants";
import {
  ModalDialogMessage,
  MultipleSelect,
  ItemsSelect,
} from "../../shared/models";
import { MessageBoxService, VerifyDateService } from "../../shared/services";

@Component({
  selector: "filter",
  templateUrl: "./filter.component.html",
  providers: [
    DatePipe,
    {
      provide: NgbDateParserFormatter,
      useFactory: () => new CustomNgbDateParserFormatter("MMM dd, y"),
    },
  ],
})
export class FilterComponent implements OnInit {
  @Input() apiUrl: string;
  @Output() public readonly searchAction = new EventEmitter();
  private readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public sportTypesSelected: string;
  public leaguesSelected: string;
  public statusesSelected: string;
  public sportSelect = new MultipleSelect();
  public leagueSelect = new MultipleSelect();
  public statuses = new MultipleSelect();
  public fromDate: NgbDateStruct;
  public toDate: NgbDateStruct;
  public leagues: League[];
  public matchCode: string;

  constructor(
    private readonly verifyDateService: VerifyDateService,
    private readonly messageBoxService: MessageBoxService,
    private readonly requestService: RequestService,
    private readonly generateListService: GenerateListService
  ) {}

  public ngOnInit() {
    this.requestService.apiUrl = this.apiUrl;
    this.initStatuses();
    this.requestService.getDate().subscribe((filter: DateFilter) => {
      this.fromDate = this.verifyDateService.convertToDateStruct(filter.fromDate);
      this.toDate = this.verifyDateService.convertToDateStruct(filter.toDate);
      this.getSport(this.fromDate, this.toDate);
    });
  }

  public search() {
    const fromDate = this.verifyDateService.dateFormat(this.fromDate);
    const toDate = this.verifyDateService.dateFormat(this.toDate);
    const query = new GetMatchesQuery(
      this.matchCode,
      this.statusesSelected,
      this.leaguesSelected,
      this.sportTypesSelected,
      fromDate,
      toDate
    );
    if (!this.isValidInput(this.fromDate, this.toDate)) {
      this.showWarningMessage(Resources.invalidDate);
      return;
    }

    if (this.sportTypesSelected.length < 1) {
      this.showWarningMessage(Resources.atLeastSport);
      return;
    }

    if (this.leaguesSelected.length < 1) {
      this.showWarningMessage(Resources.atLeastLeague);
      return;
    }
    this.requestService.search(query).subscribe((multiSports: MultiSports) => {
      const request = new MatchWaitingRequest(
        this.leaguesSelected,
        this.sportTypesSelected,
        fromDate,
        toDate
      );
      multiSports.request = request;
      this.searchAction.emit(multiSports);
    });
  }

  public onSelectSport(value: ItemsSelect[]) {
    this.sportTypesSelected = value.map((item) => Number(item.value)).join();
    this.renderLeague(this.fromDate, this.toDate, this.sportTypesSelected);
  }

  public onSelectLeague(value: ItemsSelect[]) {
    this.leaguesSelected = value.map((item) => Number(item.value)).join();
  }

  public onSelectStatus(value: ItemsSelect[]) {
    this.statusesSelected =
      value.length > 0 ? value.map((item) => item.value).join() : "";
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

  private showWarningMessage(message: string) {
    this.warningDialogMessage.title = Resources.warningTitle;
    this.warningDialogMessage.message = message;
    this.messageBoxService.alert(this.warningDialogMessage);
  }

  private getSport(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
    const fromDateValue = this.verifyDateService.dateFormat(fromDate);
    const toDateValue = this.verifyDateService.dateFormat(toDate);
    const params = new SportFilterRequest(fromDateValue, toDateValue);
    this.requestService.getSport(params).subscribe((sport: SportType[]) => {
      this.sportSelect = new MultipleSelect();
      this.sportSelect.isCheckAll = true;
      this.sportSelect.maxWidth = "220px";
      this.sportSelect.items = this.generateListService.renderSportTypes(sport);
      this.sportTypesSelected = this.sportSelect.items
        .map((item) => Number(item.value))
        .join();
    });
  }

  private renderLeague(
    fromDate: NgbDateStruct,
    toDate: NgbDateStruct,
    sportTypes: string
  ) {
    const fromDateValue = this.verifyDateService.dateFormat(fromDate);
    const toDateValue = this.verifyDateService.dateFormat(toDate);
    const params = new LeagueFilterRequest(
      fromDateValue,
      toDateValue,
      sportTypes
    );
    if (this.isValidInput(fromDate, toDate)) {
      this.requestService.getLeague(params).subscribe((league: League[]) => {
        this.initLeague();
        this.leagueSelect.items = this.generateListService.renderLeagues(
          league
        );
      });
    } else {
      this.initLeague();
    }
  }

  private initLeague() {
    const showAllLeagues = "--- Show All Leagues ---";
    this.leagueSelect = new MultipleSelect();
    this.leagueSelect.allItemsCheckedText = showAllLeagues;
    this.leagueSelect.checkAllCheckBoxText = showAllLeagues;
    this.leagueSelect.maxWidth = "450px";
    this.leagueSelect.isCheckAll = true;
    this.leagueSelect.haveGroup = true;
  }

  private initStatuses() {
    this.statuses = new MultipleSelect();
    this.statuses.maxWidth = "110px";
    this.sportSelect.haveGroup = true;
    this.sportSelect.isCheckAll = true;
    this.statuses.items = this.generateListService.renderStatuses();
  }

  private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
    return this.verifyDateService.validDate(fromDate, toDate);
  }
}
