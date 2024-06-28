using Settlement.Services;

namespace Settlement.Outright.Models;

public class OutrightLogDetail
{
    public IRefDataService RefDataService { get; set; }

    public long LogId { get; set; }

    public DateTime LogDate { get; set; }

    public string Username { get; set; }

    public string ActionNameEn { get; set; }

    public int LeagueId { get; set; }

    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public int TeamId { get; set; }

    public DateTime EventDate { get; set; }

    public string Result { get; set; } = string.Empty;

    public string Remark { get; set; }

    public string TeamName { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public string RemarkName
    {
        get
        {
            if (string.IsNullOrWhiteSpace(Remark))
            {
                return string.Empty; 
            }

            return int.TryParse(Remark, out _) ? $"Dead Heat({Remark})" : Remark;
        }
    } 
}