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
        private readonly IDynamicRepository repository;
        private readonly ISettingService service;

        public SettingServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            var xmlConvertService = Substitute.For<XmlConvertService>();
            var currentSession = Substitute.For<INapSession>();
            var accessor = Substitute.For<IHttpContextAccessor>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            var context = new DefaultHttpContext
            {
                Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
            };
            accessor.HttpContext = context;
            service = new SettingServiceImp(repository, xmlConvertService, mapper, currentSession, accessor);
        }
        
        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task UpdateWaterBreakSetting_Always_ReturnsWithErrorCodeAndErrorMsgFromDynamicRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            var query = new UpdateWaterBreakSettingRequest();
            await repository.ExecuteAsync(Arg.Do<UpdateWaterBreakSettingCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            }));

            // Act
            var result = await service.UpdateWaterBreakSetting(query);

            // Assert
            Assert.Equal(expected, result.IsSuccessful);
        }
    }
}