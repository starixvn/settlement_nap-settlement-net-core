import { AutofillResult } from "../../constants/result-value";
import { AutofillResultContext } from "./autofill.utils";

export interface IAutofillStrategy {
  getAutofillResult(context: AutofillResultContext): AutofillResult;
}


export class DefaultAutofillStrategy implements IAutofillStrategy {
  getAutofillResult(context: AutofillResultContext): AutofillResult {
    return '';
  }
}