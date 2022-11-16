using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface MergeDataService
    {
        List<Match> MergeMatches(List<Match> baseMatches, List<Match> siteMatches);
    }

    public class MergeDataServiceImp : MergeDataService
    {
        private readonly CompareMatchService compareMatchService;

        public MergeDataServiceImp(CompareMatchService compareMatchService)
        {
            this.compareMatchService = compareMatchService;
        }

        public List<Match> MergeMatches(List<Match> baseMatches, List<Match> siteMatches)
        {
            var peekNewMatches = siteMatches.Except(baseMatches).ToList();
            baseMatches.AddRange(peekNewMatches);
            AddSiteInfo(baseMatches, siteMatches);

            return baseMatches;
        }

        private void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches)
        {
            foreach (var match in baseMatches)
            {
                var matchSiteInfo = compareMatchService.GetDifferentMatchSiteInfo(match, siteMatches);
                if (matchSiteInfo != null)
                {
                    match.SiteMatch.Add(matchSiteInfo);
                }
            }
        }
    }
}