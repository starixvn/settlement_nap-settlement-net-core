import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ElementRef,
  ComponentRef,
  Type
} from '@angular/core';
import { ProviderSourceComponent } from './provider-source.component';
import { OutsideSourceComponent } from './outside-source.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true
})
export class AppSettingComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
  public component: ComponentRef<OnInit>;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {
  }

  ngOnInit() {
    this.createComponent();
  }

  private createComponent() {
    this.component = this.viewContainerRef.createComponent(this.getComponentFactory());
    return this.component;
  }

  private getComponentFactory(): Type<OnInit> {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    switch (pageType) {
      case "ProviderSource":
        return ProviderSourceComponent;
      case "OutsideSource":
        return OutsideSourceComponent;
      default:
        throw new Error('Not implemented yet');
    }
  }
}
