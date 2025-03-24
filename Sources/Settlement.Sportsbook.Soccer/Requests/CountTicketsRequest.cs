using System.Collections;

namespace Settlement.Sportsbook.Soccer.Requests;

public class CountTicketsRequest : IRequest<CountTicketResponse>
{
    public int MatchId { get; set; }
}


public class TicketGroupCount
{
    public string GroupResult { get; set; }
    public int TotalTicket { get; set; }
}


public class CountTicketResponse : IEnumerable<TicketGroupCount>
{
    private readonly List<TicketGroupCount> ticketGroups;

    public CountTicketResponse(List<TicketGroupCount> ticketGroups)
    {
        this.ticketGroups = ticketGroups;
    }

    public IEnumerator<TicketGroupCount> GetEnumerator()
        => ticketGroups.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}