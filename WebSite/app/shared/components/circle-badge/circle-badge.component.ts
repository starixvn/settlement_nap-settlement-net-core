import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'circle-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circle-badge.component.html',
  styleUrl: './circle-badge.component.css'
})
export class CircleBadgeComponent {
  value = input<string>('');
  @Input() color = '';
}
