using AutoMapper;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets;

public class SportsbookMoveTicketAutoMapperProfile : Profile
{
    public SportsbookMoveTicketAutoMapperProfile()
    {
        CreateMap<GetMatchRequest, SportsbookCriteria>();
        CreateMap<GetMoveTicketsMatchesRequest, GetMoveTicketsMatchesCriteria>();
        CreateMap<ValidateMatchesRequest, ValidateMatchesCriteria>().ForMember(dest => dest.DestinationMatchId, map => map.MapFrom(src => src.TargetMatchId));
        CreateMap<MoveRunningTicketsRequest, MoveRunningTicketsCriteria>();
    }
}