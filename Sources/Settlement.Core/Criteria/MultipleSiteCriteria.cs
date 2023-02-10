using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class MultipleSiteCriteria : CriteriaBase
{
    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        throw new NotImplementedException();
    }

    public override bool IsValid()
    {
        throw new NotImplementedException();
    }
}