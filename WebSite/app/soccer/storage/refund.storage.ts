import { Injectable, signal, inject } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Match } from "../components/sop-refund/models/match.model";
import * as _ from "lodash";
import { ResourceIds } from "../constants/resourceIds.native";
import { RefundBaseStorage } from "./storage.service.native";
import { ModalDialogMessage } from "../../shared/models";
import { Language } from "../../shared/language.native";
import { ResultDetail } from "../models";
@Injectable({
  providedIn: 'root'
})
export class RefundStorage implements RefundBaseStorage {
  readonly #toastrService = inject(ToastrService);
  
  readonly #match = signal<Match>(null);
  readonly #dialogMessage = new ModalDialogMessage(Language.confirmationBox);

  readonly match = this.#match.asReadonly();
  #isDeterminedHedgeMatch = false;

  #halfTimeResult: ResultDetail;
  #fullTimeResult: ResultDetail;

  // Getters
  getMatch(): Match {
    return this.#match();
  }

  getMatchDetail() {
    return this.#match().matchDetail;
  }

  getHalfTimeResult() {
    return this.#halfTimeResult;
  }

  getFullTimeResult() {
    return this.#fullTimeResult;
  }
  
  getSelectedResource(): ResultDetail[] {
    return this.#match().resultDetails.filter(x => x.checked);
  }

  getConfirmMessage() {
    return this.#dialogMessage;
  }

  getIsDeterminedHedgeMatch() {
    return this.#isDeterminedHedgeMatch;
  }

  // Setters
  setMatch(match: Match) {
    this.#match.set(match);
    this.#halfTimeResult = this.#match().resultDetails.find(x => x.resourceId === ResourceIds.halfTime);
    this.#fullTimeResult = this.#match().resultDetails.find(x => x.resourceId === ResourceIds.fullTime);
  }

  setIsDeterminedHedgeMatch(isDeterminedHedgeMatch: boolean) {
    this.#isDeterminedHedgeMatch = isDeterminedHedgeMatch;
  }

  setToastrOverlay(toastContainer: ToastContainerDirective) {
    this.#toastrService.overlayContainer = toastContainer;
  }

  setConfirmMessage(message: string) {
    this.#dialogMessage.message = message;
  }

  clearFullTimeResult() {
    this.#fullTimeResult.homeValue = '';
    this.#fullTimeResult.awayValue = '';
  }

  error(message: string) {
    if (!_.isEmpty(message)) {
      this.#toastrService.error(message);
    } else {
      this.#toastrService.clear();
    }
  }

  clear() {
    this.#toastrService.clear();
    this.match().resultDetails.forEach(x => x.isResultWarning = false);
  }
}