import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OutsideSourceComponent } from './outside-source.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material-module';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import { ExternalLinkPipe, SourceStatusPipe, GameStatusPipe } from '../pipes';
import { GenerateFilterService, QueryService } from '../services';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { OutsideSource, Game } from '../models';
import { ItemsSelect } from '../../shared/models';
import { EditSourceDialogComponent } from './edit-source-dialog.component';
import { AddSourceDialogComponent } from './add-source-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('OutsideSourceComponent', () => {
  let component: OutsideSourceComponent;
  let fixture: ComponentFixture<OutsideSourceComponent>;
  let dialog: MatDialog;
  let queryService: QueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      providers: [
        HttpRequestService,
        GenerateFilterService,
        QueryService,
        BlockUIService,
        MessageBoxService
      ],
      imports: [
        NoopAnimationsModule,
        NewMultipleSelectComponent,
        ExternalLinkPipe,
        GameStatusPipe,
        SourceStatusPipe,
        OutsideSourceComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpClientModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    
    fixture = TestBed.createComponent(OutsideSourceComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MatDialog);
    queryService = fixture.debugElement.injector.get(QueryService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit',  () =>{
    it('getPermission - should return permission', fakeAsync(() => {
      jest.spyOn(queryService, 'getScoreSourcePermission').mockReturnValue(Promise.resolve(true));
      component.ngOnInit();
      tick(6000);
      expect(component.scoreSourcePermission).toBe(true);
    }));
  });

  it('openAddSourceDialog - should call matDialog methods', () => {
    component.scoreSourcePermission = true;
    const mockDialogRef = {
      afterClosed: () => of({ event: 'Add', newData: new OutsideSource()})
    } as MatDialogRef<AddSourceDialogComponent>;

    jest.spyOn(dialog, 'closeAll');
    jest.spyOn(dialog, 'open').mockReturnValue(mockDialogRef);
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
    } as MatDialogRef<EditSourceDialogComponent>;
    jest.spyOn(dialog, 'closeAll');
    jest.spyOn(dialog, 'open').mockReturnValue(mockDialogRef);
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
    jest.spyOn(queryService, 'getSources').mockReturnValue(of([outsideSource]));

    component.filter();

    expect(component.outsideSources.length).toEqual(1);
    expect(component.outsideSources[0].games.length).toEqual(6);
  }));
});
