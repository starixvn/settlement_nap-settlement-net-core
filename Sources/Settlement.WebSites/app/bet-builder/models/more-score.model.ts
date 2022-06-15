import { Score } from './score.model';

export class MoreScore {
    public sets: Score[];
    public halfTimeScore: Score;
    public finalScore: Score;

    constructor() {
        this.sets = [];
    }
}