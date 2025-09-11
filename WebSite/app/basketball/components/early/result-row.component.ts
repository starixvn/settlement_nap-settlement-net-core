import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, EventEmitter, inject, Input, OnInit, Output, Type } from "@angular/core";
import { GroupMap, MatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { isEqual } from "lodash";
import { FormsModule } from "@angular/forms";
import { NumberInputComponent, NumberInputOutSideComponent } from "./number-input/number-input.component";
import { EarlyStore } from "../../store/early.store";
import { ResultStatus, TicketStatusText } from "../../../shared/constants";
import { MatTooltipModule } from "@angular/material/tooltip";
import { VerificationService } from "../../services";
import { PlayerSelectionComponent, PlayerSelectionOutSideComponent } from "./player-selection/player-selection.component";
import { TeamSelectionComponent, TeamSelectionOutSideComponent } from "./team-selection/team-selection.component";
import { YesNoNoneComponent, YesNoNoneOutSideComponent } from "./yesnonone/yes-no-none.component";
import { TraderResultComponent } from "./trader-result/trader-result.component";


type finalInput = PlayerSelectionComponent | NumberInputComponent | TeamSelectionComponent | YesNoNoneComponent;
type finalInputOutSide = TeamSelectionOutSideComponent | PlayerSelectionOutSideComponent | NumberInputOutSideComponent | YesNoNoneOutSideComponent;

@Component({
  selector: '[result-row]',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, TraderResultComponent],
  templateUrl: './result-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultRowComponent implements OnInit {
  @Input() item: ResultDetail;
  @Input() map: GroupMap;
  @Output() settingChanged = new EventEmitter<{ item: ResultDetail, map: GroupMap }>();
  @Output() betTypeChanged = new EventEmitter<{ item: ResultDetail, map: GroupMap }>();
  @Output() updateValue = new EventEmitter<ResultDetail>();
  readonly #earlyStore = inject(EarlyStore);
  readonly #verificationService = inject(VerificationService);
  readonly #cdr = inject(ChangeDetectorRef);
  maxProviderCol =this.#earlyStore.maxProviderCol();
  permission = this.#earlyStore.permission();
  matchDetail = computed(() => this.#earlyStore.matchDetail());
  inputComponent: Type<finalInput>;
  inputOutSideComponent: Type<finalInputOutSide>;
  
  ngOnInit(): void {
    this.inputComponent = this.getInputComponent();
    this.inputOutSideComponent = this.getInputOutSideComponent();
  }

  public updateView = (): void => {
    this.updateValue.emit(this.item);
    this.#cdr.markForCheck();
  }

  getDropdownTooltip(matchDetail: MatchDetail, result: string, maxLength: number) {
    const tooltip = isEqual(result, "H")
      ? matchDetail.homeName : isEqual(result, "A")
        ? matchDetail.awayName : '';


    return this.getTextTooltip(tooltip, maxLength);
  }

  getInputComponent() {
    switch (this.item.inputType) {
      case 0:
        return NumberInputComponent;
      case 1:
        return YesNoNoneComponent;
      case 2:
        return PlayerSelectionComponent;
      default:
        return TeamSelectionComponent;
    }
  }

  getInputOutSideComponent() {
    switch (this.item.inputType) {
      case 0:
        return NumberInputOutSideComponent;
      case 1:
        return YesNoNoneOutSideComponent;
      case 2:
        return PlayerSelectionOutSideComponent;
      default:
        return TeamSelectionOutSideComponent;
    }
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  public getResultSettingIcon(isHoldResult: boolean): string {
    return isHoldResult ? 'icon-yes' : 'icon-no';
  }

  public isChangeSetting(item: ResultDetail, map: GroupMap): void {
    this.settingChanged.emit({ item, map });
  }

  public onChangeBetType(item: ResultDetail, map: GroupMap): void {
    this.betTypeChanged.emit({ item, map });
  }

  public canSettleResult(item: ResultDetail): boolean {
    const isRunning = isEqual(item.ticketStatus, TicketStatusText.running)
      || isEqual(item.resultStatus, ResultStatus.noResult)
      || isEqual(item.resultStatus, ResultStatus.running);

    return isRunning && !item.isScoreMismatched && this.#verificationService.isValidTraderConfirmScore(item, false);
  }
}