import { Component, OnInit, Input } from '@angular/core';
import { TicketCount } from '../../models';

@Component({
  selector: 'ticket-count',
  templateUrl: './ticket-count.component.html',
})
export class TicketCountComponent {
  @Input() public ticketCounts: TicketCount;
}
