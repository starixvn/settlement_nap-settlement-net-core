import { NgModule } from '@angular/core';
import { ScoreBySettlementPipe } from './score-by-settlement.pipe';
import { IntervalBackgroundPipe } from './interval-background.pipe'
import { ResultByTeamNamePipe } from './result-by-team-name.pipe';
import { ExternalSourceNamePipe } from './external-source-name.pipe';
import { ResultStatusPipe } from './result-status.pipe';
import { TicketStatusPipe } from './ticket-status.pipe';
import { ResultTypePipe } from './result-type.pipe';
import { IntervalScorePipe } from './interval-score.pipe';
import { ResultPipe } from './result.pipe';

@NgModule({
    exports: [
        ResultByTeamNamePipe,
        ResultStatusPipe,
        TicketStatusPipe,
        ResultTypePipe,
        IntervalScorePipe,
        ResultPipe,
    ],
    declarations: [
        ResultByTeamNamePipe,
        ResultStatusPipe,
        TicketStatusPipe,
        ResultTypePipe,
        IntervalScorePipe,
        ResultPipe,
    ],
})
export class PipesModule {
}