import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GoalHistoryComponent } from "./goal-history.component";
import { GoalRecord } from "./models/match.model";

describe('GoalHistoryComponent', () => {
    let component: GoalHistoryComponent;
    let fixture: ComponentFixture<GoalHistoryComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [
                GoalHistoryComponent
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('halfTimeGoalRecords - should return goal record before semicolon', () => {
        component.goalRecord = "HA;"
        const firstGoalRecord = new GoalRecord("Home", 1, 0);
        const secondGoalRecord = new GoalRecord("Away", 1, 1);

        const actual = component.halfTimeGoalRecords;

        expect(actual.length).toEqual(2);
        expect(actual[0]).toEqual(firstGoalRecord);
        expect(actual[1]).toEqual(secondGoalRecord);
    });

    it('fullTimeGoalRecords - should return all goal record ', () => {
        component.goalRecord = "H;A"
        const firstGoalRecord = new GoalRecord("Home", 1, 0);
        const secondGoalRecord = new GoalRecord("Away", 1, 1);

        const actual = component.fullTimeGoalRecords;

        expect(actual.length).toEqual(2);
        expect(actual[0]).toEqual(firstGoalRecord);
        expect(actual[1]).toEqual(secondGoalRecord);
    });

    it('isExistHalfTimeGoalRecord - should return true when goal record half time not empty', () => {
        component.goalRecord = "A;";
        const actual = component.isExistHalfTimeGoalRecord();

        expect(actual).toBeTruthy();
    });

    describe('isExistGoalRecord', () => {
        it('should return false when goal record is null', () => {
            component.goalRecord = null;
            const actual = component.isExistGoalRecord();

            expect(actual).toBeFalsy();
        });
        it('should return false when goal record is empty', () => {
            component.goalRecord = "";
            const actual = component.isExistGoalRecord();

            expect(actual).toBeFalsy();
        });
        it('should return false when goal record is equal semicolon', () => {
            component.goalRecord = ";";
            const actual = component.isExistGoalRecord();
            expect(actual).toBeFalsy();
        });

        it('should return true when goal record is valid', () => {
            component.goalRecord = "H;";
            const actual = component.isExistGoalRecord();
            expect(actual).toBeTruthy();
        });
    });
});