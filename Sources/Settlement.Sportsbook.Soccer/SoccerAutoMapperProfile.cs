using AutoMapper;
using Settlement.Sportsbook.Soccer.Criterias;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer
{
    public class SoccerAutoMapperProfile : Profile
    {
        public SoccerAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
            CreateMap<GetLastestMatchDetailRequest, GetLastestMatchDetailCriteria>();
            CreateMap<CheckStatusRequest, CheckStatusCriteria>()
                .ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.ActionName));
            CreateMap<SettleRequest, GoalCondition>();
            CreateMap<InstantCalculationRequest, PushInstantCalculationCriteria>();
        }
    }
}