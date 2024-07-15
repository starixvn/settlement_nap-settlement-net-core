using Settlement.Core.Constants;

namespace Settlement.Log.Models;

public class ResultLog
{
    private string sourceName;

    private const string Dash = "-";
    private string remark;

    public string ResourceId { get; set; }

    public string ResourceName { get; set; } = string.Empty;

    public string SourceName
    {
        get => string.IsNullOrWhiteSpace(sourceName) ? Dash : sourceName;
        set => sourceName = value;
    }

    public DateTime CreateDate { get; set; }

    public string HomeValue { get; set; }

    public string AwayValue { get; set; }

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

    public int AutoPayoutStatus { get; set; }

    public string Remark
    {
        get
        {
            return AutoPayoutStatus switch
            {
                CalculateStatus.IsFailed => remark,
                CalculateStatus.IsSuccess => "success",
                _ => Dash,
            };
        }

        set => remark = value;
    }

    public string Action { get; set; }
}