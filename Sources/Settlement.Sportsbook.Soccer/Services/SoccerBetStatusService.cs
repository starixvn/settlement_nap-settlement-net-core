using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface ISoccerBetStatusService
    {
        string CreateBetStatus(SettleRequest request);
    }

    public class SoccerBetStatusServiceImp : ISoccerBetStatusService
    {
        private readonly IMatchService matchService;
        private readonly IValidationService validationService;
        private readonly IBetStatusAllService betStatusAllService;
        private readonly FullTimeBetStatus.IBetStatusService fullTimeBetStatusService;
        private readonly HalfTimeBetStatus.IBetStatusService halfTimeBetStatusService;

        public SoccerBetStatusServiceImp(
            IMatchService matchService,
            IValidationService validationService,
            HalfTimeBetStatus.IBetStatusService halfTimeBetStatusService,
            FullTimeBetStatus.IBetStatusService fullTimeBetStatusService,
            IBetStatusAllService betStatusAllService)
        {
            this.matchService = matchService;
            this.validationService = validationService;
            this.halfTimeBetStatusService = halfTimeBetStatusService;
            this.fullTimeBetStatusService = fullTimeBetStatusService;
            this.betStatusAllService = betStatusAllService;
        }

        public string CreateBetStatus(SettleRequest request)
        {
            request.BetStatus = matchService.GetBetStatus(request.MatchId);

            if (validationService.IsExistFirstGoalLastGoal(request))
            {
                return request.ActionName switch
                {
                    ActionType.CalculateHalfTime => halfTimeBetStatusService.GetBetStatus(request),
                    ActionType.CalculateFullTime => fullTimeBetStatusService.GetBetStatus(request),
                    _ => betStatusAllService.GetBetStatus(request)
                };
            }

            return validationService.IsRefundHalftime(request) || validationService.IsRefundFullTime(request) ? request.BetStatus : string.Empty;
        }
    }
}