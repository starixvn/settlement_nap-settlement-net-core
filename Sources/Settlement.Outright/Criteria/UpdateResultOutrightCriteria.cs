using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class UpdateResultOutrightCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string Status { get; set; }

    public string Action { get; set; }

    public DateTime? EventDate { get; set; }

    public bool IsDeadheat { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Admin_Outright_Update";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}