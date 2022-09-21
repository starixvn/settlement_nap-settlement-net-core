import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OutsideSourceComponent } from './outside-source.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material-module';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { NewMultipleSelectComponent, ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { ExternalLinkPipe, SourceStatusPipe, GameStatusPipe } from '../pipes';
import { GenerateFilterService, QueryService } from '../services';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { OutsideSource, Game } from '../models';
import { ItemsSelect } from '../../shared/models';

describe('OutsideSourceComponent', () => {
  let component: OutsideSourceComponent;
  let fixture: ComponentFixture<OutsideSourceComponent>;
  let dialog: MatDialog;
  let generateFilterService: GenerateFilterService;
  let queryService: QueryService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        OutsideSourceComponent,
        NewMultipleSelectComponent,
        ExternalLinkPipe,
        GameStatusPipe,
        SourceStatusPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        HttpRequestService,
        HttpClient,
        HttpHandler,
        GenerateFilterService,
        QueryService,
        BlockUIService,
        MessageBoxService
      ],
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutsideSourceComponent);
    dialog = TestBed.inject(MatDialog);
    generateFilterService = TestBed.inject(GenerateFilterService);
    queryService = TestBed.inject(QueryService);
    component = fixture.componentInstance;
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

  it('openAddSourceDialog - should call matDialog methods', () => {
    component.scoreSourcePermission = true;
    const mockDialogRef = {
      afterClosed: () => of({ event: 'Add', newData: new OutsideSource()})
    };
    spyOn(dialog, 'open').and.returnValue(mockDialogRef);

    component.openAddSourceDialog();

    expect(dialog.open).toHaveBeenCalled();
    expect(component.outsideSources.length).toEqual(1);
  });

  it('openEditSourceDialog - should call matDialog methods and edit input source', () => {
    const editedSource = new OutsideSource();
    editedSource.sourceId = 333;
    component.scoreSourcePermission = true;
    const mockDialogRef = {
      afterClosed: () => of({ event: 'Save', newData: editedSource})
    };
    spyOn(dialog, 'closeAll');
    spyOn(dialog, 'open').and.returnValue(mockDialogRef);
    const source = new OutsideSource();
    source.sourceId = 1234;

    component.openEditSourceDialog(source);

    expect(dialog.open).toHaveBeenCalled();
    expect(source).toEqual(editedSource);
  });

  describe('selectGame', () => {
    it('should return empty when none is checked', () => {
      component.selectGame([]);

      expect(component.gamesSelected).toEqual('');
    });

    it('should return game type string when exist checked games', () => {
      component.selectGame([new ItemsSelect(1, '1', '', true, true, true, []), new ItemsSelect(2, '2', '', true, true, true, [])]);

      expect(component.gamesSelected).toEqual('1,2');
    });
  });

  describe('selectStatus', () => {
    it('should return default value when none is checked', () => {
      component.selectStatus([]);

      expect(component.statusSelected).toEqual('99');
    });

    it('should return value when exist checked status', () => {
      component.selectStatus([new ItemsSelect(1, '1', '', true, true, true, [])]);

      expect(component.statusSelected).toEqual('1');
    });
  });

  it('filter - should fetch and generate 5 games for each source', fakeAsync(() => {
    component.sourceName = '';
    component.statusSelected = '99';
    component.gamesSelected = '';
    const outsideSource = new OutsideSource();
    outsideSource.games = [new Game(1, ''), new Game(2, '')];
    spyOn(queryService, 'getSources').and.returnValue(of([outsideSource]));

    component.filter();

    expect(component.outsideSources.length).toEqual(1);
    expect(component.outsideSources[0].games.length).toEqual(6);
  }));
});
