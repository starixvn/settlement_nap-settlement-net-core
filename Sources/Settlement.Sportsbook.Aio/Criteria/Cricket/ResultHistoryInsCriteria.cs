using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Criteria.Cricket;

public class ResultHistoryInsCriteria : CriteriaBase
{
    public string SessionID { get; set; }
    public int MatchId { get; set; }
    public int SeqNo { get; set; }
    public string WrongResult { get; set; }
    public string ActualResult { get; set; }
    public int SportType { get; set; }
    public string ExtraInfo { get; set; }

    public override string GetSettingKey() => "NAP_SettlementResultHistory_Ins";

    public override bool IsValid() => MatchId > 0;
}