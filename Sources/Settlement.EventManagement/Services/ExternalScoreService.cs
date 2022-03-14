using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.EventManagement.Services
{
    public interface IExternalScoreService
    {
        void LoadExternalResultForSoccer(Match match, List<ResultDetail> resultDetails);

        void LoadExternalResultForOtherSports(Match match, List<ResultDetail> resultDetails, bool includeHalfTime);

        void LoadExternalResultForVolleyball(Match match, List<ResultDetail> resultDetails);
    }

    public class ExternalScoreService : IExternalScoreService
    {
        public void LoadExternalResultForSoccer(Match match, List<ResultDetail> resultDetails)
        {
            var internalResultDetails = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            var externalResultDetails = GetSBOResults(match.MatchId, resultDetails);
            SetExternalResult(match, externalResultDetails);
            if (externalResultDetails.Count > 0)
            {
                externalResultDetails.ForEach(item =>
                {
                    var result = internalResultDetails.Find(r => r.ResourceId == item.ResourceId);
                    if (ConsistentResultDetail(result, item))
                    {
                        match.IsNotConsistentExHtScore = item.ResourceId == ResourceType.Halftime
                                ? !string.Equals(match.SuspenderHalfTime, "-") || ExistResult(result)
                                : match.IsNotConsistentExHtScore;
                        match.IsNotConsistentExFtScore = item.ResourceId == ResourceType.Final
                                ? !string.Equals(match.SuspenderFullTime, "-") || ExistResult(result)
                                : match.IsNotConsistentExFtScore;
                    }
                });
            }
        }

        public void LoadExternalResultForVolleyball(Match match, List<ResultDetail> resultDetails)
        {
            var internalResultDetails = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            var externalResultDetails = GetSBOResults(match.MatchId, resultDetails);
            SetExternalFullTime(match, externalResultDetails);
            if (match.ExFTResult != null)
            {
                var result = internalResultDetails.Find(r => r.ResourceId == match.ExFTResult.ResourceId);
                if (ConsistentResultDetail(result, match.ExFTResult))
                {
                    match.IsNotConsistentExFtScore = !string.Equals(match.SuspenderFullTime, "-") || ExistResult(result);
                }
            }
        }

        public void LoadExternalResultForOtherSports(Match match, List<ResultDetail> resultDetails, bool includeHalfTime)
        {
            var externalResultDetails = GetSBOResults(match.MatchId, resultDetails);
            if (includeHalfTime)
            {
                SetExternalResult(match, externalResultDetails);
                if (match.ExHTResult != null && ConsistentMatchScore(match.HalfTimeHomeScore, match.HalfTimeAwayScore, match.ExHTResult))
                {
                    match.IsNotConsistentExHtScore = !string.Equals(match.SuspenderHalfTime, "-") || ExistMatchScore(match.HalfTimeHomeScore, match.HalfTimeAwayScore);
                }
            }
            else
            {
                SetExternalFullTime(match, externalResultDetails);
            }

            if (match.ExFTResult != null && ConsistentMatchScore(match.FinalHomeScore, match.FinalAwayScore, match.ExFTResult))
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
                match.ExHTResult = halfTimeResult;
            }
        }

        private static void SetExternalFullTime(Match match, List<ResultDetail> externalResultDetails)
        {
            var fullTimeResult = externalResultDetails.Find(result => result.ResourceId == ResourceType.Final);
            if (fullTimeResult != null && !string.IsNullOrEmpty(fullTimeResult.AwayValue) && !string.IsNullOrEmpty(fullTimeResult.HomeValue))
            {
                match.ExFTResult = fullTimeResult;
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

        private static List<ResultDetail> GetSBOResults(int matchId, List<ResultDetail> resultDetails)
        {
            return resultDetails.Where(m => m.MatchId == matchId && m.SourceId != SourceType.Normal
                                            && !string.IsNullOrWhiteSpace(m.AwayValue)
                                            && !string.IsNullOrWhiteSpace(m.HomeValue)).ToList();
        }
    }
}