namespace Settlement.Core.Models;

public class ResourceTicketStatistic
{
    public int TotalEarlyTicket { get; set; }
    public int TotalEarlyRunningTicket { get; set; }
    public int TotalWaitingTicket { get; set; }
    public int TotalRunningTicket { get; set; }
    public int TotalMarkedTicket { get; set; }
    public int MatchId { get; set; }
    public int ParentId { get; set; }
    public byte ChildMatchType { get; set; }
    public bool IsEarly { get; set; }
    public bool IsOverFilter { get; set; }
    public string ResourceId { get; set; } = string.Empty;
}

public class MatchTicketStatistic
{
    public int MatchId { get; set; }
    public string SuspenderHalfTime { get; set; }
    public string SuspenderFullTime { get; set; }
    public int? IsCalculatingSingle { get; set; }
    public int? IsCalculatingMP { get; set; }
    public bool IsExistEarlyBetTypes { get; set; }
    public bool IsWaitingEarlyBetTypes { get; set; }
    public bool IsExistRunningTicket { get; set; }
    public bool IsRunningEarlyBetTypes { get; set; }
    public bool IsExistMarkedTicket { get; set; }
}