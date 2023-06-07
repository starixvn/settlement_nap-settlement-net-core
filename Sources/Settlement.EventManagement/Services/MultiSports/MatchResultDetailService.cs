namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Match = Models.MultiSports.Match;

public interface IMatchResultDetailService
{
    List<Match> TennisResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> BasketballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> ESportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> BadmintonResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> BeachVolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> VolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission);

    List<Match> OtherSportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool includeHalfTime);
}

public class MatchResultDetailServiceImp : IMatchResultDetailService
{
    private readonly ScoreTennisService scoreTennisService;

    private readonly IRefDataService refDataService;

    private readonly IExternalScoreService externalScoreService;

    private readonly ScoreService scoreService;

    public MatchResultDetailServiceImp(
        ScoreTennisService scoreTennisService,
        IRefDataService refDataService,
        IExternalScoreService externalScoreService,
        ScoreService scoreService)
    {
        this.scoreTennisService = scoreTennisService;
        this.refDataService = refDataService;
        this.externalScoreService = externalScoreService;
        this.scoreService = scoreService;
    }

    public List<Match> TennisResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = scoreTennisService.ScoreLoader(match, resultDetailByMatchId, permission);
            match.IsHavingIntervalScore = scoreService.IsDisplayIntervalScore(match.SportType, resultDetailByMatchId);
            match.EventStatus = scoreTennisService.GetEventStatus(resultDetails, match.EventStatus);
        }

        return matches;
    }

    public List<Match> BasketballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        var resources = new List<string> { "Q1", "Q2", "Q3", "Q4", "OT" };
        return SetMatchInfo(matches, resultDetails, resources, permission);
    }

    public List<Match> ESportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        var resources = new List<string> { "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9" };

        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = GetMoreScoresESport(match, resultDetailByMatchId, resources, permission);
            match.IsHavingIntervalScore = scoreService.IsDisplayIntervalScore(match.SportType, resultDetailByMatchId);
        }

        return matches;
    }

    private MoreScores GetMoreScoresESport(Match match, List<ResultDetail> resultDetailByMatchId, List<string> resources, Permission permission)
    {
        const int maxResultNormalEs = 9;
        if (match.BestOfMap > maxResultNormalEs)
        {
            var resourcesBom30 = Enumerable.Range(1, match.BestOfMap).Select(i => $"M{i}").ToList();
            return ScoreLoader(match.SportType, resultDetailByMatchId, resourcesBom30, permission);
        }

        return ScoreLoader(match.SportType, resultDetailByMatchId, resources, permission);
    }

    public List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        var resources = new List<string> { "H1", "H2", "A1", "A2" };
        return SetMatchInfo(matches, resultDetails, resources, permission);
    }

    public List<Match> BeachVolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        var resources = new List<string> { "0101", "0102", "0103" };
        return VolleyballSetMatchInfo(matches, resultDetails, resources, permission);
    }

    public List<Match> VolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        var resources = new List<string> { "0101", "0102", "0103", "0104", "0105" };
        return VolleyballSetMatchInfo(matches, resultDetails, resources, permission);
    }

    private List<Match> VolleyballSetMatchInfo(List<Match> matches, List<ResultDetail> resultDetails, List<string> resources, Permission permission)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, permission);
            match.IsHavingIntervalScore = scoreService.IsDisplayIntervalScore(match.SportType, resultDetailByMatchId);
            externalScoreService.LoadExternalResultForVolleyball(match, resultDetails);
        }

        return matches;
    }

    private MoreScores ScoreLoader(int sportType, List<ResultDetail> resultDetails, List<string> resources, Permission permission)
    {
        return new MoreScores
        {
            HalfTimeScore = scoreService.HalftimeScore(sportType, resultDetails, permission),
            FinalScore = scoreService.FinalScore(resultDetails, permission),
            Sets = scoreService.ScoreOfSets(resultDetails, resources, permission)
        };
    }

    private List<Match> SetMatchInfo(List<Match> matches, List<ResultDetail> resultDetails, List<string> resources, Permission permission)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, permission);
            match.IsHavingIntervalScore = scoreService.IsDisplayIntervalScore(match.SportType, resultDetailByMatchId);
        }

        return matches;
    }

    public List<Match> BadmintonResultDetail(List<Match> matches, List<ResultDetail> resultDetails, Permission permission)
    {
        var resources = new List<string> { "0101", "0102", "0103", "0104", "0105" };
        return SetMatchInfo(matches, resultDetails, resources, permission);
    }

    public List<Match> OtherSportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool includeHalfTime)
    {
        foreach (var match in matches)
        {
            externalScoreService.LoadExternalResultForOtherSports(match, resultDetails, includeHalfTime);
        }

        return matches;
    }
}