import { FilterResultStatusPipe } from './filter-result-status.pipe';
import { ResultDetail } from '../../models';
import { ResultSettingModel } from '../../../shared/models';

describe('FilterResultStatusPipe', () => {
  let pipe: FilterResultStatusPipe;
  let mockResultDetails: ResultDetail[];

  beforeEach(() => {
    pipe = new FilterResultStatusPipe();
    const defaultResultSettingData: ResultSettingModel = {
      isHoldResult: false,
      isConfirmedRefund: false,
      isConfirmedRefundSdt: false,
      isConfirmedRefundMercy: false,
      iconHoldResult: ''
    };

    mockResultDetails = [
      {
        // GeneralResultDetail properties
        resourceId: 'resource1',
        resourceName: 'Resource 1',
        homeValue: '1',
        awayValue: '0',
        resultStatusId: 1,
        settlementStatusId: 1,
        resultStatus: 'Running',
        // ResultDetail properties
        map: 1,
        sourceId: 1,
        ticketStatus: 'OPEN',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: false,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: false,
        isSettleDetermined: false,
        isSettleDeterminedOriginal: false,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultSettingData: { ...defaultResultSettingData },
        isMismatch: false,
        resultState: 'NORMAL',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'NORMAL',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 1,
        originalAwayValue: 0
      } as unknown as ResultDetail,
      {
        resourceId: 'resource2',
        resourceName: 'Resource 2',
        homeValue: '2',
        awayValue: '1',
        resultStatusId: 2,
        settlementStatusId: 2,
        resultStatus: 'Completed (Auto)',
        map: 1,
        sourceId: 2,
        ticketStatus: 'SETTLED',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: false,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: false,
        isSettleDetermined: true,
        isSettleDeterminedOriginal: true,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultSettingData: { ...defaultResultSettingData },
        isMismatch: false,
        resultState: 'NORMAL',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'NORMAL',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 2,
        originalAwayValue: 1
      } as unknown as ResultDetail,
      {
        resourceId: 'resource3',
        resourceName: 'Resource 3',
        homeValue: '2',
        awayValue: '2',
        resultStatusId: 3,
        settlementStatusId: 3,
        resultStatus: 'Completed (Manual)',
        map: 1,
        sourceId: 3,
        ticketStatus: 'SETTLED',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: false,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: false,
        isSettleDetermined: true,
        isSettleDeterminedOriginal: true,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultSettingData: { ...defaultResultSettingData },
        isMismatch: false,
        resultState: 'NORMAL',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'NORMAL',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 2,
        originalAwayValue: 2,
      } as unknown as ResultDetail,
      {
        resourceId: 'resource4',
        resourceName: 'Resource 4',
        homeValue: '0',
        awayValue: '0',
        resultStatusId: 4,
        settlementStatusId: 4,
        resultStatus: 'Refund',
        map: 1,
        sourceId: 4,
        ticketStatus: 'REFUNDED',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: false,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: false,
        isSettleDetermined: true,
        isSettleDeterminedOriginal: true,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultSettingData: { ...defaultResultSettingData, isConfirmedRefund: true },
        isMismatch: false,
        resultState: 'REFUND',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'REFUND',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 0,
        originalAwayValue: 0
      } as unknown as ResultDetail,
      {
        resourceId: 'resource5',
        resourceName: 'Resource 5',
        homeValue: '',
        awayValue: '',
        resultStatusId: 5,
        settlementStatusId: 5,
        resultStatus: 'No Result',
        map: 1,
        sourceId: 5,
        ticketStatus: 'PENDING',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: true,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: true,
        isSettleDetermined: false,
        isSettleDeterminedOriginal: false,
        isInvalidSelectedProceed: false,
        isNotExistedValue: true,
        resultSettingData: { ...defaultResultSettingData },
        isMismatch: false,
        resultState: 'NO_RESULT',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'NO_RESULT',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 0,
        originalAwayValue: 0
      } as unknown as ResultDetail,
      {
        resourceId: 'resource6',
        resourceName: 'Resource 6',
        homeValue: '3',
        awayValue: '3',
        resultStatusId: 6,
        settlementStatusId: 6,
        resultStatus: '3',
        map: 1,
        sourceId: 6,
        ticketStatus: 'OPEN',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: false,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: false,
        isSettleDetermined: false,
        isSettleDeterminedOriginal: false,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultSettingData: { ...defaultResultSettingData },
        isMismatch: false,
        resultState: 'NORMAL',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'NORMAL',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 3,
        originalAwayValue: 3
      } as unknown as ResultDetail,
      {
        resourceId: 'resource7',
        resourceName: 'Resource 7',
        homeValue: '0',
        awayValue: '0',
        resultStatusId: 7,
        settlementStatusId: 7,
        resultStatus: 'Refund SDT',
        map: 1,
        sourceId: 7,
        ticketStatus: 'REFUNDED',
        betType: 'WIN',
        betTypeName: 'Win',
        checked: false,
        isResultWarning: false,
        isHomeValueWarning: false,
        isAwayValueWarning: false,
        isInvalidValue: false,
        isNotTaken: false,
        isSettleDetermined: true,
        isSettleDeterminedOriginal: true,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultSettingData: { ...defaultResultSettingData, isConfirmedRefundSdt: true },
        isMismatch: false,
        resultState: 'REFUND',
        traderScore: null,
        externalScores: [],
        resultStatusState: 'REFUND',
        isShow: true,
        isEnabled: false,
        originalHomeValue: 0,
        originalAwayValue: 0
      } as unknown as ResultDetail
    ];
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all results when no status filter is provided', () => {
    const result = pipe.transform(mockResultDetails, '');
    expect(result).toEqual(mockResultDetails);
    expect(result.length).toBe(7);
  });

  it('should return all results when status filter is undefined', () => {
    const result = pipe.transform(mockResultDetails, undefined);
    expect(result).toEqual(mockResultDetails);
    expect(result.length).toBe(7);
  });

  it('should filter results by Running status', () => {
    const result = pipe.transform(mockResultDetails, 'Running');
    expect(result.length).toBe(1);
    expect(result.every(item => item.resultStatus === 'Running')).toBeTruthy();
  });

  it('should filter results by Completed statuses', () => {
    const result = pipe.transform(mockResultDetails, 'Completed (Auto),Completed (Manual)');
    expect(result.length).toBe(2);
    expect(result.every(item => ['Completed (Auto)', 'Completed (Manual)'].includes(item.resultStatus))).toBeTruthy();
  });

  it('should filter results by Refund statuses', () => {
    const result = pipe.transform(mockResultDetails, 'Refund,Refund SDT');
    expect(result.length).toBe(2);
    expect(result.every(item => ['Refund', 'Refund SDT'].includes(item.resultStatus))).toBeTruthy();
  });

  it('should filter results by No Result status', () => {
    const result = pipe.transform(mockResultDetails, 'No Result');
    expect(result.length).toBe(1);
    expect(result.every(item => item.resultStatus === 'No Result')).toBeTruthy();
  });

  it('should filter results by status "3"', () => {
    const result = pipe.transform(mockResultDetails, '3');
    expect(result.length).toBe(2);
    expect(result.some(item => item.resultStatus === '3')).toBeTruthy();
    expect(result.some(item => item.resultStatusId === 3)).toBeTruthy();
  });

  it('should return empty array when no matches found', () => {
    const result = pipe.transform(mockResultDetails, 'Invalid Status');
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});
