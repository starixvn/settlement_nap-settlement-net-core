using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IValidationService
    {
        bool HasHalftimeScoreWithoutSemicolonOnGoalRecord(SettleBaseRequest request);

        bool HasHalftimeScoreWithSemicolonOnGoalRecord(SettleBaseRequest request);

        bool IsNullScoreAndGoalRecord(SettleBaseRequest request);

        bool HasFinalScoreAndSemicolonOnGoalRecord(SettleBaseRequest request);

        bool IsNullHalftimeScoreAndGoalRecord(SettleBaseRequest request);

        bool HasFinalScoreAndGoalRecord(SettleBaseRequest request);

        bool IsExistFirstGoalLastGoal(SettleBaseRequest request);

        bool IsRefundHalftime(SettleBaseRequest request);

        bool IsRefundFullTime(SettleBaseRequest request);
    }

    public class ValidationServiceImp : IValidationService
    {
        private const string RefundHalfTime = "Refund HT;";

        private const string RefundFullTime = "Refund FT;";

        private const string Abandoned2H = "Abandoned 2H;";

        public bool HasHalftimeScoreWithoutSemicolonOnGoalRecord(SettleBaseRequest request)
        {
            if (IsNullGoalRecord(request))
            {
                return false;
            }

            var hasHalftimeScore = request.HalfTimeAwayScore >= 0 || request.HalfTimeHomeScore >= 0;
            return hasHalftimeScore && !request.GoalRecord.Contains(";");
        }

        public bool HasHalftimeScoreWithSemicolonOnGoalRecord(SettleBaseRequest request)
        {
            if (IsNullGoalRecord(request))
            {
                return false;
            }

            var hasHalftimeScore = request.HalfTimeAwayScore >= 0 || request.HalfTimeHomeScore >= 0;
            return hasHalftimeScore && request.GoalRecord.Contains(";");
        }

        public bool IsNullScoreAndGoalRecord(SettleBaseRequest request)
        {
            var isNullHalftimeScore = IsNullHalftimeScore(request);
            var isNullFullTimeScore = IsNullFullTimeScore(request);
            var isEmptyAndWithoutSemicolon = IsNullOrOnlySemicolonOnGoalRecord(request);

            return isNullHalftimeScore && isNullFullTimeScore && isEmptyAndWithoutSemicolon;
        }

        public bool HasFinalScoreAndSemicolonOnGoalRecord(SettleBaseRequest request)
        {
            return HasFinalScoreAndGoalRecord(request) && !string.IsNullOrEmpty(request.GoalRecord.Replace(";", string.Empty));
        }

        public bool IsNullHalftimeScoreAndGoalRecord(SettleBaseRequest request)
        {
            var notInputHalftimeScore = !request.HalfTimeAwayScore.HasValue && !request.HalfTimeHomeScore.HasValue;
            var isEmptyAndWithoutSemicolon = IsNullOrOnlySemicolonOnGoalRecord(request);

            return notInputHalftimeScore && isEmptyAndWithoutSemicolon;
        }

        public bool HasFinalScoreAndGoalRecord(SettleBaseRequest request)
        {
            return HasFinalScore(request) && !IsNullGoalRecord(request);
        }

        public bool IsRefundHalftime(SettleBaseRequest request)
        {
            return request.ActionName.Equals(ActionType.CalculateFullTime)
                    && !string.IsNullOrEmpty(request.BetStatus)
                    && request.BetStatus.Contains(RefundHalfTime);
        }

        public bool IsRefundFullTime(SettleBaseRequest request)
        {
            return request.ActionName.Equals(ActionType.CalculateHalfTime)
                && !string.IsNullOrEmpty(request.BetStatus)
                && (request.BetStatus.Contains(RefundFullTime) || request.BetStatus.Contains(Abandoned2H));
        }

        public bool IsExistFirstGoalLastGoal(SettleBaseRequest request)
        {
            return request.IsExistFgLg || request.IsExistHtFgLg;
        }

        private static bool IsNullHalftimeScore(SettleBaseRequest request)
        {
            return (!request.HalfTimeAwayScore.HasValue && !request.HalfTimeHomeScore.HasValue)
                   || (request.HalfTimeAwayScore.Equals(0) && request.HalfTimeHomeScore.Equals(0));
        }

        private static bool IsNullFullTimeScore(SettleBaseRequest request)
        {
            return (!request.FinalAwayScore.HasValue && !request.FinalHomeScore.HasValue)
                   || (request.FinalAwayScore.Equals(0) && request.FinalHomeScore.Equals(0));
        }

        private static bool IsNullGoalRecord(SettleBaseRequest request)
        {
            return string.IsNullOrWhiteSpace(request.GoalRecord);
        }

        private static bool IsNullOrOnlySemicolonOnGoalRecord(SettleBaseRequest request)
        {
            return IsNullGoalRecord(request)
                   || (!IsNullGoalRecord(request) && string.IsNullOrEmpty(request.GoalRecord.Replace(";", string.Empty)));
        }

        private static bool HasFinalScore(SettleBaseRequest request)
        {
            return request.FinalAwayScore.HasValue || request.FinalHomeScore.HasValue;
        }
    }
}