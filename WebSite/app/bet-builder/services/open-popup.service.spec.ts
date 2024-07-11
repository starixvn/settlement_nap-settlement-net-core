import {
  MatchDetail
} from "../models";
import { BlockUIService, DialogBoxService } from "../../shared/services";
import { TestBed, getTestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { EventStatus} from "../constants";
import { PopupService } from "./";
import { MaterialModule } from "../../shared/material-module";
import { of } from "rxjs";

describe("MultiSport - PopupService", () => {
  let injector: TestBed;
  let popupService: PopupService;
  let dialogBoxService: DialogBoxService;
  const match = new MatchDetail();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      providers: [
        PopupService,
        BlockUIService,
        DialogBoxService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    injector = getTestBed();
    dialogBoxService = TestBed.inject(DialogBoxService);
    popupService = TestBed.inject(PopupService);
  });

  it("should be created", () => {
    expect(popupService).toBeTruthy();
  });

  it("popupLog - should call dialogBoxService when called", () => {
    jest.spyOn(dialogBoxService, "popup");

    popupService.popupLog(0, "", "");

    expect(dialogBoxService.popup).toHaveBeenCalled();
  });

  describe("popupCalc", () => {

    it("should call dialogBoxService when called", () => {
      jest.spyOn(dialogBoxService, "popup").mockReturnValue(of(true));

      popupService.popupCalc(match);

      expect(dialogBoxService.popup).toHaveBeenCalled();
    });

    it("should change match when close popup by calc", () => {
      jest.spyOn(dialogBoxService, "popup").mockReturnValue(of(true));

      popupService.popupCalc(match);

      expect(match.parlayStatus).toEqual(EventStatus.waiting);
      expect(match.isShowLink).toBe(false);
    });
  });
});
