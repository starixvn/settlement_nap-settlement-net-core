using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Criteria;

public class GetResourceIndexCriteria : CriteriaBase
{
    public int SportType { get; set; }

    public override string GetSettingKey() => "NAP_Admin_MajorRound_Sel";

    public override bool IsValid() => SportType > 0;
}