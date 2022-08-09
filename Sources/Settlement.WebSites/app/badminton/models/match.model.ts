import { MatchDetail, ResultDetail, GeneralMatch} from '../../shared/models/sportsbook-sop';
import { ChildMatch } from './child-match.model';

export class Match extends GeneralMatch {
     public resultDetails: ResultDetail[];
     public childMatches: ChildMatch[] = [];

     constructor(matchDetail: MatchDetail) {
         super(matchDetail);
     }
 }