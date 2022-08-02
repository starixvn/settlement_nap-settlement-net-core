using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.Core.Services
{
    public interface UpdateStatusMatchService
    {
        Task UpdateUnderSettleFlagAsync(CalculateCriteria criteria);

        Task AutoRefundChildMatch(CalculateCriteria criteria);
    }

    public class UpdateStatusMatchServiceImp : UpdateStatusMatchService
    {
        private const int UnderSettlementId = 4;

        private readonly int[] listLeagueGroupHasChildMatch = { 42, 74, 108 };

        private readonly IDynamicRepository repository;

        public UpdateStatusMatchServiceImp(IDynamicRepository repository)
        {
            this.repository = repository;
        }

        public async Task UpdateUnderSettleFlagAsync(CalculateCriteria criteria)
        {
            if (criteria.Action != ActionType.CalculateHalfTime)
            {
                var updateStatusCriteria = new UpdateRemarkCriteria
                {
                    MatchId = criteria.MatchId,
                    AdminId = criteria.AdminId,
                    Ip = criteria.Ip,
                    Type = UnderSettlementId,
                    IsEnabled = criteria.Action != ActionType.UnCalculate
                };
                await repository.ExecuteAsync(updateStatusCriteria);
            }
        }

        public async Task AutoRefundChildMatch(CalculateCriteria criteria)
        {
            var isRefundChildMatch = !string.IsNullOrEmpty(criteria.ChildMatchIds)
                                     && listLeagueGroupHasChildMatch.Contains(criteria.LeagueGroupId)
                                     && (criteria.Action == ActionType.CalculateAll
                                     || criteria.Action == ActionType.CalculateFullTime);
            var finalScoreNotDraw = criteria.FullTimeAway != criteria.FullTimeHome;
            if (isRefundChildMatch && finalScoreNotDraw)
            {
                var autoRefundCriteria = new UpdateStatusChildMatchCriteria
                {
                    ParentId = criteria.MatchId,
                    ChildMatchIds = criteria.ChildMatchIds
                };

                await repository.ExecuteAsync(autoRefundCriteria);
            }
        }
    }
}