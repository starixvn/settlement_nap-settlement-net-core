import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ProviderSourceComponent } from './provider-source.component';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { QueryService } from '../services';
import { FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Game, ProviderSource } from '../models';
import { of } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProviderSourceComponent', () => {
  let component: ProviderSourceComponent;
  let fixture: ComponentFixture<ProviderSourceComponent>;
  let queryService: QueryService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProviderSourceComponent,
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      providers: [
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        QueryService,
        NgbModal
      ],
      imports: [
        NgbModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
      ]
    })
    
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderSourceComponent);
    component = fixture.componentInstance;
    queryService = fixture.debugElement.injector.get(QueryService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getPermission - should return permission', fakeAsync(() => {
    spyOn(queryService, 'getScoreSourcePermission').and.returnValue(of(false));

    component.getPermission();
    tick();

    expect(component.scoreSourcePermission).toBe(false);
  }));

  describe('getProviders', () => {
    it('should set provider list if return data', fakeAsync(() => {
      component.selectedGame = new Game(1, 'Dota2');
      const mockResult = [
        new ProviderSource(16, 'BetRadar'),
        new ProviderSource(201, 'abc')
      ];
      spyOn(queryService, 'getProviders').and.returnValue(of(mockResult));

      component.getProviders();

      expect(component.providers).toEqual(mockResult);
    }));

    it('should set empty provider when data is empty', fakeAsync(() => {
      component.selectedGame = new Game(1, 'Dota2');
      const mockResult = [];
      spyOn(queryService, 'getProviders').and.returnValue(of(mockResult));

      component.getProviders();

      expect(component.providers).toEqual([]);
    }));
  });

  describe('saveOrder', () => {
    it('should set order correctly and save order successfully', fakeAsync(() => {
      component.selectedGame = new Game(1, 'Dota2');
      component.scoreSourcePermission = true;
      const providers = [
        new ProviderSource(16, 'BetRadar'),
        new ProviderSource(201, 'abc')
      ];
      component.providers = providers;
      spyOn(queryService, 'updateProvider').and.returnValue(of(successfulResult));

      component.saveOrder();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.providers[0].orderNo).toEqual(1);
      expect(component.providers[1].orderNo).toEqual(2);
    }));

    it('should set error message when save order unsuccessfully', fakeAsync(() => {
      component.selectedGame = new Game(1, 'Dota2');
      component.scoreSourcePermission = true;
      const providers = [
        new ProviderSource(16, 'BetRadar'),
        new ProviderSource(201, 'abc')
      ];
      component.providers = providers;
      spyOn(queryService, 'updateProvider').and.returnValue(of(unSuccessfulResult));

      component.saveOrder();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.errorMessage).toEqual(errorMessage);
    }));
  });

  it('ngOnInit - should set game and get providers', () => {
    spyOn(queryService, 'getProviders').and.returnValue(of([]));

    component.ngOnInit();

    expect(component.selectedGame.gameType).toEqual(1);
  });
});
