import { Pipe, PipeTransform } from '@angular/core';
import { ChildMatch } from '../models/child-match.model';
import { ResultStatusId } from '../../shared/constants';
@Pipe({
    name: 'scoreChildMatch',
    standalone: true
})
export class ScoreChildMatchPipe implements PipeTransform {
    public transform(score: string, childMatch: ChildMatch,isLeader: boolean) : string {
      if(isLeader) {
        return score ?? '-';
      } 
      
     return [ResultStatusId.AutoCompleted , ResultStatusId.ManualCompleted].includes(childMatch.resultStatusId) ? score : '-'
    }
}