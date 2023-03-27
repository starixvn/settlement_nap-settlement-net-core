import { TestBed, getTestBed } from "@angular/core/testing";
import { of } from 'rxjs';
import { PopupService } from "./popup.service";
import { Language } from '../../shared/language.native';
import { MatDialog } from '@angular/material/dialog';
import { ReCalculationModel, Ball, MatchDetail} from '../models';
import { BlockUIService, DialogBoxService } from "../../shared/services";
import { MaterialModule } from "../../shared/material-module";
describe("Popup Service", () => {
    let injector: TestBed;
    let dialogBoxService: DialogBoxService;
    let dialog: MatDialog;
    let popupService: PopupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [MaterialModule],
          providers: [
            PopupService,
            BlockUIService,
            DialogBoxService,
          ]
        });

        injector = getTestBed();
        dialogBoxService = TestBed.inject(DialogBoxService);
        popupService = TestBed.inject(PopupService);
        dialog = TestBed.inject(MatDialog);
      });

    it("should be created", () => {
        expect(popupService).toBeTruthy();
    });

    it("should call Popup function with right dialogData content when called", () => {
        spyOn(dialogBoxService, "popup");
        const matchId = 123;
        const fromDate = "07-09-2020";
        const toDate = "08-09-2020";
        popupService.popupLog(matchId, fromDate, toDate);

        const srcExpected = `/home/log/?matchCode=${matchId}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=NBG`;
        expect(popupService.dialogData.title).toEqual(Language.SettlementLog);
        expect(popupService.dialogData.src).toEqual(srcExpected)
        expect(dialogBoxService.popup).toHaveBeenCalled();
    });

    it('popupReCalc - should call matDialog methods and edit input match', () => {
      const matchDetail = {} as MatchDetail;
      const model = new ReCalculationModel(matchDetail);
      const ball1 = new Ball(1, 1, 2);
      const ball2 = new Ball(1, 2, 3);
      const ball3 = new Ball(1, 3, 4);
      const ball4 = new Ball(1, 4, 6);
      const balls : Ball[] = [ball1, ball2, ball3, ball4];
      const mockDialogRef = {
        afterClosed: () => of(balls)
      };
      spyOn(dialog, 'closeAll');
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);

      popupService.popupReCalc(model);

      expect(dialog.open).toHaveBeenCalled();
      expect(model.matchDetail.number).toEqual("2,3,4,6");
    });
  });