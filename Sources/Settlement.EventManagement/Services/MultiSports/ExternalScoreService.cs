namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using Match = Models.MultiSports.Match;

public interface IExternalScoreService
{
    bool IsInconsistentFullTimeScore(int matchId, string userConfirmation, List<ResultDetail> resultDetails);

    bool IsInconsistentFullTimeScore(Match match, IEnumerable<ResultDetail> resultDetails);

    bool IsInconsistentHalftimeScore(Match match, IEnumerable<ResultDetail> resultDetails);
}

public class ExternalScoreServiceImp : IExternalScoreService
{
    public bool IsInconsistentFullTimeScore(int matchId, string userConfirmation, List<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(matchId, resultDetails);
        var finalExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
        if (finalExternalResult == null)
        {
            return false;
        }

        var currentResult = resultDetails.Find(result => result.MatchId == matchId &&
                                                         result.SourceId == SourceType.Normal &&
                                                         result.ResourceId == finalExternalResult.ResourceId);

        return ScoresDifferent(currentResult, finalExternalResult, userConfirmation);
    }

    public bool IsInconsistentFullTimeScore(Match match, IEnumerable<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var finalExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
        if (finalExternalResult == null)
        {
            return false;
        }

        if (match.FinalHomeScore == null && match.FinalAwayScore == null)
        {
            return !string.Equals(match.SuspenderFullTime, "-");
        }

        var isHomeValue = string.Equals(match.FinalHomeScore.ToString(), finalExternalResult.HomeValue);
        var isAwayValue = string.Equals(match.FinalAwayScore.ToString(), finalExternalResult.AwayValue);

        return !isHomeValue || !isAwayValue;
    }

    private static bool ScoresDifferent(ResultDetail currentResult, ResultDetail externalResult, string userConfirmation)
    {
        if (currentResult == null)
        {
            return true;
        }

        var isHomeValue = string.Equals(currentResult.HomeValue, externalResult.HomeValue);
        var isAwayValue = string.Equals(currentResult.AwayValue, externalResult.AwayValue);

        if (isHomeValue && isAwayValue)
        {
            return false;
        }

        var scoreExists = !string.IsNullOrWhiteSpace(currentResult.HomeValue) && !string.IsNullOrWhiteSpace(currentResult.AwayValue);

        return scoreExists || !string.Equals(userConfirmation, "-");
    }

    public bool IsInconsistentHalftimeScore(Match match, IEnumerable<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var halftimeExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Halftime);
        if (halftimeExternalResult == null)
        {
            return false;
        }

        if (match.HalfTimeHomeScore == null && match.HalfTimeAwayScore == null)
        {
            return !string.Equals(match.SuspenderHalfTime, "-");
        }

        var isHomeValue = string.Equals(match.HalfTimeHomeScore.ToString(), halftimeExternalResult.HomeValue);
        var isAwayValue = string.Equals(match.HalfTimeAwayScore.ToString(), halftimeExternalResult.AwayValue);

        return !isHomeValue || !isAwayValue;
    }

    private static List<ResultDetail> GetSboResults(int matchId, IEnumerable<ResultDetail> resultDetails)
    {
        return resultDetails.Where(m => m.MatchId == matchId && m.SourceId != SourceType.Normal
                                        && !string.IsNullOrWhiteSpace(m.AwayValue)
                                        && !string.IsNullOrWhiteSpace(m.HomeValue)).ToList();
    }
}