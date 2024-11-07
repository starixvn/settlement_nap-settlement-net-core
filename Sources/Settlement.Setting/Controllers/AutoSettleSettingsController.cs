using Fanex.Data.Repository;
using Microsoft.AspNetCore.Mvc;

namespace Settlement.Setting.Controllers;

[ApiController]
[Route("api/auto-settle-settings")]
public class AutoSettleSettingsController : ControllerBase
{
    private readonly IDynamicRepository _repository;

    public AutoSettleSettingsController(IDynamicRepository repository)
    {
        _repository = repository;
    }

    public async Task GetSettings(AutoSettleSettingsQuery query)
    {
        ICriteria criteria = query.TypeObject == "League"
            ? new AutoSettleLeagueSettingSelCriteria
            {
                LeagueId = query.LeagueId,
                SportType = query.SportType
            }
            : new AutoSettleMatchSettingSelCriteria
            {
                LeagueId = query.LeagueId,
                MatchId = query.MatchId,
                SportType = query.SportType
            };
    }
}



public class AutoSettleSetting
{
    public string TypeObject { get; set; } // "League" hoặc "Match"
    public string TypeSettle { get; set; } // "Payout" hoặc "Refund"
    public string TypeResult { get; set; } // "Main" hoặc "Early"
    public bool Enabled { get; set; }
    public int WaitingTime { get; set; }
    public bool IsTraderRequired { get; set; }
    public int MinProvider { get; set; }
    public List<Provider> Providers { get; set; }
}


public class Provider
{
    public int SourceId { get; set; }
    public string SourceName { get; set; }
    public int Priority { get; set; }
}


public class AutoSettleMatchSettingSelCriteria : ICriteria

{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public short SportType { get; set; }
    public byte AutoType { get; set; } = 6;

    public string GetSettingKey()
    {
        throw new NotImplementedException();
    }

    public bool IsValid()
    {
        throw new NotImplementedException();
    }
}

public class AutoSettleLeagueSettingSelCriteria : ICriteria
{
    public int LeagueId { get; set; }
    public short SportType { get; set; }
    public byte AutoType { get; set; } = 6;

    public string GetSettingKey()
    {
        throw new NotImplementedException();
    }

    public bool IsValid()
    {
        throw new NotImplementedException();
    }
}


public class AutoSettleSettingsQuery
{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public short SportType { get; set; }
    public string TypeObject { get; set; }
}


public class Temp
{
    public int LeagueId { get; set; }
    public int? MatchId { get; set; }

    public int Main_WaitingTime { get; set; }

    public int EAR_WaitingTime { get; set; }

    public string Main_InactiveProvider { get; set; }

    public string EAR_InactiveProvider { get; set; }

    public bool Main_HasTrader { get; set; }

    public int Main_NumberProvider { get; set; }

    public string Main_PrimaryProvider { get; set; }

    public string Main_SecondaryProvider { get; set; }

    public bool EAR_HasTrader { get; set; }

    public int EAR_NumberProvider { get; set; }

    public string EAR_PrimaryProvider { get; set; }

    public string EAR_SecondaryProvider { get; set; }

    public string LeagueName { get; set; }
}