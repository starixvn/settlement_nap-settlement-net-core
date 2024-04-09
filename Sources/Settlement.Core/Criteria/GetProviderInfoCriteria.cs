using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class GetProviderInfoCriteria : CriteriaBase
{
    public int SportType { get; set; }

    public int LeagueId { get; set; }

    public override string GetSettingKey() => "NAP_Set_AutoPayout_SourceInfo_Sel";

    public override bool IsValid() => SportType > 0;
}