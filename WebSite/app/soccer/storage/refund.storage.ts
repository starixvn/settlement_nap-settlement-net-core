import { Injectable, signal, inject } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Match } from "../components/refund/model/match.model";
import * as _ from "lodash";
import { ResourceIds } from "../constants/resourceIds.native";
import { ResultDetail } from "../models";

@Injectable({
  providedIn: 'root'
})
export class RefundStorage  {
  private readonly toastrService = inject(ToastrService);
  
  #match = signal<Match>(null);

  match = this.#match.asReadonly();

  #halfTimeResult: ResultDetail;
  #fullTimeResult: ResultDetail;

  // Getters
  getMatch() {
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

  // Setters
  setMatch(match: Match) {
    this.#match.set(match);
    this.#halfTimeResult = this.#match().resultDetails.find(x => x.resourceId === ResourceIds.halfTime);
    this.#fullTimeResult = this.#match().resultDetails.find(x => x.resourceId === ResourceIds.fullTime);
  }

  setToastrOverlay(toastContainer: ToastContainerDirective) {
    this.toastrService.overlayContainer = toastContainer;
  }

  clearFullTimeResult() {
    this.#fullTimeResult.homeValue = '';
    this.#fullTimeResult.awayValue = '';
  }

  error(message: string) {
    if (!_.isEmpty(message)) {
      this.toastrService.error(message);
    } else {
      this.toastrService.clear();
    }
  }

  clear() {
    this.toastrService.clear();
    this.#match().matchDetail.isScoreInconsistent = false;
  }
}