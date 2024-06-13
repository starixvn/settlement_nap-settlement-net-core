namespace Fanex.Settlement.ScaleOut.Request;

public class UpdateMatchInfoRequest
{
	public int MatchId { get; set; }

	public int AdminId { get; set; }

	public string Action { get; set; }

	public string Mode { get; set; }

	public bool IsAuto { get; set; }

	public int? FullTimeHome { get; set; }

	public int? FullTimeAway { get; set; }

	public int? HalfTimeHome { get; set; }

	public int? HalfTimeAway { get; set; }

	public string GoalRecord { get; set; }

	public string BetStatus { get; set; }

	public string ResourceResult { get; set; }

	public string SelectedResources { get; set; }

	public string SelectedMarket { get; set; }

	public string SelectedSelection { get; set; }

	public string Results { get; set; }

	public string EventCounters { get; set; }

	public bool IsSettleDetermined { get; set; }

	public int SDTRecord { get; set; }

	public bool IsHtTicketSettled { get; set; }

	public int DeterminedType { get; set; }
}