import { Injectable, signal, inject } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Match } from "../components/refund/model/match.model";
import * as _ from "lodash";
import { ResourceIds } from "../constants/resourceIds.native";
import { RefundBaseStorage } from "./storage.service.native";
import { GeneralResultDetail, ModalDialogMessage } from "../../shared/models";
import { Language } from "../../shared/language.native";
import { ResultDetail } from "../../shared/models/sportsbook-sop/result-detail.model";

@Injectable({
  providedIn: 'root'
})
export class RefundStorage implements RefundBaseStorage {
  #toastrService = inject(ToastrService);
  
  #match = signal<Match>(null);
  #dialogMessage = new ModalDialogMessage(Language.confirmationBox);

  match = this.#match.asReadonly();
  #isDeterminedHedgeMatch = false;

  #halfTimeResult: GeneralResultDetail;
  #fullTimeResult: GeneralResultDetail;

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
  
  getSelectedResource(): GeneralResultDetail[] {
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
    this.#match().matchDetail.isScoreInconsistent = false;
  }
}