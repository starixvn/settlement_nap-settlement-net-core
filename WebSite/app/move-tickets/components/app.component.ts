import { Component, OnInit, ViewContainerRef, ViewChild, ComponentRef } from '@angular/core';
import { BlockUIService } from '../../shared/services';
import { CricketComponent } from '../components/cricket';

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
        private  readonly viewContainerRef: ViewContainerRef) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createTemplateComponent();
    }

    private createTemplateComponent() {
        this.component = this.viewContainerRef.createComponent(CricketComponent);
        return this.component;
    }
}