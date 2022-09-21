import {
  MultiSport,
  PopupProperties,
} from "../models";
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService } from "../../shared/services";
import { TestBed, getTestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { EventStatus } from "../constants";
import { PopupService } from "./popup.service";
import { MaterialModule } from "../../shared/material-module";
import { of } from "rxjs";
import { HandleActionsService } from "./handle-actions.service";
import { MultiSportService } from "./multi-sport.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { LeagueMatch, Match, MixParlay, SportMatch } from "../../shared/models";
import { CalculationStatus, SportType } from "../../shared/constants";
import { Permission } from "../../shared/models/sportsbook-sop/permission.model";

describe("MultiSport - PopupService", () => {
  let injector: TestBed;
  let popupService: PopupService;
  let dialogBoxService: DialogBoxService;
  let handleActionsService: HandleActionsService;
  const match = new Match();
  match.mixParlay = new MixParlay();

  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [match],
    name: "mock league",
    collapse: false,
    isCheckedCalcMP: false,
    disableCheckCalcMP: false,
    isMergedParlay: true
  };

  const sport: SportMatch = {
    id: SportType.badminton,
    name: "mock sport",
    leagues: [league],
    collapse: false,
  };

  let listSport = [sport];
  const multiSport: MultiSport = {
    sports: listSport,
    permission: new Permission(),
    isCheckedCalcMP: false,
  };

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

    injector = getTestBed();
    dialogBoxService = TestBed.inject(DialogBoxService);
    popupService = TestBed.inject(PopupService);
    handleActionsService = TestBed.inject(HandleActionsService);
  });

  it("should be created", () => {
    expect(popupService).toBeTruthy();
  });

  describe("popupCalc", () => {
    beforeAll(() => {
      listSport = [sport];
    });

    it("should call dialogBoxService when called", () => {
      spyOn(dialogBoxService, "popup");
      popupService.popupLog("", "", "");
      expect(dialogBoxService.popup).toHaveBeenCalled();
    });

    it("should call openAndHandlePopup when called", () => {
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupCalc(match, listSport, multiSport);

      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list new sport.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      match.sportType = SportType.tennis;
      mockSport.id = SportType.tennis;
      listSport = [mockSport];
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupCalc(match, listSport, multiSport);

      const srcExpected = `sportsbook/tennis/calculation?matchId=${match.matchId}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list other sport.", () => {
      match.sportType = 10000;
      listSport = [sport];
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupCalc(match, listSport, multiSport);

      const srcExpected = `sportsbook/other-sports/calculation?matchId=${match.matchId}&sportType=${match.sportType}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });
  });

  describe("popupRefund", () => {
    it("should call openAndHandlePopup", () => {
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupRefund(match, listSport, multiSport);

      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list new sport.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      mockSport.id = SportType.tennis;
      match.sportType = SportType.tennis;
      listSport = [mockSport];
      spyOn(popupService, "openAndHandlePopup");

      popupService.popupRefund(match, listSport, multiSport);

      const srcExpected = `sportsbook/tennis/Refund?matchId=${match.matchId}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });

    it("should call dialog with right link when sportType in list other sport.", () => {
      match.sportType = 10000;
      listSport = [sport];
      spyOn(popupService, "openAndHandlePopup");

      popupService.popupRefund(match, listSport, multiSport);
      const srcExpected = `sportsbook/other-sports/refund?matchId=${match.matchId}&sportType=${match.sportType}`;
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
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupEarly(match, listSport, multiSport);

      const widthExpected = '1480px';
      expect(popupService.properties.width).toEqual(widthExpected);
    });

    it("should return width = 845px when sportType is not esports.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      mockSport.id = SportType.tennis;
      match.sportType = SportType.tennis;
      listSport = [mockSport];
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupEarly(match, listSport, multiSport);

      const widthExpected = '845px';
      expect(popupService.properties.width).toEqual(widthExpected);
    });

    it("should call func openAndHandlePopup with right value by sportType.", () => {
      const mockSport = new SportMatch();
      mockSport.name = "tennis";
      mockSport.id = SportType.tennis;
      match.sportType = SportType.tennis;
      listSport = [mockSport];
      spyOn(popupService, "openAndHandlePopup");
      popupService.popupEarly(match, listSport, multiSport);

      const srcExpected = `sportsbook/tennis/early-settlement?matchId=${match.matchId}`;
      expect(popupService.properties.src).toEqual(srcExpected);
      expect(popupService.openAndHandlePopup).toHaveBeenCalled();
    });
  });

  describe("openAndHandlePopup", () => {
    it("should call dialogBoxService.", () => {
      const properties = new PopupProperties();
      spyOn(dialogBoxService, "popup").and.returnValue(of(false));

      popupService.openAndHandlePopup(properties, match, listSport, multiSport);

      expect(dialogBoxService.popup).toHaveBeenCalled();
    });

    it("should call handleChangedMatch when dialogBoxService return true.", () => {
      const properties = new PopupProperties();
      spyOn(dialogBoxService, "popup").and.returnValue(of(true));
      spyOn(popupService, "handleChangedMatch");

      popupService.openAndHandlePopup(properties, match, listSport, multiSport);
      expect(popupService.handleChangedMatch).toHaveBeenCalled();
    });
  });

  it("handleChangedMatch", () => {
    spyOn(handleActionsService, "resetCheckboxCalcMixParlay");

    popupService.handleChangedMatch(match, listSport, multiSport);

    expect(match.isCalculatingSingle).toEqual(CalculationStatus.waiting);
    expect(match.showLink).toEqual(false);
    expect(match.newEventStatus).toEqual(EventStatus.waiting);
    expect(match.isCheckedCalcMP).toEqual(false);
    expect(handleActionsService.resetCheckboxCalcMixParlay).toHaveBeenCalled();
  });
});
