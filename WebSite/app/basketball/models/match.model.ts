import { GeneralMatch, MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { FantasyMatch } from './fantasy.model';

export class Match extends GeneralMatch {
    public resultDetails: ResultDetail[];
    public fantasyMatch: FantasyMatch;
    constructor(matchDetail: MatchDetail) {
        super(matchDetail);
    }
}