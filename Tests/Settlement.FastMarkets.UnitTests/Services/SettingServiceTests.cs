using Fanex.Data.Repository;
using Kaden.XmlConverter;
using NSubstitute;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System.Threading.Tasks;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using AutoMapper.Configuration;
using AutoMapper;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Services
{
    public class SettingServiceTests
    {
        private readonly IDynamicRepository dynamicRepository;
        private readonly ISettingService service;
        private readonly XmlConvertService xmlConvertService;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;

        public SettingServiceTests()
        {
            dynamicRepository = Substitute.For<IDynamicRepository>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            service = new SettingServiceImp(dynamicRepository, xmlConvertService, mapper, currentSession, accessor);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task UpdateSettingMatch_Always_ReturnsWithErrorCodeAndErrorMsgFromDynamicRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            var query = new SettingMatchRequest();
            dynamicRepository.ExecuteAsync(Arg.Do<UpdateSettingMatchCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            })).Returns(1);

            // Act
            var result = await service.UpdateSettingMatch(query);

            // Assert
            Assert.Equal(expected, result.IsSuccessful);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task UpdateSettingLeague_Always_ReturnsWithErrorCodeAndErrorMsgFromDynamicRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            var query = new SettingLeagueRequest();
            dynamicRepository.ExecuteAsync(Arg.Do<UpdateSettingLeagueCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            })).Returns(1);

            // Act
            var result = await service.UpdateSettingLeague(query);

            // Assert
            Assert.Equal(expected, result.IsSuccessful);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task UpdateWaterBreakSetting_Always_ReturnsWithErrorCodeAndErrorMsgFromDynamicRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            var query = new UpdateWaterBreakSettingRequest();
            dynamicRepository.ExecuteAsync(Arg.Do<UpdateWaterBreakSettingCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            })).Returns(1);

            // Act
            var result = await service.UpdateWaterBreakSetting(query);

            // Assert
            Assert.Equal(expected, result.IsSuccessful);
        }
    }
}