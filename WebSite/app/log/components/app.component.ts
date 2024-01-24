import { Component, OnInit, ViewContainerRef, ViewChild, ComponentRef, ElementRef } from '@angular/core';
import { BlockUIService } from '../../shared/services';
import { LogComponent } from '../components/log';
import { ProviderLogComponent } from '../components/provider-log/provider-log.component';
import { PageType } from '../constants/page-type.native'
import * as _ from 'lodash';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public blockUI = false;
    public component: ComponentRef<OnInit>;
    constructor(
        private readonly blockUIService: BlockUIService,
        private readonly elementRef: ElementRef<HTMLElement>,
        private viewContainerRef: ViewContainerRef) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createTemplateComponent();
    }

    private createTemplateComponent() {
        this.component = this.getComponentFactory();
        return this.component;
    }


    private getComponentFactory()  {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        return  _.isEqual(pageType, PageType.providerLog)
            ? this.viewContainerRef.createComponent(ProviderLogComponent)
            : this.viewContainerRef.createComponent(LogComponent);
    }
}