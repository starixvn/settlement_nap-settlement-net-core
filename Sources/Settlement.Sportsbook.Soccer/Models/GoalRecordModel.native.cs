namespace Settlement.Sportsbook.Soccer.Models;

public class GoalRecordModel
{
    public bool IsExistFgLg { get; set; }

    public bool IsExistHtFgLg { get; set; }

    public bool IsExistHalfTime { get; set; }

    public bool IsExistRefundHt { get; set; }

    public bool IsExistFgNg { get; set; }

    public string FirstGoal { get; set; }

    public string LastGoal { get; set; }

    private string HalftimeBetStatusNotExistRefundHt => IsExistHtFgLg ? $"1FL:{FirstGoal}-{LastGoal};" : string.Empty;

    public string HalftimeBetStatus
    {
        get
        {
            if (IsExistRefundHt)
            {
                return IsExistHalfTime ? $"{Settlement.Constants.BetStatus.RefundHt};1FL:{FirstGoal}-{LastGoal};" : $"{Settlement.Constants.BetStatus.RefundHt};";
            }

            return HalftimeBetStatusNotExistRefundHt;
        }
    }

    public string FullTimeBetStatus => IsExistFgLg || IsExistFgNg ? $"FL:{FirstGoal}-{LastGoal};" : string.Empty;

    public string BetStatus => $"{HalftimeBetStatus}{FullTimeBetStatus}";
}