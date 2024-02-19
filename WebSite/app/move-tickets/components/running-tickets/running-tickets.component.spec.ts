import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Match } from "../../models";
import { of } from "rxjs";
import { ModalContentDialogComponent, ModalDialogComponent } from "../../../shared/components";
import { MaterialModule } from "../../../shared/material-module";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { MoveTicketsTemplateModule } from "../move-tickets-template.module";
import { MoveRunningTicketsService } from "./move-running-tickets.service";
import { RunningTicketsComponent } from "./running-tickets.component";
import { DatePipe } from "@angular/common";

describe('MoveTickets - RunningTicketsComponent', () => {
  let component: RunningTicketsComponent;
  let fixture: ComponentFixture<RunningTicketsComponent>;
  let messageBoxService: MessageBoxService;
  let moveRunningTicketsService: MoveRunningTicketsService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";

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
          RunningTicketsComponent,
          ModalDialogComponent,
          ModalContentDialogComponent,
      ],
      providers: [
          NgbModal,
          HttpRequestService,
          BlockUIService,
          MessageBoxService,
          MoveRunningTicketsService,
          DatePipe,
      ],
      imports: [
          FormsModule,
          HttpClientModule,
          NgbModule,
          MaterialModule,
          MoveTicketsTemplateModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createComponent(RunningTicketsComponent);
      component = fixture.componentInstance;
      messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
      moveRunningTicketsService = fixture.debugElement.injector.get(MoveRunningTicketsService);
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });

  describe('isCheckMatchesButtonDisabled', () => {
    it('should return true when 1 matchId is empty', () => {
      const actual = component.isCheckMatchesButtonDisabled();

      expect(actual).toBe(true);
    });

    it('should return false when both matchIds existed', () => {
      component.sourceMatchId = '12345';
      component.targetMatchId = '54321';

      const actual = component.isCheckMatchesButtonDisabled();

      expect(actual).toBe(false);
    });
  });

  describe('isMoveButtonDisabled', () => {
    it('should return true when match not ready to move', () => {
      component.isMatchReadyToMove = false;

      const actual = component.isMoveButtonDisabled();

      expect(actual).toBe(true);
    });

    it('should return false when match ready to move', () => {
      component.isMatchReadyToMove = true;

      const actual = component.isMoveButtonDisabled();

      expect(actual).toBe(false);
    });
  });

  it('changeSourceMatch - should set match changed flag and match ready to move', () => {
    component.changeSourceMatch();

    expect(component.isSourceMatchChanged).toBe(true);
    expect(component.isMatchReadyToMove).toBe(false);
  });

  it('changeTargetMatch - should set match changed flag and match ready to move', () => {
    component.changeTargetMatch();

    expect(component.isTargetMatchChanged).toBe(true);
    expect(component.isMatchReadyToMove).toBe(false);
  });

  describe('checkMatches', () => {
    it('should alert when source Id equal target Id', () => {
      spyOn(messageBoxService,'alert');
      component.sourceMatchId = '12345';
      component.targetMatchId = '12345';

      component.checkMatches();

      expect(messageBoxService.alert).toHaveBeenCalled();
    });

    // it('should alert when fail to validate matches', fakeAsync(() => {
    //   spyOn(moveRunningTicketsService, 'validateMatches').and.returnValue(of(unsuccessfulResult));
    //   spyOn(messageBoxService, 'alert');
    //   component.sourceMatchId = '12345';
    //   component.targetMatchId = '54321';

    //   component.checkMatches();

    //   expect(messageBoxService.alert).toHaveBeenCalled();
    // }));

    // it('should get and set source match, target match when validate successfully', fakeAsync(() => {
    //   const source = new Match();
    //   source.matchId = 12345;
    //   const target = new Match();
    //   target.matchId = 54321;
    //   component.sourceMatchId = '12345';
    //   component.targetMatchId = '54321';
    //   const matches = [source, target];
    //   spyOn(moveRunningTicketsService, 'validateMatches').and.returnValue(of(successfulResult));
    //   spyOn(moveRunningTicketsService, 'getMoveTicketsMatches').and.returnValue(of(matches));

    //   component.checkMatches();

    //   expect(component.sourceMatch).toEqual(source);
    //   expect(component.targetMatch).toEqual(target);
    // }));
  });

  describe('moveTickets', () => {
    it('should inform success when move tickets successfully', fakeAsync(() => {
      spyOn(moveRunningTicketsService, 'moveRunningTickets').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'alert');
      component.sourceMatchId = '12345';
      component.targetMatchId = '54321';

      component.moveTickets();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.dialogMessage.message).toEqual("Moved running tickets successfully");
      expect(messageBoxService.alert).toHaveBeenCalled();
    }));

    it('should alert when fail to move tickets', fakeAsync(() => {
      spyOn(moveRunningTicketsService, 'moveRunningTickets').and.returnValue(of(unsuccessfulResult));
      spyOn(messageBoxService, 'alert');
      component.sourceMatchId = '12345';
      component.targetMatchId = '54321';

      component.moveTickets();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.dialogMessage.message).toEqual("Error message");
      expect(messageBoxService.alert).toHaveBeenCalled();
    }))
  })
});