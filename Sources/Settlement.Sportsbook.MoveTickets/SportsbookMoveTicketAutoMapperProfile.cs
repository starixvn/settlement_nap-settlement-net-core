using AutoMapper;
using Settlement.Sportsbook.MoveTickets.Criterias;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets
{
    public class SportsbookMoveTicketAutoMapperProfile : Profile
    {
        public SportsbookMoveTicketAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, SportsbookCriteria>();
            CreateMap<MoveTicketRequest, MoveTicketCriteria>();
        }
    }
}