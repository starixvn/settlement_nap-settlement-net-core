namespace Settlement.Sportsbook.Aio.Criteria.Cricket;

public class UpdateStatusServiceCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int ServiceType { get; } = 1;

    public string Action { get; set; }

    public string ServiceCommand { get; set; }

    public byte ServiceStatus { get; set; } = Constants.Cricket.ServiceStatus.Finished;

    public string Reason { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public bool IsAuto { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public int SiteDbGroupId { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Admin_Settlement_50_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}