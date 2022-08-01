import { Component, Input } from '@angular/core';
import { TicketCount } from '../../models';

@Component({
  selector: 'soccer-ticket-count',
  templateUrl: './soccer-ticket-count.component.html',
})
export class SoccerTicketCountComponent {
  @Input() public ticketCounts: TicketCount[];
}
