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
        if (this.component) {
            this.component.destroy();
        }
        
        this.component = this.viewContainerRef.createComponent<SportTemplate>(template);
        const matchId = Number(UrlHelper.getUrlParameter('matchId'));
        this.component.instance.getMatch(matchId);
        return this.component;
    }

    ngOnDestroy() {
        if (this.component) {
            this.component.destroy();
        }
    }
}
