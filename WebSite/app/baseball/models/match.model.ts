import { GeneralMatch, MatchDetail } from "../../shared/models/sportsbook-sop";
import { ResultDetailBaseBall } from "./result-detail.model";

export class Match extends GeneralMatch {
  public resultDetails: ResultDetailBaseBall[];

  constructor(matchDetail: MatchDetail) {
      super(matchDetail);
  }
}