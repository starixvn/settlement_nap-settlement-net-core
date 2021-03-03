using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Mapper;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Core.Criterias;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Cricket
{
    public class ChildMatchService : IGetFetchService
    {
        private readonly IDynamicRepository repository;

        public ChildMatchService()
        {
            this.repository = new DynamicRepository();
        }

        public async Task<dynamic> Fetch(params dynamic[] obj)
        {
            var result = obj[0] as ResultAio;
            var matchId = obj[1];
            var selectedResources = obj[2];
        
            result.ChildMatchIds = result.ErrCode == 0 ? await GetChildMatchIds(matchId, selectedResources) : string.Empty;
            return result;
        }

        private async Task<string> GetChildMatchIds(int matchId, string selectedResources)
        {
            var criteria = new GetChildMatchCriteria();
            criteria.matchIds = matchId.ToString();
            if (selectedResources != "")
            {
                criteria.SelectedResources = selectedResources;
            }
            var listMatch = await repository.FetchAsync<ChildMatch>(criteria);
            var matchIds = listMatch.Select(item => item.matchId).ToList();

            return matchIds.Count > 0 ? string.Join(',', matchIds.ToList()) : string.Empty;
        }
    }
}
