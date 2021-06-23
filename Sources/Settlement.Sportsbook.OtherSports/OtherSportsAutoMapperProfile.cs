using AutoMapper;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;
using System;

namespace Settlement.Sportsbook.OtherSports
{
    public class OtherSportsAutoMapperProfile : Profile
    {
        public OtherSportsAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetSportsbookMatchDetailCriteria>();
            CreateMap<CalculateRequest, CalculateCriteria>();
            CreateMap<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>();
            CreateMap<RefundRequest, RefundAllCriteria>();
            CreateMap<RefundParlayRequest, ParlayCriteria>();
            CreateMap<GetLastestResultRequest, GetLastestResultCriteria>();
        }
    }
}