import { Component, Input } from '@angular/core';
import { TicketCount } from '../../models';

@Component({
  selector: 'soccer-ticket-count',
  standalone: true,
  templateUrl: './soccer-ticket-count.component.html',
})
export class SoccerTicketCountComponent {
  @Input() public ticketCounts: TicketCount[];
}
