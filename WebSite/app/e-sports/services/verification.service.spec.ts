import { VerificationService } from "./verification.service";
import { TestBed } from "@angular/core/testing";
import { ResultDetail, ExternalResultDetail } from "../../shared/models/sportsbook-sop";
import { MessageBoxService } from "../../shared/services";
import { ModalDialogComponent, ModalContentDialogComponent } from "../../shared/components";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { EarlyConstraintService } from "./early-constraint.service";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';

describe('E-Sports - VerificationService', () => {
    let service: VerificationService;
    const resultDetail = new ResultDetail();
    let resultDetails = [resultDetail];
    const externalResultDetail = new ExternalResultDetail(1, '1', '', '', '2', '1');
    let mapOne: ResultDetail;
    let mapTwo: ResultDetail;
    let final: ResultDetail;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                VerificationService,
                MessageBoxService,
                EarlyConstraintService,
                NgbModal,
                ResultByTeamNamePipe
            ],
            imports: [
                NgbModule
            ]
        });

        mapOne = new ResultDetail();
        mapOne.resourceId = 'M1';
        mapOne.homeValue = '1';
        mapOne.awayValue = '2';
        mapTwo = new ResultDetail();
        mapTwo.resourceId = 'M2';
        mapTwo.homeValue = '3';
        mapTwo.awayValue = '4';
        final = new ResultDetail();
        final.resourceId = '00';
        service = TestBed.inject(VerificationService);
    });

    describe('allResultsHaveScoreSources', () => {
        it('should return true when all results have score sources', () => {
            resultDetail.checked = true;
            const outsideResult = new ExternalResultDetail(1001, '', '', '', 'H', '');
            resultDetail.externalScores = [externalResultDetail, outsideResult];

            const result = service.allResultsHaveScoreSources(resultDetails);

            expect(result).toBe(true);
        });
        it('should return false when result missing score source', () => {
            resultDetail.checked = true;
            resultDetail.externalScores = [externalResultDetail];

            const result = service.allResultsHaveScoreSources(resultDetails);

            expect(result).toBe(false);
        });
    });


    it('enableUncalculateButton - should return true if at least one map', () => {

        const result = service.enableUncalculateButton([resultDetail]);

        expect(result).toBe(true);
    });

    describe('hasTicketBetOnMap', () => {
        it('should return true if exist tickets on map', () => {
            resultDetail.ticketStatus = 'Running';

            const result = service.hasTicketBetOnMap(resultDetails);

            expect(result).toBe(true);
        });

        it('should return false if there is no ticket on final', () => {
            resultDetail.ticketStatus = 'No Ticket';

            const result = service.hasTicketBetOnMap(resultDetails);

            expect(result).toBe(false);
        });
    });

    describe('isExistInhouseResult', () => {
        beforeEach(() => {
            resultDetail.externalScores = [externalResultDetail];
            externalResultDetail.homeValue = '';
            externalResultDetail.awayValue = '';
        });

        it('should return externalResultDetail when couple result has inhouse result', () => {
            externalResultDetail.homeValue = '1';
            externalResultDetail.awayValue = '0';
            resultDetail.betType = "9002";

            const result = service.isExistInhouseResult(resultDetail);

            expect(result).toEqual(externalResultDetail);
        });

        it('should return externalResultDetail when single result has inhouse result', () => {
            externalResultDetail.homeValue = '1';
            externalResultDetail.awayValue = '';
            resultDetail.betType = "9073";
            const result = service.isExistInhouseResult(resultDetail);

            expect(result).toEqual(externalResultDetail);
        });
    });

});