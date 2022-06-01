import {
    Component, ComponentFactory, ComponentFactoryResolver,
    ComponentRef, ElementRef, ViewChild, ViewContainerRef
} from "@angular/core";
import { UrlHelper } from '../../../helper';
import { SportTemplate } from "../../models/sportsbook-sop";
import { BlockUIService } from "../../services";

@Component({
    template: '',
})
export class AppBaseComponent {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public component: ComponentRef<SportTemplate>;
    public apiUrl: string;
    constructor(
        protected blockUIService: BlockUIService,
        protected elementRef: ElementRef<HTMLElement>,
        protected componentFactoryResolver: ComponentFactoryResolver) {
    }

    public createTemplateComponent(getComponentFactory: () => ComponentFactory<SportTemplate>): ComponentRef<SportTemplate> {
        const factory = getComponentFactory();
        this.component = this.container.createComponent(factory);
        const matchId = Number(UrlHelper.getUrlParameter('matchId'));
        this.apiUrl = this.elementRef.nativeElement.getAttribute('api-url');
        this.component.instance.getMatch(matchId, this.apiUrl);
        return this.component;
    }
}
