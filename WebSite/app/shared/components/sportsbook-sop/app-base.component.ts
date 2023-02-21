import {
    Component,
    ComponentRef, ElementRef, Type, ViewChild, ViewContainerRef
} from "@angular/core";
import { UrlHelper } from '../../../helper';
import { SportTemplate } from "../../models/sportsbook-sop";

@Component({
    template: '',
})
export class AppBaseComponent {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public component: ComponentRef<SportTemplate>;
    constructor(
        protected elementRef: ElementRef<HTMLElement>,
        protected viewContainerRef: ViewContainerRef) {
    }

    public createTemplateComponent(template: Type<SportTemplate>): ComponentRef<SportTemplate> {
        this.component = this.viewContainerRef.createComponent<SportTemplate>(template);
        const matchId = Number(UrlHelper.getUrlParameter('matchId'));
        const rootUrl = this.elementRef.nativeElement.getAttribute('root-url') ?? '';
        this.component.instance.getMatch(matchId, rootUrl);
        return this.component;
    }
}
