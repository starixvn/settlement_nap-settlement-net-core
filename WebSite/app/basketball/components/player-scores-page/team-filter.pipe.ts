import { Pipe, PipeTransform } from '@angular/core';
import { Player } from './models.native';

@Pipe({
  name: 'teamFilter',
  standalone: true
})
export class TeamFilterPipe implements PipeTransform {
  transform(players: Player[], teamId: number | null): Player[] {
    if (!teamId) {
      return players;
    }
    return players.filter(player => player.teamId === teamId);
  }
}