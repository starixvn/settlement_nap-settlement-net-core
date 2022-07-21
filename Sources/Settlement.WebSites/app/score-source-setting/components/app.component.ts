import {
  Component,
  ComponentFactoryResolver,
  ComponentFactory,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ElementRef,
  ComponentRef
} from '@angular/core';
import * as _ from 'lodash';
import { GenerateFilterService, QueryService } from '../services';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { ProviderSourceComponent } from './provider-source.component';
import { OutsideSourceComponent } from './outside-source.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    MessageBoxService,
    HttpRequestService,
    BlockUIService,
    GenerateFilterService,
    QueryService
  ]
})
export class AppComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public blockUI = true;
    public component: ComponentRef<OnInit>;

    constructor(
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly blockUIService: BlockUIService,
        private readonly elementRef: ElementRef<HTMLElement>
        ) {
    }

    ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createComponent();
    }

    private createComponent() {
        const factory = this.getComponentFactory();
        this.component = this.container.createComponent(factory);
        return this.component;
    }

    private getComponentFactory(): ComponentFactory<OnInit> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        switch (pageType) {
            case "ProviderSource":
                return this.componentFactoryResolver.resolveComponentFactory(ProviderSourceComponent);
            case "OutsideSource":
                return this.componentFactoryResolver.resolveComponentFactory(OutsideSourceComponent);
            default:
              throw new Error('Not implemented yet');
        }
    }
}
