import { PositionValuePipe } from './position-value.pipe';
import { ResourceIds } from '../../shared/constants';

describe('PositionValuePipe', () => {
  let pipe: PositionValuePipe;

  beforeEach(() => {
    pipe = new PositionValuePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return mapped value for known position IDs', () => {
    expect(pipe.transform(ResourceIds.extraInning)).toBe('E.I');
    expect(pipe.transform(ResourceIds.fullTime)).toBe('FT');
  });

  it('should return parsed number for positions starting with "010"', () => {
    expect(pipe.transform('0101')).toBe('1');
    expect(pipe.transform('01042')).toBe('42');
  });

  it('should return original string for unknown positions', () => {
    expect(pipe.transform('unknown')).toBe('unknown');
    expect(pipe.transform('123')).toBe('123');
  });

  it('should append otherInfo when provided', () => {
    expect(pipe.transform(ResourceIds.extraInning, ' (test)')).toBe('E.I (test)');
    expect(pipe.transform('0101', ' (test)')).toBe('1 (test)');
    expect(pipe.transform('unknown', ' (test)')).toBe('unknown (test)');
  });
}); 