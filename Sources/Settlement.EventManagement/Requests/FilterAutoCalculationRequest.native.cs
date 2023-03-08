namespace Settlement.EventManagement.Requests;

using Models.Calculation;

public class FilterAutoCalculationRequest : IRequest<CalculationLeagues>
{
    private string autoSetting;
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string MatchCode { get; set; }

    public int LeagueId { get; set; }

    public byte StatusId { get; set; }

    public bool IsHtOverOnly { get; set; }

    public bool IsOverOnly { get; set; }

    public bool IsUnCalculate { get; set; }

    public bool IsInstant { get; set; }

    public bool IsMarkedTicket { get; set; }

    public string AutoSetting
    {
        get => autoSetting ?? string.Empty;

        set => autoSetting = value;
    }

    public byte FilterBy
    {
        get
        {
            const byte noneFilter = 0;
            const byte unCalculateFilter = 1;

            return IsUnCalculate ? unCalculateFilter : noneFilter;
        }
    }
}