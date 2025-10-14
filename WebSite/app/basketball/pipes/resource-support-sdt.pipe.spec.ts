import { ResourceSupportSDTPipe } from './resource-support-sdt.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';

describe('ResourceSupportSDTPipe', () => {
    let pipe: ResourceSupportSDTPipe;
    let resultDetails: ResultDetail[];

    beforeEach(() => {
        pipe = new ResourceSupportSDTPipe();
        
        const result1 = new ResultDetail();
        result1.betType = '653';
        result1.checked = true;
        result1.isShow = true;

        const result2 = new ResultDetail();
        result2.betType = '999';
        result2.checked = false;
        result2.isShow = true;

        resultDetails = [result1, result2];
    });

    it('should show only SDT supported resources when isSDT is true', () => {
        // Act
        const result = pipe.transform(resultDetails, true);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].betType).toBe('653');
        expect(result[0].checked).toBe(true);
        expect(result[0].isShow).toBe(true);
    });

    it('should show all resources when isSDT is false', () => {
        // Act
        const result = pipe.transform(resultDetails, false);

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].checked).toBe(true);
        expect(result[0].isShow).toBe(true);
        expect(result[1].checked).toBe(false);
        expect(result[1].isShow).toBe(true);
    });
});
