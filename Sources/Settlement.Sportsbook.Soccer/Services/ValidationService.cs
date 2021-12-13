using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IValidationService
    {
        bool HasHalftimeScoreWithoutSemicolonOnGoalRecord(SettleRequest request);

        bool HasHalftimeScoreWithSemicolonOnGoalRecord(SettleRequest request);

        bool IsNullScoreAndGoalRecord(SettleRequest request);

        bool HasFinalScoreAndSemicolonOnGoalRecord(SettleRequest request);

        bool IsNullHalftimeScoreAndGoalRecord(SettleRequest request);

        bool HasFinalScoreAndGoalRecord(SettleRequest request);

        bool IsExistFirstGoalLastGoal(SettleRequest request);

        bool IsRefundHalftime(SettleRequest request);

        bool IsRefundFullTime(SettleRequest request);
    }

    public class ValidationServiceImp : IValidationService
    {
        private const string RefundHalfTime = "Refund HT;";

        private const string RefundFullTime = "Refund FT;";

        private const string Abandoned2H = "Abandoned 2H;";

        public bool HasHalftimeScoreWithoutSemicolonOnGoalRecord(SettleRequest request)
        {
            if (IsNullGoalRecord(request))
            {
                return false;
            }

            var hasHalftimeScore = request.HalfTimeAwayScore >= 0 || request.HalfTimeHomeScore >= 0;
            return hasHalftimeScore && !request.GoalRecord.Contains(";");
        }

        public bool HasHalftimeScoreWithSemicolonOnGoalRecord(SettleRequest request)
        {
            if (IsNullGoalRecord(request))
            {
                return false;
            }

            var hasHalftimeScore = request.HalfTimeAwayScore >= 0 || request.HalfTimeHomeScore >= 0;
            return hasHalftimeScore && request.GoalRecord.Contains(";");
        }

        public bool IsNullScoreAndGoalRecord(SettleRequest request)
        {
            var isNullHalftimeScore = IsNullHalftimeScore(request);
            var isNullFullTimeScore = IsNullFullTimeScore(request);
            var isEmptyAndWithoutSemicolon = IsNullOrOnlySemicolonOnGoalRecord(request);

            return isNullHalftimeScore && isNullFullTimeScore && isEmptyAndWithoutSemicolon;
        }

        public bool HasFinalScoreAndSemicolonOnGoalRecord(SettleRequest request)
        {
            return HasFinalScoreAndGoalRecord(request) && !string.IsNullOrEmpty(request.GoalRecord.Replace(";", string.Empty));
        }

        public bool IsNullHalftimeScoreAndGoalRecord(SettleRequest request)
        {
            var notInputHalftimeScore = !request.HalfTimeAwayScore.HasValue && !request.HalfTimeHomeScore.HasValue;
            var isEmptyAndWithoutSemicolon = IsNullOrOnlySemicolonOnGoalRecord(request);

            return notInputHalftimeScore && isEmptyAndWithoutSemicolon;
        }

        public bool HasFinalScoreAndGoalRecord(SettleRequest request)
        {
            return HasFinalScore(request) && !IsNullGoalRecord(request);
        }

        public bool IsRefundHalftime(SettleRequest request)
        {
            return request.ActionName.Equals(ActionType.CalculateFullTime)
                    && !string.IsNullOrEmpty(request.BetStatus)
                    && request.BetStatus.Contains(RefundHalfTime);
        }

        public bool IsRefundFullTime(SettleRequest request)
        {
            return request.ActionName.Equals(ActionType.CalculateHalfTime)
                && !string.IsNullOrEmpty(request.BetStatus)
                && (request.BetStatus.Contains(RefundFullTime) || request.BetStatus.Contains(Abandoned2H));
        }

        public bool IsExistFirstGoalLastGoal(SettleRequest request)
        {
            return request.IsExistFgLg || request.IsExistHtFgLg;
        }

        private static bool IsNullHalftimeScore(SettleRequest request)
        {
            return (!request.HalfTimeAwayScore.HasValue && !request.HalfTimeHomeScore.HasValue)
                   || (request.HalfTimeAwayScore.Equals(0) && request.HalfTimeHomeScore.Equals(0));
        }

        private static bool IsNullFullTimeScore(SettleRequest request)
        {
            return (!request.FinalAwayScore.HasValue && !request.FinalHomeScore.HasValue)
                   || (request.FinalAwayScore.Equals(0) && request.FinalHomeScore.Equals(0));
        }

        private static bool IsNullGoalRecord(SettleRequest request)
        {
            return string.IsNullOrWhiteSpace(request.GoalRecord);
        }

        private static bool IsNullOrOnlySemicolonOnGoalRecord(SettleRequest request)
        {
            return IsNullGoalRecord(request)
                   || (!IsNullGoalRecord(request) && string.IsNullOrEmpty(request.GoalRecord.Replace(";", string.Empty)));
        }

        private static bool HasFinalScore(SettleRequest request)
        {
            return request.FinalAwayScore.HasValue || request.FinalHomeScore.HasValue;
        }
    }
}