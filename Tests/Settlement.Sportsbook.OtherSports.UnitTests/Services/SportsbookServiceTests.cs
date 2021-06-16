using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using NSubstitute;
using NUnit.Framework;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.NewCalculation.Criterias;
using Settlement.Sportsbook.NewCalculation.Requests;
using Settlement.Sportsbook.NewCalculation.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.NewCalculation.UnitTests.Services
{
    [TestFixture]
    public class SportsbookServiceTests
    {
        private SportsbookService service;

        [SetUp]
        public void SetUp()
        {
            Mapper.Reset();
            var config = new MapperConfigurationExpression();
            config.AddProfile<OtherSportsAutoMapper>();
            Mapper.Initialize(config);
        }

        [Test]
        public async Task GetMatch_Always_FetchAndReturnMatchDetailModel()
        {
            var repository = Substitute.For<IDynamicRepository>();
            var refDataService = Substitute.For<RefDataService>();
            service = new SportsbookServiceImp(repository, refDataService);
            var matchDetails = new List<MatchDetail>();
            matchDetails.Add(new MatchDetail());
            var fakeData = new ValueTuple<IEnumerable<MatchDetail>, IEnumerable<ResultDetail>, IEnumerable<TicketCountModel>>(matchDetails, new List<ResultDetail>(), new List<TicketCountModel>());
            repository.FetchMultipleAsync<MatchDetail, ResultDetail, TicketCountModel>(Arg.Any<GetSportsbookMatchDetailCriteria>()).Returns(fakeData);

            var result = await service.GetMatch(new GetMatchRequest());

            Assert.IsInstanceOf(typeof(MatchResultDetail), result);
        }
    }
}