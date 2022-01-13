using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus
{
    public interface IBetStatusService
    {
        string GetBetStatus(SettleRequest request);
    }

    public class BetStatusServiceImp : IBetStatusService
    {
        private readonly IHalftimeService halftimeService;

        public BetStatusServiceImp(IHalftimeService halftimeService)
        {
            this.halftimeService = halftimeService;
        }

        public string GetBetStatus(SettleRequest request)
        {
            var halfTimeBetStatus = string.Empty;
            if (request.IsExistHtFgLg)
            {
                halfTimeBetStatus = halftimeService.GetBetStatusForCalculateHalfTime(request);
            }

            return halftimeService.ApplyNewBetStatusForHalfTime(request.BetStatus, halfTimeBetStatus);
        }
    }
}