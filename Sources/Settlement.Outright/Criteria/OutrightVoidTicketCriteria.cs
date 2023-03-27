using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;
public class OutrightVoidTicketCriteria : CriteriaBase
{
    public int Orid { set; get; }
    public override string GetSettingKey() => "NAP_Set_OutrightCheckTicketVoid";
    public override bool IsValid() => Orid != 0;
}
