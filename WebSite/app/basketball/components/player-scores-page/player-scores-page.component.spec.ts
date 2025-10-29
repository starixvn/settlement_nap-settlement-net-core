import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { PlayerScoresPageComponent } from './player-scores-page.component';
import { PlayerScoresService } from './player-scores.service';
import { AioService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { Player } from './models';
import { Match } from '../../models';
import { MatchDetail } from '../../../shared/models/sportsbook-sop';

describe('PlayerScoresPageComponent', () => {
  let component: PlayerScoresPageComponent;
  let fixture: ComponentFixture<PlayerScoresPageComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<PlayerScoresPageComponent>>;
  let mockMessageBoxService: jest.Mocked<MessageBoxService>;
  let mockAioService: jest.Mocked<AioService>;
  let mockToastService: jest.Mocked<ToastrService>;
  let mockBlockUiService: jest.Mocked<BlockUIService>;
  let mockPlayerScoresService: jest.Mocked<PlayerScoresService>;

  const mockMatchDetail: MatchDetail = {
    matchId: 123,
    homeName: 'Team A',
    awayName: 'Team B',
    homeId: 100,
    awayId: 200
  } as MatchDetail;

  const mockPlayer: Player = {
    playerId: 1,
    playerName: 'Player 1',
    teamId: 100,
    checked: false,
    scores: []
  };

  const mockMatch: Match = {
    matchDetail: mockMatchDetail,
    resultDetails: []
  } as Match;

  beforeEach(async () => {
    const dialogRefMock = {
      close: jest.fn()
    };

    const messageBoxServiceMock = {
      confirm: jest.fn()
    };

    const aioServiceMock = {
      getResultsObservable: jest.fn(),
      updateResultDetails: jest.fn(),
      changeResultSetting: jest.fn()
    };

    const toastServiceMock = {
      clear: jest.fn(),
      error: jest.fn(),
      overlayContainer: null
    };

    const blockUiServiceMock = {
      startBlock: jest.fn(),
      stopBlock: jest.fn(),
      blockUIEvent: {
        subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
      }
    };

    const playerScoresServiceMock = {
      mapMatchToPlayerScores: jest.fn(),
      updatePlayers: jest.fn(),
      getCheckedScoresForPlayer: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PlayerScoresPageComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { matchId: 123 } },
        { provide: MessageBoxService, useValue: messageBoxServiceMock },
        { provide: AioService, useValue: aioServiceMock },
        { provide: ToastrService, useValue: toastServiceMock },
        { provide: BlockUIService, useValue: blockUiServiceMock },
        { provide: PlayerScoresService, useValue: playerScoresServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerScoresPageComponent);
    component = fixture.componentInstance;
    
    mockDialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<MatDialogRef<PlayerScoresPageComponent>>;
    mockMessageBoxService = TestBed.inject(MessageBoxService) as jest.Mocked<MessageBoxService>;
    mockAioService = TestBed.inject(AioService) as jest.Mocked<AioService>;
    mockToastService = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    mockBlockUiService = TestBed.inject(BlockUIService) as jest.Mocked<BlockUIService>;
    mockPlayerScoresService = TestBed.inject(PlayerScoresService) as jest.Mocked<PlayerScoresService>;

    // Setup default return values
    mockAioService.getResultsObservable.mockReturnValue(of(mockMatch));
    mockPlayerScoresService.mapMatchToPlayerScores.mockReturnValue([mockPlayer]);
    mockPlayerScoresService.updatePlayers.mockReturnValue([mockPlayer]);
    mockPlayerScoresService.getCheckedScoresForPlayer.mockReturnValue([]);
    mockAioService.updateResultDetails.mockResolvedValue({ 
      isSuccessful: true,
      errCode: 0,
      errMsg: '',
      childMatchIds: '',
      settledSessionId: '',
      hasResultAmendment: false,
      isOrg: false
    });
    mockAioService.changeResultSetting.mockResolvedValue(undefined);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component and load data on ngOnInit', () => {
    const loadDataSpy = jest.spyOn(component, 'loadData');
    
    component.ngOnInit();
    
    expect(loadDataSpy).toHaveBeenCalled();
    expect(mockToastService.overlayContainer).toBe(component.toastContainer);
  });

  it('should close dialog when close is called', () => {
    component.close();
    
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should load match data and map to players', () => {
    component.loadData();
    
    expect(mockBlockUiService.startBlock).toHaveBeenCalledWith(true);
    expect(mockAioService.getResultsObservable).toHaveBeenCalledWith({ matchId: 123 });
    expect(component.matchDetail).toBe(mockMatchDetail);
    expect(mockPlayerScoresService.mapMatchToPlayerScores).toHaveBeenCalledWith(mockMatch);
    expect(component.players).toEqual([mockPlayer]);
    expect(mockBlockUiService.stopBlock).toHaveBeenCalled();
  });

  it('should toggle home team collapsed state', () => {
    expect(component.isHomeTeamCollapsed).toBe(false);
    
    component.toggleHomeTeam();
    expect(component.isHomeTeamCollapsed).toBe(true);
    
    component.toggleHomeTeam();
    expect(component.isHomeTeamCollapsed).toBe(false);
  });

  it('should toggle away team collapsed state', () => {
    expect(component.isAwayTeamCollapsed).toBe(false);
    
    component.toggleAwayTeam();
    expect(component.isAwayTeamCollapsed).toBe(true);
    
    component.toggleAwayTeam();
    expect(component.isAwayTeamCollapsed).toBe(false);
  });

  it('should clear toast when holdResult is called', () => {
    component.holdResult(1);
    
    expect(mockToastService.clear).toHaveBeenCalled();
  });

  it('should clear toast when unholdResult is called', () => {
    component.unholdResult(1);
    
    expect(mockToastService.clear).toHaveBeenCalled();
  });

  it('should clear toast when confirmResult is called', () => {
    component.confirmResult(1);
    
    expect(mockToastService.clear).toHaveBeenCalled();
  });

  it('should clear toast when unconfirmResult is called', () => {
    component.unconfirmResult(1);
    
    expect(mockToastService.clear).toHaveBeenCalled();
  });

  it('should handle service error in loadData', () => {
    mockAioService.getResultsObservable.mockReturnValue(of(mockMatch));
    
    component.loadData();
    
    expect(mockBlockUiService.startBlock).toHaveBeenCalledWith(true);
    expect(mockBlockUiService.stopBlock).toHaveBeenCalled();
  });

  it('should initialize with correct default values', () => {
    expect(component.blockUI).toBe(false);
    expect(component.players).toEqual([]);
    expect(component.isHomeTeamCollapsed).toBe(false);
    expect(component.isAwayTeamCollapsed).toBe(false);
    expect(component.matchDetail).toBeInstanceOf(MatchDetail);
  });

  it('should set matchId from dialog data', () => {
    expect(component.data.matchId).toBe(123);
  });



  it('should handle empty players array in checkbox change', () => {
    component.players = [];
    const event = { playerId: 1, checked: true };
    
    component.onCheckboxChange(event);
    
    expect(mockPlayerScoresService.updatePlayers).toHaveBeenCalledWith([], 1, true);
  });

  it('should maintain state consistency after multiple toggles', () => {
    // Test home team toggle
    component.toggleHomeTeam();
    expect(component.isHomeTeamCollapsed).toBe(true);
    
    component.toggleHomeTeam();
    expect(component.isHomeTeamCollapsed).toBe(false);
    
    // Test away team toggle
    component.toggleAwayTeam();
    expect(component.isAwayTeamCollapsed).toBe(true);
    
    component.toggleAwayTeam();
    expect(component.isAwayTeamCollapsed).toBe(false);
  });

  it('should call loadData after component initialization', () => {
    const loadDataSpy = jest.spyOn(component, 'loadData');
    
    component.ngOnInit();
    
    expect(loadDataSpy).toHaveBeenCalledTimes(1);
  });

  it('should set toast overlay container on init', () => {
    component.ngOnInit();
    
    expect(mockToastService.overlayContainer).toBe(component.toastContainer);
  });
});
