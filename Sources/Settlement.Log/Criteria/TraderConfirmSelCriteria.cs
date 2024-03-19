using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class TraderConfirmSelCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string ResourceIDs { get; set; }

    public override string GetSettingKey() => "NAP_Set_SettlementResultDetailHistory_TraderConfirmSel";

    public override bool IsValid() => MatchId > 0;
}