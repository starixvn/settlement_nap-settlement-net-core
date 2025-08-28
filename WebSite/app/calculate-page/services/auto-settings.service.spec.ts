import { TestBed } from '@angular/core/testing';
import { AutoSettingsService } from './auto-settings.service';
import { CalculationMatch, League } from '../models';

describe('AutoSettingsService', () => {
    let service: AutoSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AutoSettingsService]
        });
        service = TestBed.inject(AutoSettingsService);
    });

    describe('mapInstantToBoolean', () => {
        const testCases = [
            { input: '', expected: null, description: 'empty string' },
            { input: '0,1', expected: null, description: 'both values selected' },
            { input: '0', expected: false, description: 'OFF selected' },
            { input: '1', expected: true, description: 'ON selected' },
            { input: '2', expected: null, description: 'unknown value' },
            { input: '1,0', expected: null, description: 'reverse order' },
            { input: '0,0', expected: null, description: 'duplicate OFF' },
            { input: '1,1', expected: null, description: 'duplicate ON' },
            { input: null as any, expected: null, description: 'null input' },
            { input: undefined as any, expected: null, description: 'undefined input' }
        ];

        testCases.forEach(({ input, expected, description }) => {
            it(`should return ${expected} for ${description}`, () => {
                const result = service.mapInstantToBoolean(input);
                expect(result).toBe(expected);
            });
        });
    });

    describe('createInstantFilter', () => {
        it('should return correct instant filter items', () => {
            const result = service.createInstantFilter();
            
            expect(result).toHaveLength(2);
            expect(result[0].value).toBe('1');
            expect(result[0].text).toBe('ON');
            expect(result[1].value).toBe('0');
            expect(result[1].text).toBe('OFF');
        });
    });

    describe('createAutoPayoutFilter', () => {
        it('should return correct auto payout filter items', () => {
            const result = service.createAutoPayoutFilter();
            
            expect(result).toHaveLength(3);
            expect(result[0].value).toBe('1');
            expect(result[0].text).toBe('Auto Payout');
            expect(result[1].value).toBe('16');
            expect(result[1].text).toBe(' Direct Payout');
            expect(result[2].value).toBe('0');
            expect(result[2].text).toBe('OFF');
        });
    });

    describe('getStatusAutoPayoutMatch', () => {
        it('should return formatted status for match with auto and direct payout', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: true,
                    isDirectPayoutForMatch: true
                },
                enabledAutoRefundMatch: false
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Auto & Direct');
        });

        it('should return formatted status for match with auto and refund', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: true,
                    isDirectPayoutForMatch: false
                },
                enabledAutoRefundMatch: true
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Auto & Refund');
        });

        it('should return formatted status for match with direct and refund', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: false,
                    isDirectPayoutForMatch: true
                },
                enabledAutoRefundMatch: true
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Direct & Refund');
        });

        it('should return formatted status for match with only auto payout', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: true,
                    isDirectPayoutForMatch: false
                },
                enabledAutoRefundMatch: false
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Auto');
        });

        it('should return formatted status for match with only direct payout', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: false,
                    isDirectPayoutForMatch: true
                },
                enabledAutoRefundMatch: false
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Direct');
        });

        it('should return formatted status for match with only refund', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: false,
                    isDirectPayoutForMatch: false
                },
                enabledAutoRefundMatch: true
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Refund');
        });

        it('should return OFF status when no settings are enabled', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: false,
                    isDirectPayoutForMatch: false
                },
                enabledAutoRefundMatch: false
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toBe('OFF');
        });

        it('should use league refund setting when match refund is null', () => {
            const mockMatch = {
                autoCalcSetting: {
                    isAutoPayoutForMatch: false,
                    isDirectPayoutForMatch: false
                },
                enabledAutoRefundMatch: null
            } as CalculationMatch;

            const mockLeague = {
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutMatch(mockMatch, mockLeague);
            expect(result).toContain('Refund');
        });
    });

    describe('getStatusAutoPayoutLeague', () => {
        it('should return formatted status for league with auto and direct payout', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: true,
                    isDirectPayoutForLeague: true
                },
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toContain('Auto & Direct');
        });

        it('should return formatted status for league with auto and refund', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: true,
                    isDirectPayoutForLeague: false
                },
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toContain('Auto & Refund');
        });

        it('should return formatted status for league with direct and refund', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: false,
                    isDirectPayoutForLeague: true
                },
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toContain('Direct & Refund');
        });

        it('should return formatted status for league with only auto payout', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: true,
                    isDirectPayoutForLeague: false
                },
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toContain('Auto');
        });

        it('should return formatted status for league with only direct payout', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: false,
                    isDirectPayoutForLeague: true
                },
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toContain('Direct');
        });

        it('should return formatted status for league with only refund', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: false,
                    isDirectPayoutForLeague: false
                },
                enabledAutoRefund: true
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toContain('Refund');
        });

        it('should return OFF status when no settings are enabled', () => {
            const mockLeague = {
                autoCalcSetting: {
                    isAutoPayoutForLeague: false,
                    isDirectPayoutForLeague: false
                },
                enabledAutoRefund: false
            } as League;

            const result = service.getStatusAutoPayoutLeague(mockLeague);
            expect(result).toBe('OFF');
        });
    });
});
