using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.Aio.Models;

public class FantasyMatch
{
    public FantasyMatchDetail FantasyMatchDetail { get; set; }

    public List<RelatedMatch> RelatedMatches { get; set; }
}

public class RelatedMatch
{
    public int MatchId { get; set; }
    public string MatchCode { get; set; }

    public string HomeName { get; set; }

    public string AwayName { get; set; }
    public int HomeId { get; set; }

    public int AwayId { get; set; }

    public DateTime KickOffTime { get; set; }

    public RemarkSettingModel Remark { get; set; }

    public List<RelatedMatchResult> Results { get; set; }

    public byte SettlementStatus { get; set; }
    public string BetStatus { get; set; }
    public string EventStatus { get; set; }
    public bool IsDeleted { get; set; }
}

public class RelatedMatchResult
{
    public string ResourceId { get; set; }
    public string HomeValue { get; set; }
    public string AwayValue { get; set; }
    public byte? ResultStatusId { get; set; }
    public byte SettlementStatusId { get; set; }
}