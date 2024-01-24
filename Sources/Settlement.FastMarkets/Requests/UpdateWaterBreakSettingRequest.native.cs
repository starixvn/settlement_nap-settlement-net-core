using Settlement.Core.Models;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests;

public class UpdateWaterBreakSettingRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public WaterBreakModel WaterBreakDetail { get; set; }

    public int ActionId { get; set; }

    public string Remark { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }
}