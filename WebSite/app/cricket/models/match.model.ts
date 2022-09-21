
import { GeneralMatch, MatchDetail, ResultDetail} from '../../shared/models/sportsbook-sop';

export class Match extends GeneralMatch {
    public resultDetails: ResultDetail[];

    constructor(matchDetail: MatchDetail) {
        super(matchDetail);
    }
}