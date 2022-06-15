import { TestBed, inject } from '@angular/core/testing';
import { BallService } from './ball.service';
import { Ball } from '../models';

describe('VerifyBallService', () => {
  let service: BallService = null;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
            BallService,
            ],
            imports: [],
        });

        service = TestBed.inject(BallService);
    });

    beforeEach(inject([BallService], (ballService: BallService) => {
        service = ballService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('should returns total ball when match is completed', () => {
        const balls: Ball[] = [];
        balls.push(new Ball(123, 1, 3));
        balls.push(new Ball(123, 2, 5));
        balls.push(new Ball(123, 3, 12));

        expect(service.getTotalBall(balls)).toEqual("20");
    });

    describe("getBigSmall() method", () => {
        it('should returns Small when match is completed and totalBall<53', () => {
            expect(service.getBigSmall(52)).toEqual("S");
        });

        it('should returns Big when match is completed and totalBall>=53', () => {
            expect(service.getBigSmall(53)).toEqual("B");
        });
    });

    describe("getOddEven() method", () => {
        it('should returns Odd when match is completed and totalBall%2 = Odd', () => {
            expect(service.getOddEven(19)).toEqual("O");
        });

        it('should returns Even when match is completed and totalBall%2 = Even', () => {
            expect(service.getOddEven(6)).toEqual("E");
        });
    });

    describe("getMoreOddEven() method", () => {

        it('should returns MO when match is completed and Odd>Even', () => {
            const balls: Ball[] = [];
            balls.push(new Ball(123, 1, 2));
            balls.push(new Ball(123, 2, 5));
            balls.push(new Ball(123, 3, 11));

            expect(service.getMoreOddEven(balls)).toEqual("MO");
        });

        it('should returns ME when match is completed and Odd<Even', () => {
            const balls: Ball[] = [];
            balls.push(new Ball(123, 1, 6));
            balls.push(new Ball(123, 2, 2));
            balls.push(new Ball(123, 3, 3));
            balls.push(new Ball(123, 4, 4));
            balls.push(new Ball(123, 5, 5));
            expect(service.getMoreOddEven(balls)).toEqual("ME");
        });
    });

    describe("getCombo() method", () => {

        it('should returns SO when match is completed and Odd>Even', () => {
            expect(service.getCombo(17)).toEqual("SO");
        });

        it('should returns BE when match is completed and Odd<Even', () => {
            expect(service.getCombo(56)).toEqual("BE");
        });
    });

    describe("getSeasons() method", () => {
        it('should returns Sp when match is completed and 15=<totalBall<=33', () => {
            expect(service.getSeasons(17)).toEqual("Sp");
        });

        it('should returns Su when match is completed and 34=<totalBall<=52', () => {
            expect(service.getSeasons(47)).toEqual("Su");
        });

        it('should returns Au when match is completed and 53=<totalBall<=71', () => {
            expect(service.getSeasons(68)).toEqual("Au");
        });


        it('should returns Wi when match is completed and 72=<totalBall<=90', () => {
            expect(service.getSeasons(83)).toEqual("Wi");
        });

        it('should returns empty when match is completed and totalBall out of range', () => {
            expect(service.getSeasons(92)).toEqual("");
        });
    });
});