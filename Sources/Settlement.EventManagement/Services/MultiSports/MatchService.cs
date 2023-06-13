namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Models.MultiSports.Match;

public interface IMatchService
{
    List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, Permission permission = null);

    void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches);

    List<Match> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail);

    Task UpdateMatchInfo(UpdateMatchInfoRequest request);

    List<Match> SortingMatches(List<Match> matches);
}

public class MatchServiceImp : IMatchService
{
    private readonly IMatchResultDetailService matchResultDetailService;

    private readonly IRefDataService refDataService;

    private readonly CompareMatchService compareMatchService;

    private readonly NewInfoMatchService newInfoMatchService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    public MatchServiceImp(IRefDataService refDataService,
        IMatchResultDetailService matchResultDetailService,
        CompareMatchService compareMatchService,
        NewInfoMatchService newInfoMatchService,
        ScaleOutSettleService scaleOutSettleService)
    {
        this.matchResultDetailService = matchResultDetailService;
        this.refDataService = refDataService;
        this.compareMatchService = compareMatchService;
        this.newInfoMatchService = newInfoMatchService;
        this.scaleOutSettleService = scaleOutSettleService;
    }

    public List<Match> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail)
    {
        foreach (var match in matches)
        {
            var listSourceByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId != SourceType.Normal).ToList();
            var currentResultDetail = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();

            newInfoMatchService.TicketInfo(match);
            match.NewEventStatus = newInfoMatchService.NewEventStatus(match, currentResultDetail);
            match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
            match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
            match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Halftime);
            match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Final);
            match.IsExistsConfirmedEarly = newInfoMatchService.IsExistsConfirmedEarly(match);
            match.RefDataService = refDataService;
        }

        return matches;
    }

    public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, Permission permission = null)
    {
        return sportType switch
        {
            SportType.Tennis => matchResultDetailService.TennisResultDetail(matches, resultDetails, permission),
            SportType.BasketBall => matchResultDetailService.BasketballResultDetail(matches, resultDetails, permission),
            SportType.ESports => matchResultDetailService.ESportsResultDetail(matches, resultDetails, permission),
            SportType.Badminton => matchResultDetailService.BadmintonResultDetail(matches, resultDetails, permission),
            SportType.Cricket => matchResultDetailService.CricketResultDetail(matches, resultDetails, permission),
            SportType.BeachVolleyball => matchResultDetailService.BeachVolleyballResultDetail(matches, resultDetails,
                permission),
            SportType.VolleyBall => matchResultDetailService.VolleyballResultDetail(matches, resultDetails, permission),
            _ => LoadExternalResults(matches, resultDetails, sportType)
        };
    }

    private readonly List<int> fullTimeSports = new()
    {
            SportType.IceHockey,
            SportType.VolleyBall,
            SportType.TableTennis,
            SportType.Handball,
            SportType.Dart,
            SportType.Swimming,
            SportType.Politics,
            SportType.WaterPolo,
            SportType.Diving,
            SportType.Boxing,
            SportType.Archery,
            SportType.Weightlifting,
            SportType.Canoeing,
            SportType.Gymnastics,
            SportType.Athletics,
            SportType.Equestrian,
            SportType.Entertainment,
            SportType.OtherSports,
            SportType.Kabaddi,
            SportType.Futsal,
            SportType.UpcomingSport56,
            SportType.Billard,
            SportType.Golf,
            SportType.Motorsports,
            SportType.Winter,
            SportType.Cycling,
            SportType.Fencing,
            SportType.Judo,
            SportType.ModernPentathlon,
            SportType.Rowing,
            SportType.Sailing,
            SportType.Shooting,
            SportType.Taekwondo,
            SportType.Triathlon,
            SportType.Wrestling,
            SportType.MuayThai,
            SportType.BeachSoccer,
            SportType.Poker,
            SportType.Chess,
            SportType.Olympic,
            SportType.Finance,
            SportType.FieldHockey,
            SportType.Squash,
            SportType.SepakTakraw
        };

    private readonly List<int> halfTimeFullTimeSports = new()
    {
            SportType.Football,
            SportType.BaseBall,
            SportType.Rugby,
            SportType.NetBall
        };

    private List<Match> LoadExternalResults(List<Match> matches, List<ResultDetail> resultDetails, int sportType)
    {
        if (fullTimeSports.Contains(sportType))
        {
            return matchResultDetailService.OtherSportsResultDetail(matches, resultDetails, false);
        }

        if (halfTimeFullTimeSports.Contains(sportType))
        {
            return matchResultDetailService.OtherSportsResultDetail(matches, resultDetails, true);
        }

        matches.ForEach(match => match.RefDataService = refDataService);

        return matches;
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

    public async Task UpdateMatchInfo(UpdateMatchInfoRequest request)
    {
        await scaleOutSettleService.UpdateMatchInfo(request);
    }

    public List<Match> SortingMatches(List<Match> matches)
    {
        var sportBook = matches.OrderBy(match => !(match.OriginalEventStatus.ToLowerInvariant() == EventStatus.Completed && match.IsExistRunningTicket))
            .ThenBy(match => match.OriginalEventStatus.ToLowerInvariant() == EventStatus.Completed && !match.IsExistRunningTicket)
            .ThenBy(match => match.KickOffTime)
            .ThenBy(match => match.LeagueId)
            .ThenBy(match => match.SettlementStatus != 0)
            .ThenBy(match => match.MatchCode.ToLowerInvariant())
            .ToList();

        return sportBook;
    }
}