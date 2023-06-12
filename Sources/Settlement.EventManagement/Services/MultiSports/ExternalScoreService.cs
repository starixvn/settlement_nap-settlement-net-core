namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using Match = Models.MultiSports.Match;

public interface IExternalScoreService
{
    void LoadExternalResultForOtherSports(Match match, List<ResultDetail> resultDetails, bool includeHalfTime);

    bool IsInconsistentHalftimeScore(Match match, List<ResultDetail> resultDetails);

    bool IsInconsistentFullTimeScore(Match match, List<ResultDetail> resultDetails);

    bool IsInconsistentScore(Match match, List<ResultDetail> resultDetails);
}

public class ExternalScoreServiceImp : IExternalScoreService
{
    public bool IsInconsistentScore(Match match, List<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var finalExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
        if (finalExternalResult == null)
        {
            return false;
        }

        var currentResult = resultDetails.Find(result => result.MatchId == match.MatchId &&
                                                         result.SourceId == SourceType.Normal &&
                                                         result.ResourceId == finalExternalResult.ResourceId);

        return ScoresDifferent(currentResult, finalExternalResult);
    }

    private static bool ScoresDifferent(ResultDetail currentResult, ResultDetail externalResult)
    {
        if (currentResult == null)
        {
            return true;
        }

        var score = !string.IsNullOrWhiteSpace(currentResult.HomeValue) && !string.IsNullOrWhiteSpace(currentResult.AwayValue);
        var isHomeValueDifferent = !string.Equals(currentResult.HomeValue, externalResult.HomeValue);
        var isAwayValueDifferent = !string.Equals(currentResult.AwayValue, externalResult.AwayValue);

        return score && (isHomeValueDifferent || isAwayValueDifferent);
    }

    public bool IsInconsistentHalftimeScore(Match match, List<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var halftimeExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Halftime);
        var finalExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
        return true;
    }

    public bool IsInconsistentFullTimeScore(Match match, List<ResultDetail> resultDetails)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        var finalExternalResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
        return true;
    }

    public void LoadExternalResultForOtherSports(Match match, List<ResultDetail> resultDetails, bool includeHalfTime)
    {
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        if (includeHalfTime)
        {
            SetExternalResult(match, externalResultDetails);
            if (match.ExHtResult != null && ConsistentMatchScore(match.HalfTimeHomeScore, match.HalfTimeAwayScore, match.ExHtResult))
            {
                match.IsNotConsistentExHtScore = !string.Equals(match.SuspenderHalfTime, "-") || ExistMatchScore(match.HalfTimeHomeScore, match.HalfTimeAwayScore);
            }
        }
        else
        {
            SetExternalFullTime(match, externalResultDetails);
        }

        if (match.ExFtResult != null && ConsistentMatchScore(match.FinalHomeScore, match.FinalAwayScore, match.ExFtResult))
        {
            match.IsNotConsistentExFtScore = !string.Equals(match.SuspenderFullTime, "-") || ExistMatchScore(match.FinalHomeScore, match.FinalAwayScore);
        }
    }

    private static void SetExternalResult(Match match, List<ResultDetail> externalResultDetails)
    {
        SetExternalHalfTime(match, externalResultDetails);
        SetExternalFullTime(match, externalResultDetails);
    }

    private static void SetExternalHalfTime(Match match, List<ResultDetail> externalResultDetails)
    {
        var halfTimeResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Halftime);
        if (halfTimeResult != null && !string.IsNullOrEmpty(halfTimeResult.AwayValue) && !string.IsNullOrEmpty(halfTimeResult.HomeValue))
        {
            match.ExHtResult = halfTimeResult;
        }
    }

    private static void SetExternalFullTime(Match match, List<ResultDetail> externalResultDetails)
    {
        var fullTimeResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
        if (fullTimeResult != null && !string.IsNullOrEmpty(fullTimeResult.AwayValue) && !string.IsNullOrEmpty(fullTimeResult.HomeValue))
        {
            match.ExFtResult = fullTimeResult;
        }
    }

    private static bool ConsistentMatchScore(int? homeValue, int? awayValue, ResultDetail externalResult) =>
        ExistMatchScore(homeValue, awayValue) && (homeValue.ToString() != externalResult.HomeValue || awayValue.ToString() != externalResult.AwayValue)
        || !ExistMatchScore(homeValue, awayValue);

    private static bool ExistMatchScore(int? homeValue, int? awayValue) =>
        homeValue != null && awayValue != null;

    private static List<ResultDetail> GetSboResults(int matchId, IEnumerable<ResultDetail> resultDetails)
    {
        return resultDetails.Where(m => m.MatchId == matchId && m.SourceId != SourceType.Normal
                                        && !string.IsNullOrWhiteSpace(m.AwayValue)
                                        && !string.IsNullOrWhiteSpace(m.HomeValue)).ToList();
    }
}