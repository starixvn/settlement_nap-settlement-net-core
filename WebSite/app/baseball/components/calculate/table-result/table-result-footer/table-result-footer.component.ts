import { FormsModule } from "@angular/forms";
import { Component, inject, OnInit } from "@angular/core";
import { ResourceIds } from "../../../../constants/resource-id.constant";
import { CommonModule } from "@angular/common";
import { NotifyService } from "../../../../services/notify.service";
import { Language } from "../../../../../shared/language.native";
import { CalculateService } from "../../../../services/calculate/calculate.service";
import { TicketStatusText } from "../../../../../shared/constants";
import { CalculateStorage } from "../../../../services/calculate/calculate.storage";
import { filter, isEqual } from "lodash";

@Component({
  selector: "tfoot[table-result-footer]",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./table-result-footer.component.html",
})
export class TableResultFooterComponent implements OnInit {
  #storage = inject(CalculateStorage);
  #notifyService = inject(NotifyService);
  #calculateService = inject(CalculateService);
  disableScoreDirect = false;
  isInputScoreDirect = false;
  canUncalculate = this.#storage.getPermission().canUncalculate;

  ngOnInit(): void {
    console.log(this.#storage.getFullTime());
    this.disableScoreDirect =
      filter(
        this.#storage.getResultDetails(),
        (item) =>
          !isEqual(item.resourceId, ResourceIds.fullTime) &&
          !isEqual(item.resourceId, ResourceIds.extraInning) &&
          item.ticketStatus !== TicketStatusText.noTicket
      ).length > 0 || !!this.#storage.getFullTime().isSpecialBettype;
  }

  get disableUncalculateAndSaveScore() {
    return this.#storage.getResultDetails().every((item) => !item.checked);
  }

  changeInputDirectly() {
    this.#storage.updateInputScoreDirect(this.isInputScoreDirect);
  }

  calculate() {
    this.#notifyService.clearError();
    this.#storage.onSubmitCalculate();
    this.#calculateService.calculate();
  }

  uncalculate() {
    this.#notifyService.clearError();
    this.#storage.onSubmitUncalculate();
    this.#calculateService.unCalculate();
  }

  saveScore() {
    this.#notifyService.clearError();
    this.#notifyService.confirm(Language.eSports.saveScore, () => {
      this.#calculateService.saveScore();
    });
  }
}
