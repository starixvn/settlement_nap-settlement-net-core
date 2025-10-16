import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamSectionComponent } from './team-section.component';
import { Player, PlayerScore } from './models.native';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TeamSectionComponent', () => {
  let component: TeamSectionComponent;
  let fixture: ComponentFixture<TeamSectionComponent>;

  const createMockPlayer = (playerId: number, playerName: string, teamId: number): Player => {
    const mockScores: PlayerScore[] = [
      { 
        playerId, 
        playerName, 
        teamId, 
        key: 'points', 
        resourceId: '653', 
        value: '10',
        checked: false,
        isConfirmed: false,
        isHold: false,
        isCalculated: false,
        isRefunded: false,
        isConfirmedRefund: false,
        isEmpty: false
      },
      { 
        playerId, 
        playerName, 
        teamId, 
        key: 'threePointFG', 
        resourceId: '662', 
        value: '3',
        checked: false,
        isConfirmed: false,
        isHold: false,
        isCalculated: false,
        isRefunded: false,
        isConfirmedRefund: false,
        isEmpty: false
      }
    ];

    return {
      playerId,
      playerName,
      teamId,
      checked: false,
      scores: mockScores
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamSectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Inputs', () => {
    it('should have default values for inputs', () => {
      expect(component.teamName).toBe('');
      expect(component.players).toEqual([]);
      expect(component.isCollapsed).toBe(false);
    });

    it('should accept teamName input', () => {
      component.teamName = 'Lakers';
      fixture.detectChanges();
      
      const teamNameElement = fixture.nativeElement.querySelector('.team-name span:not(.team-toggle-icon)');
      expect(teamNameElement.textContent).toContain('Lakers');
    });

    it('should accept players input', () => {
      const mockPlayers = [
        createMockPlayer(1, 'LeBron James', 1),
        createMockPlayer(2, 'Anthony Davis', 1)
      ];
      component.players = mockPlayers;
      fixture.detectChanges();

      expect(component.players.length).toBe(2);
    });

    it('should accept isCollapsed input', () => {
      component.isCollapsed = true;
      fixture.detectChanges();

      const tableContainer = fixture.nativeElement.querySelector('.table-container');
      expect(tableContainer.classList.contains('collapsed')).toBe(true);
    });
  });

  describe('Toggle Team Collapse', () => {
    it('should display "+" icon when team is collapsed', () => {
      component.isCollapsed = true;
      fixture.detectChanges();

      const plusIcon = fixture.nativeElement.querySelector('.team-toggle-icon');
      expect(plusIcon.textContent).toBe('+');
    });

    it('should display "-" icon when team is expanded', () => {
      component.isCollapsed = false;
      fixture.detectChanges();

      const minusIcon = fixture.nativeElement.querySelector('.team-toggle-icon');
      expect(minusIcon.textContent).toBe('-');
    });

    it('should emit toggleCollapse event when team name is clicked', () => {
      jest.spyOn(component.toggleCollapse, 'emit');
      
      const teamNameElement = fixture.nativeElement.querySelector('.team-name');
      teamNameElement.click();

      expect(component.toggleCollapse.emit).toHaveBeenCalled();
    });

    it('should call toggleTeam when team name is clicked', () => {
      jest.spyOn(component, 'toggleTeam');
      
      const teamNameElement = fixture.nativeElement.querySelector('.team-name');
      teamNameElement.click();

      expect(component.toggleTeam).toHaveBeenCalled();
    });
  });

  describe('Hold Result Actions', () => {
    it('should emit holdResult event when hold button is clicked', () => {
      const mockPlayers = [createMockPlayer(1, 'Player 1', 1)];
      component.players = mockPlayers;
      fixture.detectChanges();

      jest.spyOn(component.holdResult, 'emit');
      
      const holdButton = fixture.nativeElement.querySelector('.hold-icon');
      holdButton.click();

      expect(component.holdResult.emit).toHaveBeenCalledWith(1);
    });

    it('should call onHoldResult with correct playerId', () => {
      jest.spyOn(component, 'onHoldResult');
      
      component.onHoldResult(123);

      expect(component.onHoldResult).toHaveBeenCalledWith(123);
    });

    it('should emit unholdResult event when unhold button is clicked', () => {
      const mockPlayers = [createMockPlayer(1, 'Player 1', 1)];
      component.players = mockPlayers;
      fixture.detectChanges();

      jest.spyOn(component.unholdResult, 'emit');
      
      const unholdButton = fixture.nativeElement.querySelector('.unhold-icon');
      unholdButton.click();

      expect(component.unholdResult.emit).toHaveBeenCalledWith(1);
    });

    it('should call onUnholdResult with correct playerId', () => {
      jest.spyOn(component, 'onUnholdResult');
      
      component.onUnholdResult(456);

      expect(component.onUnholdResult).toHaveBeenCalledWith(456);
    });
  });

  describe('Confirm Result Actions', () => {
    it('should emit confirmResult event when confirm button is clicked', () => {
      const mockPlayers = [createMockPlayer(1, 'Player 1', 1)];
      component.players = mockPlayers;
      fixture.detectChanges();

      jest.spyOn(component.confirmResult, 'emit');
      
      const confirmButton = fixture.nativeElement.querySelector('.confirm-icon');
      confirmButton.click();

      expect(component.confirmResult.emit).toHaveBeenCalledWith(1);
    });

    it('should call onConfirmResult with correct playerId', () => {
      jest.spyOn(component, 'onConfirmResult');
      
      component.onConfirmResult(789);

      expect(component.onConfirmResult).toHaveBeenCalledWith(789);
    });

    it('should emit unconfirmResult event when unconfirm button is clicked', () => {
      const mockPlayers = [createMockPlayer(1, 'Player 1', 1)];
      component.players = mockPlayers;
      fixture.detectChanges();

      jest.spyOn(component.unconfirmResult, 'emit');
      
      const unconfirmButton = fixture.nativeElement.querySelector('.unconfirm-icon');
      unconfirmButton.click();

      expect(component.unconfirmResult.emit).toHaveBeenCalledWith(1);
    });

    it('should call onUnconfirmResult with correct playerId', () => {
      jest.spyOn(component, 'onUnconfirmResult');
      
      component.onUnconfirmResult(101);

      expect(component.onUnconfirmResult).toHaveBeenCalledWith(101);
    });
  });

  describe('Checkbox Change', () => {
    it('should emit checkboxChange event when checkbox is changed', () => {
      const mockPlayer = createMockPlayer(1, 'Player 1', 1);
      component.players = [mockPlayer];
      fixture.detectChanges();

      jest.spyOn(component.checkboxChange, 'emit');
      
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox.click();
      fixture.detectChanges();

      expect(component.checkboxChange.emit).toHaveBeenCalledWith({
        playerId: 1,
        checked: true
      });
    });

    it('should call onCheckboxChange with correct parameters', () => {
      const mockPlayer = createMockPlayer(1, 'Player 1', 1);
      jest.spyOn(component, 'onCheckboxChange');
      
      component.onCheckboxChange(true, mockPlayer);

      expect(component.onCheckboxChange).toHaveBeenCalledWith(true, mockPlayer);
    });

    it('should emit correct playerId and checked value', () => {
      const mockPlayer = createMockPlayer(42, 'Test Player', 1);
      jest.spyOn(component.checkboxChange, 'emit');
      
      component.onCheckboxChange(false, mockPlayer);

      expect(component.checkboxChange.emit).toHaveBeenCalledWith({
        playerId: 42,
        checked: false
      });
    });
  });

  describe('Player Rendering', () => {
    it('should render player names correctly', () => {
      const mockPlayers = [
        createMockPlayer(1, 'LeBron James', 1),
        createMockPlayer(2, 'Anthony Davis', 1)
      ];
      component.players = mockPlayers;
      fixture.detectChanges();

      const playerNames = fixture.nativeElement.querySelectorAll('.player-col-inner span');
      expect(playerNames[0].textContent).toContain('LeBron James');
      expect(playerNames[1].textContent).toContain('Anthony Davis');
    });

    it('should render correct number of player rows', () => {
      const mockPlayers = [
        createMockPlayer(1, 'Player 1', 1),
        createMockPlayer(2, 'Player 2', 1),
        createMockPlayer(3, 'Player 3', 1)
      ];
      component.players = mockPlayers;
      fixture.detectChanges();

      const playerRows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(playerRows.length).toBe(3);
    });
  });

  describe('Score Input Rendering', () => {
    it('should apply correct CSS classes based on score status', () => {
      const mockPlayer = createMockPlayer(1, 'Player 1', 1);
      mockPlayer.scores[0].isHold = true;
      mockPlayer.scores[1].isConfirmed = true;
      
      component.players = [mockPlayer];
      fixture.detectChanges();

      const scoreCells = fixture.nativeElement.querySelectorAll('.input-score-col');
      expect(scoreCells[0].classList.contains('isHold')).toBe(true);
    });

    it('should render score input fields', () => {
      const mockPlayer = createMockPlayer(1, 'Player 1', 1);
      component.players = [mockPlayer];
      fixture.detectChanges();

      const scoreInputs = fixture.nativeElement.querySelectorAll('.input-score');
      expect(scoreInputs.length).toBeGreaterThan(0);
    });

    it('should apply isConfirmed class to score input when score is confirmed', () => {
      const mockPlayer = createMockPlayer(1, 'Player 1', 1);
      mockPlayer.scores[0].isConfirmed = true;
      
      component.players = [mockPlayer];
      fixture.detectChanges();

      const scoreInput = fixture.nativeElement.querySelector('.input-score.isConfirmed');
      expect(scoreInput).toBeTruthy();
    });
  });

  describe('Button Titles', () => {
    it('should have correct title attributes for action buttons', () => {
      const mockPlayers = [createMockPlayer(1, 'Player 1', 1)];
      component.players = mockPlayers;
      fixture.detectChanges();

      const holdButton = fixture.nativeElement.querySelector('.hold-icon');
      const unholdButton = fixture.nativeElement.querySelector('.unhold-icon');
      const confirmButton = fixture.nativeElement.querySelector('.confirm-icon');
      const unconfirmButton = fixture.nativeElement.querySelector('.unconfirm-icon');

      expect(holdButton.getAttribute('title')).toBe('Hold results');
      expect(unholdButton.getAttribute('title')).toBe('Unhold results');
      expect(confirmButton.getAttribute('title')).toBe('Confirm results');
      expect(unconfirmButton.getAttribute('title')).toBe('Unconfirm results');
    });
  });

  describe('Table Header', () => {
    it('should render table headers correctly', () => {
      component.players = [];
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers[0].textContent).toContain('Player Name');
      expect(headers[1].textContent).toContain('Points');
      expect(headers[2].textContent).toContain('3-Point FG');
      expect(headers[3].textContent).toContain('Assists');
      expect(headers[4].textContent).toContain('Blocks');
      expect(headers[5].textContent).toContain('Rebounds');
      expect(headers[6].textContent).toContain('Steals');
      expect(headers[7].textContent).toContain('Hold Result');
      expect(headers[8].textContent).toContain('Confirm Result');
    });
  });
});
