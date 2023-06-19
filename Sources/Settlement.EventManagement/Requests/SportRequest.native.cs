namespace Settlement.EventManagement.Requests;

public class SportRequest : IRequest<List<Sport>>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }
}