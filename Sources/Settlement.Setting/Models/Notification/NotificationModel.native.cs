using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Text.Json.Serialization;

namespace Settlement.Setting.Models.Notification;

public class NotificationModel
{
    private IEnumerable<VoidBetInfo> voidBetInfos;

    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

    public int HomeId { get; set; }

    public string HomeName => RefDataService.GetTeamName(HomeId);

    public int AwayId { get; set; }

    public string AwayName => RefDataService.GetTeamName(AwayId);

    public string MatchCode { get; set; }

    public int MatchId { get; set; }

    public string Action { get; set; }

    public string Message { get; set; }

    public DateTime StartTime { get; set; }

    public string StartDate
    {
        get
        {
            var date = StartTime.ToString("MMMM dd, yyyy");
            var time = StartTime.ToString("h:mm ttt");
            return $"{date} at {time}";
        }
    }

    public int SportType { get; set; }

    public IEnumerable<VoidBetInfo> VoidBetInfos
    {
        get => voidBetInfos ?? new List<VoidBetInfo>();

        set => voidBetInfos = value;
    }
}