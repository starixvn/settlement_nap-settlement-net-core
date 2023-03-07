using System;

namespace Settlement.Core.Models;

public class ChildMatch
{
    public int matchId { get; set; }

    public DateTime EventDate { get; set; }

    public string TicketStatus { get; set; }
}