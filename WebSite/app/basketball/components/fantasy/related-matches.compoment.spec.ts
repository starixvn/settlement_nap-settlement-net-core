import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RelatedMatchesComponent } from "./related-matches.compoment";
import { ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ScoreBySettlementPipe } from "../../../shared/pipes/score-by-settlement.pipe";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { VerificationFantasyMatchService } from "../../services/verification-fantasy-match.service";
import { FantasyScoreService } from "../../services/fantasy-score.service";
import { MessageBoxService } from "../../../shared/services/message-box.service.native";

describe("RelatedMatchesComponent", () => {
  let component: RelatedMatchesComponent;
  let fixture: ComponentFixture<RelatedMatchesComponent>;
  let elementRef: ElementRef<HTMLElement>;
  let verificationFantasyMatchService: VerificationFantasyMatchService;
  let fantasyScoreService:  FantasyScoreService;
  let messageBoxService: MessageBoxService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ScoreBySettlementPipe],
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RelatedMatchesComponent);
        component = fixture.componentInstance;
        elementRef = fixture.debugElement.injector.get(ElementRef);
        verificationFantasyMatchService = fixture.debugElement.injector.get(VerificationFantasyMatchService);
        fantasyScoreService = fixture.debugElement.injector.get(FantasyScoreService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);

      });
  });

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });
});
