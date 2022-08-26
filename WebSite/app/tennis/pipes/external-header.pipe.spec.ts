import { ExternalHeaderPipe } from './external-header.pipe';

describe('Pipe: ExternalHeaderPipe', () => {
    let pipe: ExternalHeaderPipe;
    beforeEach(() => {
        pipe = new ExternalHeaderPipe();
    });

    it('should return games with total games resource', () => {
        expect(pipe.transform('06')).toEqual('Games');
    });

    it('should return sets with total sets resource', () => {
        expect(pipe.transform('00')).toEqual('Sets');
    });

    it('should return set number', () => {
        expect(pipe.transform('02')).toEqual('2S');
    });
});
