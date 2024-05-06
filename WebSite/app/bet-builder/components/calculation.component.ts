import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import {
  Selection,
  SelectionPermission,
  GroupSelection,
  SettleQuery,
} from "../models";
import { CalculateAction, ResultStatusId } from "../../shared/constants";
import {
  ModalDialogMessage,
  Result,
  MultipleSelect,
  ItemsSelect,
} from "../../shared/models";
import { MessageBoxService, HttpRequestService, BlockUIService } from "../../shared/services";
import {
  RequestService,
  CalculationFilterService,
  CalculationConstraintService,
} from "../services";
import { Language } from "../../shared/language.native";
import { UrlHelper } from "../../helper";

@Component({
  selector: "calculation",
  templateUrl: "./calculation.component.html",
  providers:[
    RequestService,
    HttpRequestService,
    CalculationFilterService,
    CalculationConstraintService,
    MessageBoxService,
    BlockUIService
  ]
})
export class CalculationComponent implements OnInit {
  private matchId: number;
  public readonly isCheckAll = false;
  public canCalculate = false;
  public isDisabledCalculate = true;
  public isDisabledUnCalculate = true;
  public ticketStatusSelect: MultipleSelect = new MultipleSelect();
  public resultStatusSelect: MultipleSelect = new MultipleSelect();
  public selectionSelect: MultipleSelect = new MultipleSelect();
  public warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public groupSelections: GroupSelection[] = [];
  public selectedAll: boolean;
  public selections: Selection[];
  public errorMessage: string;
  public selectedResultStatus: string[];
  public selectedTicketStatus: string[];
  public selectedSelection: string[];

  constructor(
    private readonly requestService: RequestService,
    private readonly calculationFilterService: CalculationFilterService,
    private readonly calculationConstraintService: CalculationConstraintService,
    private readonly messageBoxService: MessageBoxService
  ) { }

  public ngOnInit() {
    this.matchId = Number(UrlHelper.getUrlParameter("matchId"));
    this.warningDialogMessage.title = Language.confirmationBox;
    this.resultStatusSelect = this.calculationFilterService.initialResultStatus();
    this.ticketStatusSelect = this.calculationFilterService.initialTicketStatus();
    this.selectionSelect = this.calculationFilterService.initialSelection();
    this.getSelection();
  }

  private getSelection() {
    this.requestService
      .getSelection(this.matchId)
      .subscribe((selectionPermission: SelectionPermission) => {
        this.canCalculate = selectionPermission.permission.canCalculate;
        this.groupSelections = this.calculationFilterService.groupBySelectionName(
          selectionPermission.selectionDetail
        );
        this.renderSelection(this.groupSelections);
      });
  }

  private renderSelection(listSelection: GroupSelection[]) {
    const items = this.calculationFilterService.renderSelection(
      listSelection,
      this.selectedSelection
    );

    this.selectionSelect = {...this.selectionSelect, items};
  }

  public correctGroupSelectionName(name: string) {
    return name.slice(0, -1);
  }

  public correctSelectionName(name: string) {
    return _.isEqual(name.slice(0, 1), "-")
      ? name.substring(1, name.length).trim()
      : name;
  }

  public getResultStatus(resultStatusId: number) {
    if (resultStatusId === ResultStatusId.RunningOne) {
      return "Running";
    } else if (resultStatusId === ResultStatusId.AutoCompleted) {
      return "Completed (Auto)";
    } else if (resultStatusId === ResultStatusId.ManualCompleted) {
      return "Completed (Manual)";
    } else {
      return "";
    }
  }

  public isCompleted(resultStatusId: number) {
    return (
      resultStatusId === ResultStatusId.AutoCompleted ||
      resultStatusId === ResultStatusId.ManualCompleted
    );
  }

  public onCollapsedClick(group: GroupSelection) {
    group.collapsed = !group.collapsed;
  }

  public selectAll(checked: boolean) {
    _.forEach(this.groupSelections, (group) => {
      group.checked = checked;
      _.forEach(group.selections, (result) => {
        result.isResultWarning = false;
        result.checked = checked;
      });
    });

    this.disableActionAfterFilter();
  }

  public onChangeGroup(group: GroupSelection) {
    group.selections.forEach((item) => {
      item.checked = group.checked;
      item.isResultWarning = false;
    });

    this.selectedAll = this.isSelectedAll();
    this.disableActionAfterFilter();
  }

  public onChangeSelection(item: Selection, group: GroupSelection) {
    item.isResultWarning = false;
    group.checked = group.selections.every((resultItem) => resultItem.checked);
    this.selectedAll = this.isSelectedAll();
    this.disableActionAfterFilter();
  }

  private isSelectedAll() {
    return this.groupSelections.every((item) => item.checked);
  }

  public calculate() {
    this.clearErrorMessage();
    if (this.verifyBeforeCalculation()) {
      this.confirmCalculation();
    }
  }

  private verifyBeforeCalculation() {
    this.calculationConstraintService.highlightedResultValue(this.selections);
    const isValid = this.calculationConstraintService.isValidResultValue(
      this.selections
    );

    if (!isValid) {
      this.warningDialogMessage.message = Language.NotSpecifyValidResults;
      this.messageBoxService.alert(this.warningDialogMessage);
      return false;
    }

    return true;
  }

  private confirmCalculation() {
    const resources = this.selections.filter((selection) => selection.checked);
    this.warningDialogMessage.message = Language.CalculationConfirmMessageEarly;
    this.messageBoxService.confirm(this.warningDialogMessage, () => {
      const query = new SettleQuery(
        this.matchId,
        resources,
        CalculateAction.calculate
      );
      this.push(query);
    });
  }

  private push(query: SettleQuery) {
    this.requestService.push(query).subscribe((result: Result) => {
      if (result.isSuccessful) {
        const buttonClose = parent.document.getElementById('close-after-change');
        buttonClose.click();
      } else {
        this.errorMessage = result.errMsg;
      }
  });
}

  public unCalculate() {
    this.clearErrorMessage();
    const isRunningResultStatus = _.find(
      this.selections,
      (x: Selection) =>
        x.checked && x.resultStatusId === ResultStatusId.RunningOne
    );

    this.warningDialogMessage.message = isRunningResultStatus
      ? Language.UnCalculationConfirmMessageEarly2
      : Language.UnCalculationConfirmMessageEarly1;

    const resources = this.selections.filter((selection) => selection.checked);
    resources.forEach((map) => (map.result = ""));

    this.messageBoxService.confirm(this.warningDialogMessage, () => {
      const query = new SettleQuery(
        this.matchId,
        resources,
        CalculateAction.unCalculate
      );
      this.push(query);
    });
  }

  public refresh() {
    this.requestService
      .getSelection(this.matchId)
      .subscribe((selectionPermission: SelectionPermission) => {
        this.canCalculate = selectionPermission.permission.canCalculate;
        this.groupSelections = this.calculationFilterService.groupBySelectionName(
          selectionPermission.selectionDetail
        );
        this.renderSelection(this.groupSelections);
        this.disableActionAfterFilter();
      });

    this.selectedAll = false;
  }

  public changeSelection(value: ItemsSelect[]) {
    this.selectedSelection = value.length > 0 ? value.map((item) => item.value) : [];
    this.disableActionAfterFilter();
  }

  public changeTicketStatus(value: ItemsSelect[]) {
    this.selectedTicketStatus = value.length > 0 ? value.map((item) => item.value) : [];
    this.disableActionAfterFilter();
  }

  public changeResultStatus(value: ItemsSelect[]) {
    this.selectedResultStatus = value.length > 0 ? value.map((item) => item.value) : [];
    this.disableActionAfterFilter();
  }

  private disableActionAfterFilter() {
    const selectionByGroupName = this.calculationFilterService.getSelectionByGroupName(
      this.groupSelections,
      this.selectedSelection
    );
    this.selections = this.calculationFilterService.getSelectionByResultStatus(
      selectionByGroupName,
      this.selectedResultStatus
    );

    this.isDisabledCalculate = this.calculationConstraintService.disableCalculate(
      this.selections
    );
    this.isDisabledUnCalculate = this.calculationConstraintService.disableUnCalculate(
      this.selections
    );
  }

  private clearErrorMessage() {
    this.errorMessage = "";
  }
}
