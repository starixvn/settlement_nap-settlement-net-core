namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Models.MultiSports.Match;

public interface IMatchResultDetailService
{
    List<Match> TennisResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> BasketballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> ESportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> BadmintonResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> BeachVolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> VolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> OtherSportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool includeHalfTime);

    List<Match> BandyResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> TableTennisResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);

    List<Match> BaseballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader);
}

public class MatchResultDetailServiceImp(
    ScoreTennisService scoreTennisService,
    IRefDataService refDataService,
    IExternalScoreService externalScoreService,
    ScoreService scoreService)
    : IMatchResultDetailService
{
    public List<Match> TennisResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = scoreTennisService.ScoreLoader(resultDetailByMatchId, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
            match.EventStatus = scoreTennisService.GetEventStatus(resultDetails, match.EventStatus);
        }

        return matches;
    }

    public List<Match> BasketballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "Q1", "Q2", "Q3", "Q4", "OT" };
        return SetMatchInfo(matches, resultDetails, resources, isLeader);
    }

    public List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "H1", "H2", "A1", "A2" };
        return SetMatchInfo(matches, resultDetails, resources, isLeader);
    }

    public List<Match> BaseballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = Resources.ResultFullTime[SportType.BaseBall].ToList();
        return SetMatchInfo(matches, resultDetails, resources, isLeader);
    }

    public List<Match> BadmintonResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "0101", "0102", "0103", "0104", "0105" };
        return SetMatchInfo(matches, resultDetails, resources, isLeader);
    }

    public List<Match> ESportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9" };

        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = GetMoreScoresESport(match, resultDetailByMatchId, resources, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
        }

        return matches;
    }

    private MoreScores GetMoreScoresESport(Match match, List<ResultDetail> resultDetailByMatchId, List<string> resources, bool isLeader)
    {
        const int maxResultNormalEs = 9;
        var resourcesBom30 = Enumerable.Range(1, match.BestOfMap).Select(i => $"M{i}").ToList();
        var newResources = match.BestOfMap > maxResultNormalEs ? resourcesBom30 : resources;

        return ScoreLoader(match.SportType, resultDetailByMatchId, newResources, isLeader);
    }

    public List<Match> BeachVolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "0101", "0102", "0103" };
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
            match.IsNotConsistentExFtScore = externalScoreService.IsInconsistentFullTimeScore(match.MatchId, match.SuspenderFullTime, resultDetails);
        }

        return matches;
    }

    public List<Match> VolleyballResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "0101", "0102", "0103", "0104", "0105" };
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
        }

        return matches;
    }

    public List<Match> TableTennisResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "0101", "0102", "0103", "0104", "0105", "0106", "0107" };
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
        }

        return matches;
    }

    public List<Match> BandyResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool isLeader)
    {
        var resources = new List<string> { "0001", "ET", "PEN" };
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
        }

        OtherSportsResultDetail(matches, resultDetails, true);

        return matches;
    }

    private MoreScores ScoreLoader(int sportType, List<ResultDetail> resultDetails, List<string> resources, bool isLeader)
    {
        return new MoreScores
        {
            HalfTimeScore = scoreService.HalftimeScore(sportType, resultDetails, isLeader),
            FinalScore = scoreService.FinalScore(sportType, resultDetails, isLeader),
            Sets = scoreService.ScoreOfSets(resultDetails, resources, isLeader)
        };
    }

    private List<Match> SetMatchInfo(List<Match> matches, IReadOnlyCollection<ResultDetail> resultDetails, List<string> resources, bool isLeader)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = ScoreLoader(match.SportType, resultDetailByMatchId, resources, isLeader);
            match.IsHavingIntervalScore = scoreService.IsIntervalScore(match.SportType, resultDetailByMatchId);
            match.MercyAbandonedInfo = scoreService.VerifyScoreMercy(match.SportType, resultDetailByMatchId);
        }

        return matches;
    }

    public List<Match> OtherSportsResultDetail(List<Match> matches, List<ResultDetail> resultDetails, bool includeHalfTime)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            if (includeHalfTime)
            {
                match.IsNotConsistentExHtScore = externalScoreService.IsInconsistentHalftimeScore(match, resultDetails);
            }

            match.IsNotConsistentExFtScore = externalScoreService.IsInconsistentFullTimeScore(match, resultDetails);
        }

        return matches;
    }
}