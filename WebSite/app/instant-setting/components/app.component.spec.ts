import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from "@angular/core";
import { BlockUIService } from '../../shared/services';
import  { 
  AutoSettingComponent,
  TimeSettingComponent,
} from '.';
import { RemarkSettingComponent } from './remark-setting.component';
import { AppComponent } from './app.component';
import { LeagueAutoSettingsComponent } from './league-auto-settings/league-auto-settings.component';
import { HttpClientModule } from '@angular/common/http';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;
  let blockUIService: BlockUIService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppComponent,
        AutoSettingComponent,
        TimeSettingComponent,
        RemarkSettingComponent,
        LeagueAutoSettingsComponent,
        HttpClientModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
      ],
      providers: [
        BlockUIService
      ]
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
      jest.spyOn(elementRef.nativeElement, 'getAttribute').mockReturnValue('DirectTime');

      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });

    it('should create auto setting component', () => {
      jest.spyOn(elementRef.nativeElement, 'getAttribute').mockReturnValue('AutoSetting');

      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });

    it('should create remark setting component', () => {
      jest.spyOn(elementRef.nativeElement, 'getAttribute').mockReturnValue('Remark');
  
      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });

    it('should create league settings component', () => {
      jest.spyOn(elementRef.nativeElement, 'getAttribute').mockReturnValue('AdvancedLeagueSettings');
    
      component.ngOnInit();

      expect(component.container).toBeTruthy();
    });
  });
});
