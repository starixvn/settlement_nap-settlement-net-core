using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class AioServiceTests
    {
        private readonly IDynamicRepository repository;
        private readonly PermissionService permissionService;
        private readonly IRefDataService refDataService;
        private readonly ICreateQueryService createQueryService;
        private readonly IMapperFactory mapperFactory;
        private readonly IValidateApiKeyService validateApiKeyService;
        private readonly IAioService service;
        private readonly Microsoft.Extensions.Configuration.IConfiguration configuration;

        public AioServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            permissionService = Substitute.For<PermissionService>(null, null, null, null);
            refDataService = Substitute.For<IRefDataService>();
            createQueryService = Substitute.For<ICreateQueryService>();
            mapperFactory = Substitute.For<IMapperFactory>();
            validateApiKeyService = Substitute.For<IValidateApiKeyService>();
            configuration = Substitute.For<Microsoft.Extensions.Configuration.IConfiguration>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SportsbookAioAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new AioService(repository, permissionService, refDataService, mapper,
                                    mapperFactory, validateApiKeyService, createQueryService, configuration);
        }

        [Fact]
        public async Task GetRecalResult_Always_ReturnResultDetailList()
        {
            var request = new GetRecalResultRequest();
            repository.FetchAsync<MatchResultDetail>(Arg.Any<GetRecalResultCriteria>()).Returns(new List<MatchResultDetail> { new MatchResultDetail() });

            var actual = await service.GetRecalResult(request);

            Assert.Single(actual);
        }

        [Fact]
        public async Task GetMatch_Always_ReturnsExpectedMatchModel()
        {
            // Arrange
            var request = new GetMatchRequest();

            var fakeMatch = new Models.MatchDetail { MatchId = 1 };
            repository.GetAsync<Models.MatchDetail>(Arg.Any<ICriteria>()).Returns(fakeMatch);

            var listResultDetial = new List<Models.ResultDetail> {
                new Models.ResultDetail { ResourceId="00" }
            };

            var tuple = ValueTuple.Create<IEnumerable<Models.ResultDetail>, IEnumerable<TicketCounts>>(listResultDetial, new List<TicketCounts>());

            repository.FetchMultipleAsync<Models.ResultDetail, TicketCounts>(Arg.Any<ICriteria>()).Returns(tuple);

            // Act
            var result = await service.GetMatch(request);

            // Assert
            var expectedModel = new AioMatch
            {
                MatchDetail = fakeMatch,
                ResultDetails = listResultDetial,
                HedgeMatchDetail = new HedgeMatchDetail(),
                TicketCounts = new TicketCounts(),
                Permission = new Permission(),
                ExternalResults = new List<ExternalResultModel>()
            };

            Assert.Equal(expectedModel.MatchDetail.MatchId, result.MatchDetail.MatchId);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task Settle_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria());
            repository.ExecuteAsync(Arg.Do<SettleCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            var actual = await service.Settle(new SettleRequest());

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task RefundParlay_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            createQueryService.QueryRefundParlay(Arg.Any<RefundParlayRequest>()).Returns(new RefundParlayCriteria());
            repository.ExecuteAsync(Arg.Do<RefundParlayCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            var actual = await service.RefundParlay(new RefundParlayRequest());

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task CheckMarkedTickets_Always_ReturnCorrectResult(bool result)
        {
            repository.ExecuteAsync(Arg.Do<CheckMarkedTicketsCriteria>(x =>
            {
                x.IsExistMarkedTicket = result;
            })).Returns(1);
            var request = new CheckMarkedTicketsRequest
            {
                MatchId = 12345,
                SelectedResources = new List<ResourceItem>
                {
                    new ResourceItem
                    {
                        ResourceId = "00"
                    }
                }
            };

            var actual = await service.CheckMarkedTickets(request);

            Assert.Equal(result, actual.IsExistMarkedTicket);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task VerifyNoRunningOdds_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            repository.ExecuteAsync(Arg.Do<VerificationCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            var actual = await service.VerifyNoRunningOdds(new CheckRunningOddsRequest());

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task SaveScore_Always_CallInOrderAllRelatedMethods(int errorCode, string errorMsg, bool result)
        { 
            createQueryService.QuerySaveScore(Arg.Any<SaveScoreRequest>()).Returns(new SaveScoreRequest());
            validateApiKeyService.CreateNonQueryCommand(Arg.Any<SaveScoreRequest>(), Arg.Any<string>()).Returns(new SaveScoreCriteria());

            repository.ExecuteAsync(Arg.Do<SaveScoreCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            var actual = await service.SaveScore(new SaveScoreRequest());

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task CheckMarkedTicketsParlay_Always_ReturnCorrectResult(bool result)
        {
            repository.ExecuteAsync(Arg.Do<CheckMarkedTicketsParlayCriteria>(x =>
            {
                x.IsExistMarkedTicket = result;
            })).Returns(1);

            var actual = await service.CheckMarkedTicketsParlay(new CheckMarkedTicketsParlayRequest());

            Assert.Equal(result, actual.IsExistMarkedTicket);
        }

    }
}