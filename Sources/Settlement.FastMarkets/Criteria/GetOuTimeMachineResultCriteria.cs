using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.Criteria;

public class GetOuTimeMachineResultCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_FastMarket_TotalGoalSequenceSel";

    public override bool IsValid() => MatchId > 0;
}