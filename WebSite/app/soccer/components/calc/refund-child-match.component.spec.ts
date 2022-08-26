import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BackgroundColor } from "../../../shared/constants";
import { RefundChildMatchComponent } from ".";
import { ChildMatch } from "./models/match.model";

describe('GoalHistoryComponent', () => {
    let component: RefundChildMatchComponent;
    let fixture: ComponentFixture<RefundChildMatchComponent>;

    const childMatch: ChildMatch = {
        matchId: 1,
        matchCode: '',
        isExistMarkedTicket: false,
        isExistRunningTicket: false,
        isRefund: '',
        eventStatus: '',
        eventStatusColor: '',
        betStatus: '',
        checked: true,
        isPending: false,
        homeName: 'home',
        awayName: 'away',
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule,
                FormsModule],
            declarations: [
                RefundChildMatchComponent
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RefundChildMatchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('collapse - should change collapse status when call function', () => {
        component.collapsed = false;

        component.collapse();

        expect(component.collapsed).toBeTruthy();
    });

    describe('getColor', () => {
        it('return yellow Blinking when event status equal postponed and exist marked ticket', () => {
            childMatch.eventStatus = 'Postponed';
            childMatch.isExistMarkedTicket = true;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.yellowBlinking);
        });

        it('return yellow when event status equal postponed and not exist marked ticket', () => {
            childMatch.eventStatus = 'Postponed';
            childMatch.isExistMarkedTicket = false;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.yellow);
        });

        it('return white blinking when event status equal completed, exist marked ticket and not exist running ticket', () => {
            childMatch.eventStatus = 'completed';
            childMatch.isExistMarkedTicket = true;
            childMatch.isExistRunningTicket = false;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.whiteBlinking);
        });

        it('return pink blinking when event status equal completed, exist marked ticket and exist running ticket', () => {
            childMatch.eventStatus = 'completed';
            childMatch.isExistMarkedTicket = true;
            childMatch.isExistRunningTicket = true;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.runningTicketBlinking);
        });

        it('return pink when event status equal completed, not exist marked ticket and exist running ticket', () => {
            childMatch.eventStatus = 'completed';
            childMatch.isExistMarkedTicket = false;
            childMatch.isExistRunningTicket = true;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.pink);
        });

        it('return empty when event status equal completed, not exist marked ticket and not exist running ticket', () => {
            childMatch.eventStatus = 'completed';
            childMatch.isExistMarkedTicket = false;
            childMatch.isExistRunningTicket = false;

            const result = component.getColor(childMatch);

            expect(result).toEqual("");
        });

        it('return bright yellow blinking when match pending and exist marked ticket', () => {
            childMatch.eventStatus = 'Result Pending';
            childMatch.isExistMarkedTicket = true;
            childMatch.isPending = true;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.brightYellowBlinking);
        });

        it('return bright yellow when match pending and not exist marked ticket', () => {
            childMatch.eventStatus = 'Result Pending';
            childMatch.isExistMarkedTicket = false;
            childMatch.isPending = true;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.brightYellow);
        });

        it('return white blinking when not exist marked ticket', () => {
            childMatch.eventStatus = 'Running';
            childMatch.isExistMarkedTicket = true;

            const result = component.getColor(childMatch);

            expect(result).toEqual(BackgroundColor.whiteBlinking);
        });
    });
});