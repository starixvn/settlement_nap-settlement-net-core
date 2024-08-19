import { Component, ComponentRef, DestroyRef, ElementRef, inject, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { PageType } from '../../shared/constants';
import { from, Observable } from 'rxjs';
import { UrlHelper } from '../../helper';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { BlockUIService } from '../../shared/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
  <span toastContainer></span> 
  <div #container></div>
  <div *ngIf="blockUI" class="in modal-backdrop">
	<div class="loading"></div>
  </div>`,
  imports: [ToastContainerModule, CommonModule],
  styleUrl: './app.component.less',
})
export class AppComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  #destroyRef = inject(DestroyRef);
  #toastrService = inject(ToastrService);
  #blockUIService = inject(BlockUIService)
  public component: ComponentRef<SportTemplate>;
  blockUI = true;
  constructor(protected viewContainerRef: ViewContainerRef, protected elementRef: ElementRef<HTMLElement>) {
  }

  ngOnInit() {
    this.#toastrService.overlayContainer = this.toastContainer;
    const subscriber = this.#blockUIService.blockUIEvent.subscribe((blockUI) => {
        this.blockUI = blockUI;
      })
    this.createComponent();
    this.#destroyRef.onDestroy(() => {
      subscriber.unsubscribe();
    });
  }

  createComponent() {
    const subscriber = this.getComponentFactory().subscribe((componentType) => {
      this.component = this.viewContainerRef.createComponent<SportTemplate>(componentType);
      const matchId = Number(UrlHelper.getUrlParameter('matchId'));
      this.component.instance.getMatch(matchId);
      return this.component;
    });

    this.#destroyRef.onDestroy(() => {
      subscriber.unsubscribe();
    });
  }


  private getComponentFactory(): Observable<Type<SportTemplate>> {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    return from(
      (async () => {
        const { RefundComponent } = await import(
          './refund/refund.component'
        );
        return RefundComponent;
      })()
    );
    switch (pageType) {
      case PageType.ReCalculate:
        return from(
          (async () => {
            const { CalculateComponent } = await import(
              './calculate/calculate.component'
            );
            return CalculateComponent;
          })()
        );
      case PageType.Refund:
        return from(
          (async () => {
            const { RefundComponent } = await import(
              './refund/refund.component'
            );
            return RefundComponent;
          })()
        );
      case PageType.EarlySettlement:
        return from(
          (async () => {
            const { EarlySettlementComponent } = await import(
              './early-settlement/early-settlement.component'
            );
            return EarlySettlementComponent;
          })()
        );
      default:
        throw new Error('Not implemented yet');
    }
  }
}
