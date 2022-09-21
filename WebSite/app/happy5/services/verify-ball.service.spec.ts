import { TestBed, inject } from '@angular/core/testing';
import { VerifyBallService } from './verify-ball.service';
import { Ball } from '../models';

describe('VerifyBallService', () => {
  let service: VerifyBallService = null;
  const balls: Ball[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          VerifyBallService,
        ],
        imports: [],
    });

    service = TestBed.inject(VerifyBallService);
  });

  beforeEach(inject([VerifyBallService], (verifyBallService: VerifyBallService) => {
      service = verifyBallService;
  }));

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('emptyBall - should return ball when have input empty numberBall', () => {
    balls.push(new Ball(12345, 1, null));
    const result = service.emptyBall(balls);

    expect(result).not.toBeNull();
  });

  describe('outOfRangeBall', () => {
    it('should return ball when input ball > 20', () => {
      balls.push(new Ball(12345, 1, 21));
      const result = service.outOfRangeBall(balls);

      expect(result).not.toBeNull();
    });

    it('should return ball when input ball < 1', () => {
      balls.push(new Ball(12345, 1, 0));
      const result = service.outOfRangeBall(balls);

      expect(result).not.toBeNull();
    });
  });

  it('isDuplicateBall - should return true when input balls are duplicated', () => {
    balls.push(new Ball(12345, 1, 12));
    balls.push(new Ball(12345, 1, 12));
    const result = service.isDuplicateBall(balls);

    expect(result).toBe(true);
  });
});