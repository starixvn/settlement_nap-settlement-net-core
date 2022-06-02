using System.Linq;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Kaden.XmlConverter;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Services;
using System.Threading.Tasks;
using AutoFixture;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Xunit;

namespace Settlement.ThirdPartyProducts.UnitTests.Services
{
    public class BetBuilderServiceTests
    {
        private readonly IDynamicRepository repository;


        private readonly BetBuilderService service;

        public BetBuilderServiceTests()
        {
            var refDataService = Substitute.For<IRefDataService>();
            repository = Substitute.For<IDynamicRepository>();
            var xmlConvertService = Substitute.For<XmlConvertService>();
            var currentSession = Substitute.For<INapSession>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            var accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext
            {
                Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
            };
            accessor.HttpContext = context;
            service = new BetBuilderServiceImp(repository, refDataService, xmlConvertService, currentSession, accessor, mapper);
        }

        [Fact]
        public async Task GetSports_Always_ReturnsNotNull()
        {
            // Arrange
            var fixture = new Fixture();
            var fakeSports = fixture.CreateMany<Sport>(2).ToList();
            repository.FetchAsync<Sport>(Arg.Any<SportCriteria>()).Returns(fakeSports);

            // Act
            var sports = await service.GetSports(new SportRequest());

            // Assert
            Assert.True(sports.Count == 2);
        }

        [Fact]
        public async Task GetLeagues_Always_ReturnsNotNull()
        {
            // Arrange
            var fixture = new Fixture();
            var fakeLeagues = fixture.CreateMany<LeagueTypeModel>(3).ToList();
            repository.FetchAsync<LeagueTypeModel>(Arg.Any<LeaguesCriteria>()).Returns(fakeLeagues);

            // Act
            var leagues = await service.GetLeagues(new LeaguesRequest());

            // Assert
            Assert.True(leagues.Count == 3);
        }

        [Fact]
        public async Task GetSelection_Always_ReturnsNotNull()
        {
            // Arrange
            var fixture = new Fixture();
            var fakeSelection = fixture.CreateMany<SelectionDetailModel>(4).ToList();
            repository.FetchAsync<SelectionDetailModel>(Arg.Any<SelectionDetailCriteria>()).Returns(fakeSelection);

            // Act
            var selection = await service.GetSelection(1);

            // Assert
            Assert.True(selection.Count == 4);
        }

        [Fact]
        public async Task Calculate_Always_ReturnsResult()
        {
            // Arrange
            var fixture = new Fixture();
            var resources = fixture.CreateMany<ResourcesItemModel>(2).ToList();

            var request = new CalculateRequest
            {
                Resources = resources
            };

            await repository.ExecuteAsync(Arg.Do<CalculationCriteria>(x => { x.ErrCode = 0; }));

            // Act
            var result = await service.Calculate(request);

            // Assert
            Assert.NotNull(result);
        }
    }
}