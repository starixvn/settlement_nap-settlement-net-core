import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { BlockUIService, MessageBoxService } from '../../shared/services';
import AppComponent, {
  AutoSettingComponent,
  TimeSettingComponent,
} from '.';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { RemarkSettingComponent } from './remark-setting.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;
  let blockUIService: BlockUIService;
  class MockElementRef implements ElementRef {
    nativeElement = {};
  }


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        AutoSettingComponent,
        TimeSettingComponent,
        RemarkSettingComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        { provide: BlockUIService },
        { provide: ElementRef, useValue: new MockElementRef()},
        { provide: MessageBoxService },
      ],
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
      ],
    })
    .overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ModalDialogComponent,
          ModalContentDialogComponent,
          TimeSettingComponent,
          RemarkSettingComponent,
          AutoSettingComponent,
        ],
      },
    })
    .compileComponents()
    .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        elementRef = fixture.debugElement.injector.get(ElementRef);
        blockUIService = fixture.debugElement.injector.get(BlockUIService);
    });
  }));

  it('should create',  waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  describe('ngOnInit', () => {
    it('should create time setting component', () => {
      spyOn(elementRef.nativeElement, 'getAttribute').and.returnValue('DirectTime');
      spyOn(blockUIService, 'blockUIEvent').and.returnValue(true);

      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });

    it('should create auto setting component', () => {
      spyOn(elementRef.nativeElement, 'getAttribute').and.returnValue('AutoSetting');
      spyOn(blockUIService, 'blockUIEvent').and.returnValue(true);

      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });

    it('should create remark setting component', () => {
      spyOn(elementRef.nativeElement, 'getAttribute').and.returnValue('Remark');
      spyOn(blockUIService, 'blockUIEvent').and.returnValue(true);

      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });
  });
});
