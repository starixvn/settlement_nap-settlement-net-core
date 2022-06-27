using AutoMapper;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports
{
    public class OtherSportsAutoMapperProfile : Profile
    {
        public OtherSportsAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetSportsbookMatchDetailCriteria>();
            CreateMap<CalculateRequest, CalculateCriteria>().ForMember(dest => dest.FullTimeHome, map => map.MapFrom(src => src.FinalHomeScore))
                .ForMember(dest => dest.FullTimeAway, map => map.MapFrom(src => src.FinalAwayScore))
                .ForMember(dest => dest.HalfTimeHome, map => map.MapFrom(src => src.HalfTimeHomeScore))
                .ForMember(dest => dest.HalfTimeAway, map => map.MapFrom(src => src.HalfTimeAwayScore));
            CreateMap<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>();
            CreateMap<RefundRequest, RefundCriteria>().ForMember(dest => dest.FullTimeHome, map => map.MapFrom(src => src.FinalHomeScore))
                .ForMember(dest => dest.FullTimeAway, map => map.MapFrom(src => src.FinalAwayScore));
            CreateMap<RefundParlayRequest, ParlayCriteria>();
            CreateMap<GetLastestResultRequest, GetLastestResultCriteria>();
        }
    }
}