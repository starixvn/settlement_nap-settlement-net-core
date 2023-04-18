using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;
public class OutrightVoidTicketCriteria : CriteriaBase
{
    public int Orid { set; get; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_OutrightCheckTicketVoid_{DbServer}";
    }
    public override bool IsValid() => Orid != 0;
}
