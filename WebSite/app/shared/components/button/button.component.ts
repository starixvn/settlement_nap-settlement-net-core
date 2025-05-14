import { NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [NgClass],
  template: ` <button
    [type]="type"
    [disabled]="disabled"
    [ngClass]="variant"
    class="variant-button"
  >
    <ng-content></ng-content>
  </button>`,
  styles: [
    `
      .variant-button {
        padding: 0.5rem 2rem;
        font-size: 1rem;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;

        &:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        &.primary {
          border: solid 1px #3c5b9b;
          color: #fff;
          background-color: #5578be;

          &:hover:not(:disabled) {
            background-color: #5578be
          }
        }

        &.secondary {
          background-color: #6c757d;
          color: #fff;

          &:hover:not(:disabled) {
            background-color: #545b62;
          }
        }

        &.danger {
          border: solid 1px #dc3545;
          background-color: #dc3545;
          color: #fff;

          &:hover:not(:disabled) {
            background-color: #b21f3d;
          }
        }

        &.success {
          background-color: #28a745;
          color: #fff;

          &:hover:not(:disabled) {
            background-color: #1e7e34;
          }
        }
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: string = "primary";
  @Input() type: string = "button";
  @Input() disabled: boolean = false;
}
