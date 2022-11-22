namespace Settlement.EventManagement.Criteria;

public class ValidateCalculateParlayCriteria : NonQueryCommand
{
    public string MatchIds { get; set; }

    public string Action { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string MatchIdsValid { get; set; }

    public string MatchIdsInvalid { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Admin_Settlement_Validation_MP";
    }

    public override bool IsValid()
    {
        return MatchIds.Length > 0;
    }
}