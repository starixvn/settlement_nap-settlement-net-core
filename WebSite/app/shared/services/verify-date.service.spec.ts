import { TestBed } from '@angular/core/testing';
import { VerifyDateService } from './verify-date.service';
import { DatePipe } from '@angular/common';

describe('BetBuilder - Verify Filter Sevice', () => {
  let service: VerifyDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VerifyDateService, DatePipe]
    });
    service = TestBed.inject(VerifyDateService);
  });

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected date', () => {
    const date = "2019-03-15";
    const result = service.convertToDateStruct(date);
    expect(result).toBeDefined();
  });

  it('should return date format', () => {
    const date = { year: 2019, month: 3, day: 15 };
    const result = service.dateFormat(date);
    expect(result).toBeDefined();
  });

  it('should return true when todate greater than fromdate', () => {
    const fromDate = { year: 2019, month: 3, day: 15 };
    const toDate = { year: 2019, month: 3, day: 16 };
    const result = service.validDate(fromDate, toDate);
    expect(result).toBe(true);
  });
});