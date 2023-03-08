namespace Settlement.EventManagement.Services.Calculation;

using Match = Models.Calculation.Match;

public interface MergeDataService
{
    void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches);
}

public class MergeDataServiceImp : MergeDataService
{
    private readonly CompareMatchService compareMatchService;

    public MergeDataServiceImp(CompareMatchService compareMatchService)
    {
        this.compareMatchService = compareMatchService;
    }

    public void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches)
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