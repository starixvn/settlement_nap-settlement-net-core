using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Criteria.Cricket;

public class CheckReSettleCriteria : CriteriaBase
{
    public int MatchId { get; set; }
    public string Action { get; set; }
    public string SelectedResources { get; set; }

    public override string GetSettingKey() => "NAP_SettlementLog_CheckReSettle";

    public override bool IsValid() => MatchId > 0;
}