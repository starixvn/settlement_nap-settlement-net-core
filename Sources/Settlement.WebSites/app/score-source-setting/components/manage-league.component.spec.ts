import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageLeagueComponent } from './manage-league.component';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { QueryService } from '../services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LeagueOutsideSource, OutsideSource, Game } from '../models';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { of } from 'rxjs';

describe('ManageLeagueComponent', () => {
  let component: ManageLeagueComponent;
  let fixture: ComponentFixture<ManageLeagueComponent>;
  let messageBoxService: MessageBoxService;
  let queryService: QueryService;
  let dialogRef: MatDialogRef<ManageLeagueComponent>;
  let outsideSourceList: OutsideSource[];
  let outsideSourceSort: OutsideSource[];

  const mockSource: OutsideSource = {
    pGid: 5,
    sourceName: 'mock name',
    orderNo: 5,
    remark: 'n\a',
    sourceId: 2,
    games: [],
    sourceStatus: true,
    sportType: 1,
    sportName: 'e-sport',
  };

  const mockScreenShotSource: OutsideSource = {
    pGid: 1,
    sourceName: 'mockScreenShot',
    orderNo: 1,
    remark: 'n\a',
    sourceId: 1,
    games: [],
    sourceStatus: true,
    sportType: 1,
    sportName: 'e-sport',
  };

  const data: LeagueOutsideSource = {
    outsideSourceSort: [mockScreenShotSource, mockSource],
    outsideSourceList: [],
    leagueId: 1,
    leagueName: 'mockSource',
    sportName: 'mockSportName',
  };

  const errorMessage = "Error message";

  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ManageLeagueComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        MessageBoxService,
        QueryService,
        HttpRequestService,
        BlockUIService,
        HttpClient,
        NgbModal,
        { provide: MessageBoxService, useClass: MessageBoxService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ],
      imports: [FormsModule, HttpClientModule, NgbModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ManageLeagueComponent);
        component = fixture.componentInstance;
        dialogRef = fixture.debugElement.injector.get(MatDialogRef);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        queryService = fixture.debugElement.injector.get(QueryService);
      });
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set component properties.', () => {
    outsideSourceList = data.outsideSourceList;
    outsideSourceSort = data.outsideSourceSort;
    component.data = data;

    component.ngOnInit();

    expect(component.outsideSourceList).toEqual(outsideSourceList);
    expect(component.screenShotSource).toEqual(mockScreenShotSource);
  });

  describe('addSource.', () => {
    it('should alert when source is on list.', () => {
      component.outsideSourceSort = data.outsideSourceSort;
      spyOn(messageBoxService, 'alert');

      component.addSource(mockSource);

      expect(messageBoxService.alert).toHaveBeenCalled();
    });
    it('should add source to table.', () => {
      component.outsideSourceSort = data.outsideSourceSort;
      const mockAddSource: OutsideSource = {
        pGid: 2,
        sourceName: 'mockAddSource',
        orderNo: 2,
        remark: 'n\a',
        sourceId: 2,
        games: [],
        sourceStatus: true,
        sportType: 1,
        sportName: 'e-sport',
      };

      component.addSource(mockAddSource);

      expect(component.outsideSourceSort).toContain(mockAddSource);
    });
  });

  it('deleteSource - should delete source from list.', () => {
    component.outsideSourceSort = data.outsideSourceSort;
    const mockDeleteSource: OutsideSource = {
      pGid: 3,
      sourceName: 'mockDeleteSource',
      orderNo: 3,
      remark: 'n\a',
      sourceId: 3,
      games: [],
      sourceStatus: true,
      sportType: 1,
      sportName: 'e-sport',
    };
    component.outsideSourceSort.push(mockDeleteSource);

    component.deleteSource(mockDeleteSource);

    expect(component.outsideSourceSort).not.toContain(mockDeleteSource);
  });

  describe('save', () => {
    it('should show confirmbox when called.', () => {
      spyOn(messageBoxService, 'confirm');

      component.save();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show alert when update is unsuccessful.', fakeAsync(() => {
      component.outsideSourceSort = data.outsideSourceSort;
      component.screenShotSource = mockScreenShotSource;
      spyOn(messageBoxService, 'alert');
      spyOn(queryService, 'updateLeagueSources').and.returnValue(of(unSuccessfulResult));

      component.save();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.alert).toHaveBeenCalled();
    }));
  });
});
