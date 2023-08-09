using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Criteria.Basketball;

public class GetFantasyMatchCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_FantasyMatchOSSel";

    public override bool IsValid() => MatchId > 0;
}