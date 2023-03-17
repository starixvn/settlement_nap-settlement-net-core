import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TicketCount } from '../../models';

@Component({
  selector: 'ticket-count',
  templateUrl: './ticket-count.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TicketCountComponent {
  @Input() public ticketCounts: TicketCount;
}
