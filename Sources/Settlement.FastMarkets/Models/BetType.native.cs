using Settlement.Core.Services;
using System.Text.Json.Serialization;

namespace Settlement.FastMarkets.Models;

public class BetType
{
    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

    public int BetTypeId { get; set; }

    public string BetTypeName => RefDataService != null ? RefDataService.GetBetTypeName(BetTypeId) : string.Empty;

    public ResultItemLabel ResultName { get; set; }

    public bool Checked { get; set; }

    public List<FastMarketResult> FastMarketResults { get; set; }
}