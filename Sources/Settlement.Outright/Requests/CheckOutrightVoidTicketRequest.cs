using MediatR;

namespace Settlement.Outright.Requests;
public class CheckOutrightVoidTicketRequest : IRequest<bool>
{
    public int Orid { get; set; }
}
