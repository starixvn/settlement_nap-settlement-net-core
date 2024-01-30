using Settlement.Core.Constants;

namespace Settlement.Log.Models;

public class ResultLog
{
    private string sourceName;

    private const string Dash = "-";

    public string ResourceId { get; set; }

    public string ResourceName { get; set; }

    public string SourceName
    {
        get => string.IsNullOrWhiteSpace(sourceName) ? Dash : sourceName;
        set => sourceName = value;
    }

    public DateTime CreateDate { get; set; }

    private string HomeValue { get; set; }

    private string AwayValue { get; set; }

    public string ResultValue
    {
        get
        {
            if (string.IsNullOrWhiteSpace(HomeValue) && string.IsNullOrWhiteSpace(AwayValue))
            {
                return Dash;
            }

            if (!string.IsNullOrWhiteSpace(HomeValue) && !string.IsNullOrWhiteSpace(AwayValue))
            {
                return $"{HomeValue}{Dash}{AwayValue}";
            }

            return !string.IsNullOrWhiteSpace(HomeValue) ? HomeValue : AwayValue;
        }
    }

    private int AutoPayoutStatus { get; set; }

    public string Remark
    {
        get
        {
            if (AutoPayoutStatus == CalculateStatus.IsSuccess)
            {
                return "Success";
            }

            return AutoPayoutStatus == CalculateStatus.IsFailed ? "Failed" : Dash;
        }
    }
}