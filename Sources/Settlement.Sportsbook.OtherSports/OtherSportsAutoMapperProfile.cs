using AutoMapper;
using Settlement.Criteria;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports;

public class OtherSportsAutoMapperProfile : Profile
{
    public OtherSportsAutoMapperProfile()
    {
        CreateMap<GetMatchRequest, GetSportsbookMatchDetailCriteria>();
        CreateMap<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>();
        CreateMap<GetLatestResultRequest, GetLatestResultCriteria>();
        CreateMap<CalculateCriteria, InsertLogCriteria>();
    }
}