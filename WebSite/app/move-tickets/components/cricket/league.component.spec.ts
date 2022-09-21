import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  LeagueComponent,
} from '.';
import {
  MultiSport,
  MatchWaitingRequest,
  Permission,
  ChildMatch,
} from '../../models';
import { MoveTicketsService } from './move-tickets.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, DialogBoxService, SportMatchService } from '../../../shared/services';
import { SimpleChange } from '@angular/core';
import { MaterialModule } from '../../../shared/material-module';
import { of } from 'rxjs';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../../shared/components';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IntervalScorePipe } from '../../../shared/pipes/interval-score.pipe';
import {
  SportMatch,
  MoreScore,
  Score,
  LeagueMatch,
  Match,
  Remark } from '../../../shared/models';
import { BackgroundColor, SportType } from '../../../shared/constants';

describe('MoveTickets - LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;
  let messageBoxService: MessageBoxService;
  let moveTicketsService: MoveTicketsService;
  let sportMatchService: SportMatchService;
  const match = new Match();
  match.matchId = '700000';
  match.sportType = SportType.eSports;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";

  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [match],
    name: 'mock league',
    collapse: false,
    isCheckedCalcMP: true,
    disableCheckCalcMP: false,
    isMergedParlay: true,
  };

  const sport: SportMatch = {
    id: 100000,
    name: 'mock sport',
    leagues: [league],
    collapse: false,
  };

  const permission = new Permission();
  permission.canCalculateMp = true;
  const multiSport: MultiSport = {
    permission,
    sports: [sport],
    isCheckedCalcMP: false,
  };
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
  const unsuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LeagueComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        IntervalScorePipe,
      ],
      providers: [
        NgbModal,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        DialogBoxService,
        SportMatchService,
        MoveTicketsService
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    sportMatchService = fixture.debugElement.injector.get(SportMatchService);
    moveTicketsService = fixture.debugElement.injector.get(MoveTicketsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set permission and refresh matches', fakeAsync(() => {
    component.multiSport = multiSport;
    component.sports = multiSport.sports;

    component.ngOnInit();

    expect(component.permission).toEqual(permission);
  }));

  it('should set sports and permission when component has changes', () => {
    component.multiSport = multiSport;
    spyOn(sportMatchService, 'getSportsWithIntervalScore');

    component.ngOnChanges({ multiSport: new SimpleChange(null, multiSport, false) });
    fixture.detectChanges();

    expect(sportMatchService.getSportsWithIntervalScore).toHaveBeenCalled();
    expect(component.permission).toEqual(permission);
  });

  describe('isExistedSport', () => {
    it('should return true sports list is not empty', () => {
      component.sports = [sport];
      const result = component.isExistedSport;

      expect(result).toBe(true);
    });

    it('should return undefined when sport list is null', () => {
      const result = component.isExistedSport;

      expect(result).toBe(undefined);
    });

    it('should return false when sports list is empty', () => {
      component.sports = [];

      const result = component.isExistedSport;

      expect(result).toBe(false);
    });
  });

  it('collapseSport - should collapse or uncollapse sport', () => {
    const mockSport = new SportMatch();
    mockSport.collapse = false;

    component.collapseSport(mockSport);

    expect(mockSport.collapse).toBe(true);
  });

  it('collapseLeague - should collapse or uncollapse league', () => {
    const mockLeague = new LeagueMatch();
    mockLeague.collapse = false;

    component.collapseLeague(mockLeague);

    expect(mockLeague.collapse).toBe(true);
  });

  describe('canAutoSettlement', () => {
    it('should return true when sport support early settlement', () => {
      const sportType = SportType.badminton;

      const result = component.canAutoSettlemt(sportType);

      expect(result).toBe(true);
    });

    it('should return false when sport does not support early settlement', () => {
      const sportType = SportType.baseBall;

      const result = component.canAutoSettlemt(sportType);

      expect(result).toBe(false);
    });
  });

  describe('getEarlySettleBackground', () => {
    it('should return background running when early settle is running', () => {
      match.earlySettleStatus = 'running';
      match.eventStatus = 'completed';

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual(BackgroundColor.autoSettleRunning);
    });

    it('should return background calculated when early settle is completed', () => {
      match.earlySettleStatus = 'completed';

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual(BackgroundColor.calculated);
    });

    it('should return empty when early settle status is null', () => {
      match.earlySettleStatus = null;

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual('');
    });
  });

  it('getLog - should call popupService', () => {
    const request = new MatchWaitingRequest('12345', '', '01/01/2020', '01/02/2020');
    component.request = request;
    spyOn(moveTicketsService, 'popupLog');

    component.getLog(12345);

    expect(moveTicketsService.popupLog).toHaveBeenCalled();
  });

  describe('getRemarkStatusTooltip', () => {
    it('should return tooltip when all status are marked', () => {
      const remark: Remark = {
        isKeyHold: true,
        isMtdHold: true,
        isPending: true,
        isUndecided: true,
        isUnderSettle: true,
      };

      const result = component.getRemarkStatusTooltip(remark);
      const expected = "MTD. Hold\nUndecided\nResult Pending\nUnder Settlement\nHold Key\n";

      expect(result).toEqual(expected);
    });

    it('should return empty tooltip when all status are not marked', () => {
      const remark = new Remark();

      const result = component.getRemarkStatusTooltip(remark);

      expect(result).toEqual('');
    });
  });

  describe('moveTickets', () => {
    it('should refresh page when successfully move tickets', fakeAsync(() => {
        match.remark = new Remark();
        match.newEventStatus = "Running";
        spyOn(moveTicketsService, 'getChildMatches').and.returnValue(of([]));
        spyOn(moveTicketsService, 'moveTickets').and.returnValue(of(successfulResult));
        spyOn(component.refreshAction, 'emit');
        spyOn(messageBoxService, 'alert');

        component.moveTickets(match);
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(component.refreshAction.emit).toHaveBeenCalled();
        expect(messageBoxService.alert).toHaveBeenCalledTimes(0);
    }));

    it('should refresh page and alert when move tickets not successfully', fakeAsync(() => {
        match.remark = new Remark();
        match.newEventStatus = "Running";
        spyOn(moveTicketsService, 'getChildMatches').and.returnValue(of([]));
        spyOn(moveTicketsService, 'moveTickets').and.returnValue(of(unsuccessfulResult));
        spyOn(component.refreshAction, 'emit');
        spyOn(messageBoxService, 'alert');

        component.moveTickets(match);
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(component.refreshAction.emit).toHaveBeenCalled();
        expect(messageBoxService.alert).toHaveBeenCalled();
    }));
  });

  describe('calculateMPMovedTickets', () => {
      it('should alert when there is no child match', fakeAsync(() => {
        spyOn(moveTicketsService, 'getChildMatches').and.returnValue(of([]));
        spyOn(messageBoxService, 'alert');

        component.calculateMPMovedTickets(match);
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(messageBoxService.alert).toHaveBeenCalled();
      }));

      it('should alert when match is on hold', fakeAsync(() => {
        match.remark = new Remark();
        match.remark.isKeyHold = true;
        spyOn(moveTicketsService, 'getChildMatches').and.returnValue(of([new ChildMatch()]));
        spyOn(messageBoxService, 'alert');

        component.calculateMPMovedTickets(match);
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(messageBoxService.alert).toHaveBeenCalled();
      }));

      it('should refresh page when successfully calculate mp', fakeAsync(() => {
        match.remark = new Remark();
        spyOn(moveTicketsService, 'getChildMatches').and.returnValue(of([new ChildMatch()]));
        spyOn(moveTicketsService, 'calculateMP').and.returnValue(of(successfulResult));
        spyOn(component.refreshAction, 'emit');
        spyOn(messageBoxService, 'alert');

        component.calculateMPMovedTickets(match);
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(component.refreshAction.emit).toHaveBeenCalled();
        expect(messageBoxService.alert).toHaveBeenCalledTimes(0);
      }));

      it('should refresh page and alert when calculate mp not successfully', fakeAsync(() => {
        spyOn(moveTicketsService, 'getChildMatches').and.returnValue(of([new ChildMatch()]));
        spyOn(moveTicketsService, 'calculateMP').and.returnValue(of(unsuccessfulResult));
        spyOn(component.refreshAction, 'emit');
        spyOn(messageBoxService, 'alert');

        component.calculateMPMovedTickets(match);
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(component.refreshAction.emit).toHaveBeenCalled();
        expect(messageBoxService.alert).toHaveBeenCalled();
      }));
  });
});
