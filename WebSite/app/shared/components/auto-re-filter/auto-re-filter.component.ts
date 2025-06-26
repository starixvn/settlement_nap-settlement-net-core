import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ChangeDetectionStrategy, input, Output, signal, EventEmitter, SimpleChanges, Input, ChangeDetectorRef, inject, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

const AutoReFilterOptions = [
  { value: '', label: 'Not Auto Re-Filter' },
  { value: '60', label: '60s' },
  { value: '120', label: '120s' },
  { value: '180', label: '180s' },
  { value: '300', label: '5m' }
];
@Component({
  selector: 'app-auto-re-filter',
  templateUrl: './auto-re-filter.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoReFilterComponent implements OnDestroy, OnChanges {
  @Input() disabled = false;
  @Output() triggerRefilter: EventEmitter<void> = new EventEmitter<void>();
  @Output() countDown: EventEmitter<number> = new EventEmitter<number>();

  autoReFilterInterval = '';
  options = AutoReFilterOptions;
  countDownValue = 0;
  private autoReFilterTimer: any = null;
  private countdownTimer: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['disabled'].currentValue) {
      this.onAutoReFilterIntervalChange(this.autoReFilterInterval);
    }
  }

  onAutoReFilterIntervalChange(value: string) {
    this.autoReFilterInterval = value;
    this.clearTimers();
    if (!value || this.disabled) {
      this.countDownValue = value ? parseInt(value, 10) : 0;
      this.countDown.emit(this.countDownValue);
      return;
    }
    this.startCountdown(value);
  }

  private startCountdown(value: string) {
    const intervalSec = parseInt(value, 10);
    if (intervalSec > 0) {
      this.countDownValue = intervalSec;
      this.countDown.emit(this.countDownValue);
      this.countdownTimer = setInterval(() => {
        if (this.countDownValue > 0) {
          this.countDownValue = this.countDownValue - 1;
          this.countDown.emit(this.countDownValue);
        }
      }, 1000);
      this.autoReFilterTimer = setInterval(() => {
        this.triggerRefilter.emit();
        this.countDownValue = intervalSec;
        this.countDown.emit(intervalSec);
      }, intervalSec * 1000);
    }
  }

  clearTimers() {
    if (this.autoReFilterTimer) {
      clearInterval(this.autoReFilterTimer);
      this.autoReFilterTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  ngOnDestroy() {
    this.clearTimers();
  }
} 