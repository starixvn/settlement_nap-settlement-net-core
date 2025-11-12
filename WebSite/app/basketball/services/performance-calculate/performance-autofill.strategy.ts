import { AutofillResult } from "../../constants/result-value";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";

export interface IAutofillStrategy {
  getAutofillResult(resultDetails: ResultDetail[], changedResultDetail: ResultDetail): AutofillResult;
}
