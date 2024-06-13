using Fanex.Data;
using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Criteria;

public class GetSiteGroupCriteria : CriteriaBase
{
    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"Get_SiteDBGroupID_{DbServer}";

    public override bool IsValid() => !string.IsNullOrWhiteSpace(DbServer);
}