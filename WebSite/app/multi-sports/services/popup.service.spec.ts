import {
  AutoCalcSetting,
  LeagueMatch,
  Match,
  PopupProperties,
  SportMatch,
} from "../models";
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService } from "../../shared/services";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { EventStatus } from "../constants";
import { PopupService } from "./popup.service";
import { MaterialModule } from "../../shared/material-module";
import { HandleActionsService } from "./handle-actions.service";
import { MultiSportService } from "./multi-sport.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { CalculationStatus, SportType } from "../../shared/constants";
import { AutoSetting } from "../../shared/models";
import { of } from "rxjs";

describe("MultiSport - PopupService", () => {
  let popupService: PopupService;
  let dialogBoxService: DialogBoxService;
  let multiSportService: MultiSportService;
  const match = new Match();

  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [match],
    name: "mock league",
    collapse: false,
    autoWaitingTime: 0,
    autoCalcSetting: new AutoSetting()
  };

  const sport: SportMatch = {
    id: SportType.badminton,
    name: "mock sport",
    leagues: [league],
    collapse: false,
  };

  let listSport = [sport];

  let autoSetting = new AutoCalcSetting();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      providers: [
        PopupService,
        BlockUIService,
        DialogBoxService,
        HandleActionsService,
        MultiSportService,
        HttpRequestService,
        HttpClient,
        HttpHandler,
        MessageBoxService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    dialogBoxService = TestBed.inject(DialogBoxService);
    popupService = TestBed.inject(PopupService);
    multiSportService = TestBed.inject(MultiSportService);
  });

  it("should be created", () => {
    expect(popupService).toBeTruthy();
  });

  describe("popupCalc", () => {
    beforeAll(() => {
      listSport = [sport];
    });

    it("should call dialogBoxService when called", () => {
      dialogBoxService.popup = jest.fn();
      popupService.popupLog("", "", "");
      expect(dialogBoxService.popup).toHaveBeenCalled();
    });

    it("should call openAndHandlePopup when called", () => {
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupCalc(match, listSport);

      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list new sport.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      match.sportType = SportType.tennis;
      match.matchId = "123";
      mockSport.id = SportType.tennis;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupCalc(match, listSport);

      const srcExpected = `apps/tennis-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call badminton dialog when sportType is Volleyball", () => {
      const mockSport = new SportMatch();
      mockSport.name = "volleyball";
      match.sportType = SportType.volleyBall;
      match.matchId = "123";
      mockSport.id = SportType.volleyBall;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupCalc(match, listSport);

      const srcExpected = `apps/badminton-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list other sport.", () => {
      match.sportType = 10000;
      listSport = [sport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupCalc(match, listSport);

      const srcExpected = `apps/other-sports-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });
  });

  describe("popupRefund", () => {
    it("should call openAndHandlePopup", () => {
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupRefund(match, listSport);

      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list new sport.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      mockSport.id = SportType.tennis;
      match.sportType = SportType.tennis;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();

      popupService.popupRefund(match, listSport);

      const srcExpected = `apps/tennis-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call badminton dialog when sportType is Volleyball", () => {
      const mockSport = new SportMatch();
      mockSport.name = "volleyball";
      match.sportType = SportType.volleyBall;
      match.matchId = "123";
      mockSport.id = SportType.volleyBall;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupRefund(match, listSport);

      const srcExpected = `apps/badminton-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list other sport.", () => {
      match.sportType = 10000;
      listSport = [sport];
      popupService.openAndHandlePopup = jest.fn();

      popupService.popupRefund(match, listSport);
      const srcExpected = `apps/other-sports-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });
  });

  describe("popupEarly", () => {
    it("should return width = 1424px when sportType is esports.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "E-Sports";
      mockSport.id = SportType.eSports;
      match.sportType = SportType.eSports;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupEarly(match, listSport);

      const widthExpected = '1480px';
      expect(popupService.properties.width).toEqual(widthExpected);
    });

    it("should return width = 845px when sportType is not esports.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      mockSport.id = SportType.tennis;
      match.sportType = SportType.tennis;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupEarly(match, listSport);

      const widthExpected = '845px';
      expect(popupService.properties.width).toEqual(widthExpected);
    });

    it("should call func openAndHandlePopup with right value by sportType.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      mockSport.id = SportType.tennis;
      match.sportType = SportType.tennis;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupEarly(match, listSport);

      const srcExpected = `apps/tennis-early?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call badminton dialog when sportType is Volleyball", () => {
      const mockSport = new SportMatch();
      mockSport.name = "volleyball";
      mockSport.id = SportType.volleyBall;
      match.sportType = SportType.volleyBall;
      listSport = [mockSport];
      popupService.openAndHandlePopup = jest.fn();
      popupService.popupEarly(match, listSport);

      const srcExpected = `apps/badminton-early?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });
  });

  describe("openAndHandlePopup", () => {
    it("should call dialogBoxService.", () => {
      const properties = new PopupProperties();
      dialogBoxService.popup = jest.fn().mockReturnValue(of(false));

      popupService.openAndHandlePopup(properties, match);

      expect(dialogBoxService.popup).toHaveBeenCalled();
    });

    it("should call handleChangedMatch when dialogBoxService return true.", () => {
      const properties = new PopupProperties();
      dialogBoxService.popup = jest.fn().mockReturnValue(of(true));
      popupService.handleChangedMatch = jest.fn();

      popupService.openAndHandlePopup(properties, match);
      expect(popupService.handleChangedMatch).toHaveBeenCalled();
    });
  });

  it("handleChangedMatch", () => {
    popupService.handleChangedMatch(match);

    expect(match.isCalculatingSingle).toEqual(CalculationStatus.waiting);
    expect(match.showLink).toEqual(false);
    expect(match.newEventStatus).toEqual(EventStatus.waiting);
  });

  describe('openUpdatePayoutForMatch', () => {
    beforeEach(() => {
      match.autoCalcSetting = new AutoSetting();
    });
    it('should open popup and change value match after submit', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of('00001'));

      popupService.openUpdatePayoutForMatch(match);
      tick();

      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeFalsy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeTruthy();
    }));

    it('should change value equal latest value even not submit', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      autoSetting.setting = "00001";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of(null));

      popupService.openUpdatePayoutForMatch(match);
      tick();

      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeFalsy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeTruthy();
    }));

    it('Match should not change when close popup without submit', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of(null));

      popupService.openUpdatePayoutForMatch(match);
      tick();

      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeTruthy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeFalsy();
    }));
  });

  describe('openUpdatePayoutForLeague', () => {
    beforeEach(() => {
      match.autoCalcSetting = new AutoSetting();
      league.autoCalcSetting = new AutoSetting();
    });
    it('should change value League match after submit with eventStatus match is Running', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.eventStatus = EventStatus.running;
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = false;
      match.autoCalcSetting.matchSetting = '1';
      league.autoCalcSetting.isAutoPayoutForLeague = true;
      league.matches = [match];
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of('00001,true'));

      popupService.openUpdatePayoutForLeague(league);
      tick();

      expect(league.autoCalcSetting.isAutoPayoutForLeague).toBeFalsy();
      expect(league.autoCalcSetting.isDirectPayoutForLeague).toBeTruthy();
      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeFalsy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeTruthy();
      expect(match.autoCalcSetting.matchSetting).toEqual("00001");
    }));

    it('should change value League match after submit with eventStatus match is closed', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.eventStatus = EventStatus.running;
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = false;
      match.autoCalcSetting.matchSetting = '1';
      league.autoCalcSetting.isAutoPayoutForLeague = true;
      league.matches = [match];
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of('00001,true'));

      popupService.openUpdatePayoutForLeague(league);
      tick();

      expect(league.autoCalcSetting.isAutoPayoutForLeague).toBeFalsy();
      expect(league.autoCalcSetting.isDirectPayoutForLeague).toBeTruthy();
      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeFalsy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeTruthy();
      expect(match.autoCalcSetting.matchSetting).toEqual("00001");
    }));

    it('should change value League match after submit with eventStatus match is calculated', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.eventStatus = EventStatus.completed;
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = false;
      match.autoCalcSetting.matchSetting = '1';
      league.autoCalcSetting.isAutoPayoutForLeague = true;
      league.matches = [match];
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of('00001,true'));

      popupService.openUpdatePayoutForLeague(league);
      tick();

      expect(league.autoCalcSetting.isAutoPayoutForLeague).toBeFalsy();
      expect(league.autoCalcSetting.isDirectPayoutForLeague).toBeTruthy();
      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeTruthy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeFalsy();
      expect(match.autoCalcSetting.matchSetting).toEqual("1");
    }));

    it('Only change value League match after submit when request not apply all match', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      league.autoCalcSetting.isAutoPayoutForLeague = true;
      league.matches = [match];
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of('00001, false'));

      popupService.openUpdatePayoutForLeague(league);
      tick();

      expect(league.autoCalcSetting.isAutoPayoutForLeague).toBeFalsy();
      expect(league.autoCalcSetting.isDirectPayoutForLeague).toBeTruthy();
      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeTruthy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeFalsy();
    }));

    it('should change value equal latest value even not submit', fakeAsync(() => {
      league.autoCalcSetting.isAutoPayoutForLeague = true;
      autoSetting.setting = "00001";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of(null));

      popupService.openUpdatePayoutForLeague(league);
      tick();

      expect(league.autoCalcSetting.isAutoPayoutForLeague).toBeFalsy();
      expect(league.autoCalcSetting.isDirectPayoutForLeague).toBeTruthy();
    }));

    it('league should not change when close popup without submit', fakeAsync(() => {
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      league.autoCalcSetting.isAutoPayoutForLeague = true;
      league.matches = [match];
      autoSetting.setting = "1";
      multiSportService.getSetting = jest.fn().mockReturnValue(Promise.resolve(autoSetting));
      dialogBoxService.popupHasResponse = jest.fn().mockReturnValue(of(null));

      popupService.openUpdatePayoutForLeague(league);
      tick();

      expect(match.autoCalcSetting.isAutoPayoutForMatch).toBeTruthy();
      expect(match.autoCalcSetting.isDirectPayoutForMatch).toBeFalsy();
      expect(league.autoCalcSetting.isAutoPayoutForLeague).toBeTruthy();
      expect(league.autoCalcSetting.isDirectPayoutForLeague).toBeFalsy();
    }));
  });
});
