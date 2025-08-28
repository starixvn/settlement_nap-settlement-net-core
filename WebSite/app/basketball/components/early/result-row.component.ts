import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, EventEmitter, inject, Input, OnInit, Output, Type } from "@angular/core";
import { GroupMap, MatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { isEqual } from "lodash";
import { FormsModule } from "@angular/forms";
import { TextBoxComponent, TextBoxOutSideComponent } from "./text-box/text-box.component";
import { EarlyStore } from "../../store/early.store";
import { ResultStatus, TicketStatusText } from "../../../shared/constants";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ResultByTeamNamePipe } from "../../../shared/pipes/result-by-team-name.pipe";
import { VerificationService } from "../../services";
import { PlayerSelectionComponent, PlayerSelectionOutSideComponent } from "./player-selection/player-selection.component";
import { TeamSelectionComponent, TeamSelectionOutSideComponent } from "./team-selection/team-selection.component";
import { YesNoNoneComponent, YesNoNoneOutSideComponent } from "./yesnonone/yes-no-none.component";


type finalInput = PlayerSelectionComponent | TextBoxComponent | TeamSelectionComponent | YesNoNoneComponent;
type finalInputOutSide = TeamSelectionOutSideComponent | PlayerSelectionOutSideComponent | TextBoxOutSideComponent | YesNoNoneOutSideComponent;

@Component({
  selector: '[result-row]',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, ResultByTeamNamePipe],
  templateUrl: './result-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultRowComponent implements OnInit {
  @Input() item: ResultDetail;
  @Input() map: GroupMap;
  @Output() settingChanged = new EventEmitter<{ item: ResultDetail, map: GroupMap }>();
  @Output() betTypeChanged = new EventEmitter<{ item: ResultDetail, map: GroupMap }>();
  readonly #earlyStore = inject(EarlyStore);
  readonly #verificationService = inject(VerificationService);
  readonly #cdr = inject(ChangeDetectorRef);
  maxProviderCol = computed(() => this.#earlyStore.maxProviderCol());
  permission = computed(() => this.#earlyStore.permission());
  matchDetail = computed(() => this.#earlyStore.matchDetail());
  inputComponent: Type<finalInput>;
  inputOutSideComponent: Type<finalInputOutSide>;
  
  ngOnInit(): void {
    this.inputComponent = this.getInputComponent();
    this.inputOutSideComponent = this.getInputOutSideComponent();
  }

  public updateView(): void {
    this.#cdr.markForCheck();
  }

  getDropdownTooltip(matchDetail: MatchDetail, result: string, maxLength: number) {
    const tooltip = isEqual(result, "H")
      ? matchDetail.homeName : isEqual(result, "A")
        ? matchDetail.awayName : '';


    return this.getTextTooltip(tooltip, maxLength);
  }

  getInputComponent(): Type<PlayerSelectionComponent | TextBoxComponent | TeamSelectionComponent> {
    switch (this.item.inputType) {
      case 0:
        return TextBoxComponent;
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
        return TextBoxOutSideComponent;
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