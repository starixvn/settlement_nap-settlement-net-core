using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Criteria.Cricket;

public class ResultHistoryInsCriteria : NonQueryCommand
{
    public string SessionID { get; set; }
    public int MatchId { get; set; }
    public int SportType { get; set; }
    public short ResultType { get; set; } = 1;
    public string ResourceInfo { get; set; }

    public override string GetSettingKey() => "NAP_SettlementResultHistory_Ins";

    public override bool IsValid() => MatchId > 0;
}