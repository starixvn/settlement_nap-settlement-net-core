using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;
using Settlement.Sportsbook.OtherSports.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services
{
    public class SportsbookServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly SportsbookService service;

        private readonly IRefDataService refDataService;

        public SportsbookServiceTests()
        {
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            repository = Substitute.For<IDynamicRepository>();
            refDataService = Substitute.For<IRefDataService>();
            service = new SportsbookServiceImp(repository, refDataService, mapper);
        }

        [Fact]
        public async Task GetMatch_Always_FetchAndReturnMatchDetailModel()
        {
            var matchDetails = new List<MatchDetail>();
            matchDetails.Add(new MatchDetail());
            var fakeData = new ValueTuple<IEnumerable<MatchDetail>, IEnumerable<ResultDetail>, IEnumerable<TicketCounts>>(matchDetails, new List<ResultDetail>(), new List<TicketCounts>());
            repository.FetchMultipleAsync<MatchDetail, ResultDetail, TicketCounts>(Arg.Any<GetSportsbookMatchDetailCriteria>()).Returns(fakeData);

            var result = await service.GetMatch(new GetMatchRequest());

            Assert.IsType<MatchResultDetail>(result);
        }
    }
}