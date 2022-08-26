import { GeneralMatch, MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ChildMatch } from './child-match.model';

export class MatchAio extends GeneralMatch {
    public resultDetails: ResultDetail[];
    public childMatches: ChildMatch[] = [];

    constructor(matchDetail: MatchDetail) {
        super(matchDetail);
    }
}