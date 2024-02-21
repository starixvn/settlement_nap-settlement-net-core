using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria;

public class UpdateHoldMatchSettingCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }
    public string HoldInfo { get; set; }

    public string ChildMatchList { get; set; } = string.Empty;

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string Ip { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_SettlementHoldMatch";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}