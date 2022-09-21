import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, ComponentFactory, ComponentRef, ElementRef } from '@angular/core';
import { BlockUIService } from '../../shared/services';
import { PageType } from '../constants';
import { CricketComponent } from '../components/cricket';
import { RunningTicketsComponent } from '../components/running-tickets/running-tickets.component';
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
        private readonly componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createTemplateComponent();
    }

    private createTemplateComponent() {
        const factory = this.getComponentFactory();
        this.component = this.container.createComponent(factory);
        return this.component;
    }


    private getComponentFactory() : ComponentFactory<OnInit> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        return _.isEqual(pageType, PageType.cricket)
            ? this.componentFactoryResolver.resolveComponentFactory(CricketComponent)
            : this.componentFactoryResolver.resolveComponentFactory(RunningTicketsComponent);
    }
}