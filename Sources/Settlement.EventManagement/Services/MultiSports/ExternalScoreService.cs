namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

public interface IExternalScoreService
{
    void LoadExternalResultForOtherSports(Match match, List<ResultDetail> resultDetails, bool includeHalfTime);

    void LoadExternalResultForVolleyball(Match match, List<ResultDetail> resultDetails);
}

public class ExternalScoreServiceImp : IExternalScoreService
{
    public void LoadExternalResultForVolleyball(Match match, List<ResultDetail> resultDetails)
    {
        var internalResultDetails = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
        var externalResultDetails = GetSboResults(match.MatchId, resultDetails);
        SetExternalFullTime(match, externalResultDetails);
        if (match.ExFtResult != null)
        {
            var result = internalResultDetails.Find(r => r.ResourceId == match.ExFtResult.ResourceId);
            if (ConsistentResultDetail(result, match.ExFtResult))
            {
                match.IsNotConsistentExFtScore = !string.Equals(match.SuspenderFullTime, "-") || ExistResult(result);
            }
        }
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

    private static bool ConsistentResultDetail(ResultDetail result, ResultDetail externalResult) =>
      result != null && (result.HomeValue != externalResult.HomeValue || result.AwayValue != externalResult.AwayValue) || result == null;

    private static bool ConsistentMatchScore(int? homeValue, int? awayValue, ResultDetail externalResult) =>
        ExistMatchScore(homeValue, awayValue) && (homeValue.ToString() != externalResult.HomeValue || awayValue.ToString() != externalResult.AwayValue)
        || !ExistMatchScore(homeValue, awayValue);

    private static bool ExistResult(ResultDetail result) =>
         result != null && !string.IsNullOrEmpty(result.HomeValue) && !string.IsNullOrEmpty(result.AwayValue);

    private static bool ExistMatchScore(int? homeValue, int? awayValue) =>
        homeValue != null && awayValue != null;

    private static List<ResultDetail> GetSboResults(int matchId, List<ResultDetail> resultDetails)
    {
        return resultDetails.Where(m => m.MatchId == matchId && m.SourceId != SourceType.Normal
                                        && !string.IsNullOrWhiteSpace(m.AwayValue)
                                        && !string.IsNullOrWhiteSpace(m.HomeValue)).ToList();
    }
}