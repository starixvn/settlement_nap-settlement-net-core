import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { BallsComponent } from './index';

describe('Balls - Filter Component', () => {
    let component: BallsComponent;
    let fixture: ComponentFixture<BallsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                BallsComponent,
            ],
            providers: [],
            imports: [],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(BallsComponent);
                component = fixture.componentInstance;
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should red when ball number include RedBall list', () => {
        expect(component.getColorBall("1")).toEqual("red");
        expect(component.getColorBall("3")).toEqual("red");
        expect(component.getColorBall("4")).toEqual("red");
        expect(component.getColorBall("6")).toEqual("red");
        expect(component.getColorBall("8")).toEqual("red");
        expect(component.getColorBall("10")).toEqual("red");
        expect(component.getColorBall("12")).toEqual("red");
        expect(component.getColorBall("15")).toEqual("red");
        expect(component.getColorBall("17")).toEqual("red");
        expect(component.getColorBall("20")).toEqual("red");
        expect(component.getColorBall("21")).toEqual("red");
        expect(component.getColorBall("23")).toEqual("red");
        expect(component.getColorBall("26")).toEqual("red");
        expect(component.getColorBall("29")).toEqual("red");
        expect(component.getColorBall("31")).toEqual("red");
        expect(component.getColorBall("33")).toEqual("red");
        expect(component.getColorBall("34")).toEqual("red");
        expect(component.getColorBall("35")).toEqual("red");
        expect(component.getColorBall("38")).toEqual("red");
        expect(component.getColorBall("40")).toEqual("red");
        expect(component.getColorBall("42")).toEqual("red");
        expect(component.getColorBall("44")).toEqual("red");
        expect(component.getColorBall("45")).toEqual("red");
        expect(component.getColorBall("47")).toEqual("red");
        expect(component.getColorBall("49")).toEqual("red");
        expect(component.getColorBall("51")).toEqual("red");
        expect(component.getColorBall("53")).toEqual("red");
        expect(component.getColorBall("56")).toEqual("red");
        expect(component.getColorBall("58")).toEqual("red");
        expect(component.getColorBall("59")).toEqual("red");
        expect(component.getColorBall("62")).toEqual("red");
        expect(component.getColorBall("65")).toEqual("red");
        expect(component.getColorBall("67")).toEqual("red");
        expect(component.getColorBall("70")).toEqual("red");
        expect(component.getColorBall("71")).toEqual("red");
        expect(component.getColorBall("73")).toEqual("red");
        expect(component.getColorBall("74")).toEqual("red");

    });

    it('should blue when ball number exclude RedBall list', () => {
        expect(component.getColorBall("2")).toEqual("blue");
    });

    it('should blue when ball number exclude RedBall list', () => {
        component.number = "1,2,3,4,5,6";
        component.ngOnChanges();
        const expected = ["1", "2", "3", "4", "5", "6"];
        expect(component.balls).toEqual(expected);
    });
});
