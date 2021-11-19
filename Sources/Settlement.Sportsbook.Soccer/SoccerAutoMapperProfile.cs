using AutoMapper;
using Settlement.Sportsbook.Soccer.Criterias;

namespace Settlement.Sportsbook.Soccer
{
    public class SoccerAutoMapperProfile : Profile
    {
        public SoccerAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
        }
    }
}