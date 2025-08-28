namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using MappedScore = (ResultDetail ExternalResult, string Round);
using Match = Models.MultiSports.Match;

public interface IExternalScoreService
{
    bool IsInconsistentFullTimeScore(int matchId, string userConfirmation, List<ResultDetail> resultDetails);
    bool IsInconsistentFullTimeScore(Match match, IEnumerable<ResultDetail> resultDetails);
    bool IsInconsistentHalftimeScore(Match match, IEnumerable<ResultDetail> resultDetails);
}

public class ExternalScoreServiceImp(MuayThaiHelperService muayThaiHelperService) : IExternalScoreService
{
    private const string SuspenderDefaultValue = "-";
    private const string EmptyString = "";

    public bool IsInconsistentFullTimeScore(int matchId, string userConfirmation, List<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(matchId, resultDetails);
        var finalExternalResult = FindResultByResourceType(externalResultDetails, ResourceType.Final);

        if (finalExternalResult == null)
        {
            return false;
        }

        var currentResult = FindCurrentResult(resultDetails, matchId, finalExternalResult.ResourceId);
        return AreScoresDifferent(currentResult, finalExternalResult, userConfirmation);
    }

    public bool IsInconsistentFullTimeScore(Match match, IEnumerable<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var finalExternalResult = FindResultByResourceType(externalResultDetails, ResourceType.Final);

        if (finalExternalResult == null)
        {
            return false;
        }

        if (HasNoScores(match.FinalHomeScore, match.FinalAwayScore))
        {
            return !string.Equals(match.SuspenderFullTime, SuspenderDefaultValue);
        }

        var mappedScore = MapSboScore(match.SportType, finalExternalResult);
        return AreScoresInconsistent(match, mappedScore);
    }

    public bool IsInconsistentHalftimeScore(Match match, IEnumerable<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var halftimeExternalResult = FindResultByResourceType(externalResultDetails, ResourceType.Halftime);

        if (halftimeExternalResult == null)
        {
            return false;
        }

        if (HasNoScores(match.HalfTimeHomeScore, match.HalfTimeAwayScore))
        {
            return !string.Equals(match.SuspenderHalfTime, SuspenderDefaultValue);
        }

        return AreScoresInconsistent(match.HalfTimeHomeScore, match.HalfTimeAwayScore, halftimeExternalResult);
    }

    private static bool AreScoresInconsistent(Match match, MappedScore mappedScore)
    {
        var homeScoreConsistent = AreScoresEqual(match.FinalHomeScore.ToString(), mappedScore.ExternalResult.HomeValue);
        var awayScoreConsistent = AreScoresEqual(match.FinalAwayScore.ToString(), mappedScore.ExternalResult.AwayValue);
        var betStatusConsistent = AreBetStatusesEqual(match.BetStatus, mappedScore.Round);

        return !homeScoreConsistent || !awayScoreConsistent || !betStatusConsistent;
    }

    private static bool AreScoresInconsistent(int? homeScore, int? awayScore, ResultDetail externalResult)
    {
        var homeScoreConsistent = AreScoresEqual(homeScore.ToString(), externalResult.HomeValue);
        var awayScoreConsistent = AreScoresEqual(awayScore.ToString(), externalResult.AwayValue);

        return !homeScoreConsistent || !awayScoreConsistent;
    }

    private static bool AreBetStatusesEqual(string matchBetStatus, string externalRound)
    {
        var normalizedBetStatus = string.IsNullOrWhiteSpace(matchBetStatus) ? EmptyString : matchBetStatus;
        return string.Equals(normalizedBetStatus, externalRound);
    }

    private MappedScore MapSboScore(int sportType, ResultDetail finalExternalResult)
    {
        var round = EmptyString;

        if (sportType == SportType.MuayThai)
        {
            var mappedResult = MapMuayThaiScores(finalExternalResult);
            if (mappedResult.HasValue)
            {
                var (mappedHome, mappedAway, mappedRound) = mappedResult.Value;
                finalExternalResult.HomeValue = mappedHome;
                finalExternalResult.AwayValue = mappedAway;
                round = mappedRound;
            }
        }

        return (finalExternalResult, round);
    }

    private (string Home, string Away, string Round)? MapMuayThaiScores(ResultDetail finalExternalResult)
    {
        if (int.TryParse(finalExternalResult.HomeValue, out var homeValue) &&
            int.TryParse(finalExternalResult.AwayValue, out var awayValue))
        {
            return muayThaiHelperService.MapSboToSettle(homeValue, awayValue);
        }

        return null;
    }

    private static bool AreScoresDifferent(ResultDetail currentResult, ResultDetail externalResult, string userConfirmation)
    {
        if (currentResult == null)
        {
            return true;
        }

        var scoresMatch = AreScoresEqual(currentResult.HomeValue, externalResult.HomeValue) &&
                         AreScoresEqual(currentResult.AwayValue, externalResult.AwayValue);

        if (scoresMatch)
        {
            return false;
        }

        var hasValidScores = HasValidScores(currentResult);
        var hasUserConfirmation = !string.Equals(userConfirmation, SuspenderDefaultValue);

        return hasValidScores || hasUserConfirmation;
    }

    private static bool AreScoresEqual(string score1, string score2)
    {
        return string.Equals(score1, score2);
    }

    private static bool HasValidScores(ResultDetail result)
    {
        return !string.IsNullOrWhiteSpace(result.HomeValue) && !string.IsNullOrWhiteSpace(result.AwayValue);
    }

    private static bool HasNoScores(int? homeScore, int? awayScore)
    {
        return homeScore == null && awayScore == null;
    }

    private static ResultDetail FindResultByResourceType(IEnumerable<ResultDetail> results, string resourceType)
    {
        return results.FirstOrDefault(result => result.ResourceId == resourceType);
    }

    private static ResultDetail FindCurrentResult(IEnumerable<ResultDetail> resultDetails, int matchId, string resourceId)
    {
        return resultDetails.FirstOrDefault(result =>
            result.MatchId == matchId &&
            result.SourceId == SourceType.Normal &&
            result.ResourceId == resourceId);
    }

    private static List<ResultDetail> GetSboResults(int matchId, IEnumerable<ResultDetail> resultDetails)
    {
        return resultDetails.Where(result =>
            result.MatchId == matchId &&
            result.SourceId != SourceType.Normal &&
            HasValidScores(result)).ToList();
    }
}