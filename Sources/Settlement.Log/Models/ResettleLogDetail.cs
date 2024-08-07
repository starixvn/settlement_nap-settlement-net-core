namespace Settlement.Log.Models;

public class ResettleLogDetail
{
    public string SettlementDate { get; set; }

    public string UserName { get; set; }

    public string Action { get; set; }

    public string ResourceId { get; set; }

    public string ResourceName { get; set; }

    public string BetType { get; set; }

    public string HomeValue { get; set; }

    public string AwayValue { get; set; }

    public string OtherInfo { get; set; }
}