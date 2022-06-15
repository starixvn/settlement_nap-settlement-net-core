using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using NSubstitute;
using Settlement.Setting;
using Settlement.Setting.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Xunit;

namespace Settlement.Setting.UnitTests.Services
{
    public class SettingServiceTests
    {
        private readonly SettingService service;
        private readonly IDynamicRepository repository;

        public SettingServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            var currentSession = Substitute.For<INapSession>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SettingAutoMapperProfile>();
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

            service = new SettingServiceImp(repository, currentSession, accessor, mapper);
        }

        [Fact]
        public async Task UpdateSettingLeague_Always_ReturnsResultFromRepositoryExecute()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            var query = new SettingLeagueRequest();
            await repository.ExecuteAsync(Arg.Do<UpdateSettingLeagueCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));

            // Act
            var result = await service.UpdateSettingLeague(query);

            // Assert
            Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        }

        [Fact]
        public async Task UpdateSettingMatch_Always_ReturnsResultFromRepositoryExecute()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            var query = new SettingMatchRequest();
            repository.ExecuteAsync(Arg.Do<UpdateSettingMatchCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            // Act
            var result = await service.UpdateSettingMatch(query);

            // Assert
            Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        }

        [Fact]
        public async Task GetRemarkInfo_Always_ReturnsMatchInfoFromRepositoryGet()
        {
            // Arrange
            var matchInfo = new RemarkQueryModel();
            repository.GetAsync<RemarkQueryModel>(Arg.Any<GetRemarkInfoCriteria>()).Returns(matchInfo);

            // Act
            var result = await service.GetRemarkInfo(1);

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task UpdateRemarkSetting_Always_InvokeExecute()
        {
            // Arrange
            var query = new UpdateRemarkRequest();
            await repository.ExecuteAsync(Arg.Any<UpdateRemarkCriteria>());

            // Act
            await service.UpdateRemarkSetting(query);

            // Assert
            await repository.Received(1).ExecuteAsync(Arg.Any<UpdateRemarkCriteria>());
        }

        [Fact]
        public async Task UpdateTimeSettingLeague_Always_InvokeExecute()
        {
            // Arrange
            var query = new TimeSettingRequest();
            await repository.ExecuteAsync(Arg.Any<UpdateRemarkCriteria>());

            // Act
            await service.UpdateTimeSettingLeague(query);

            // Assert
            await repository.Received(1).ExecuteAsync(Arg.Any<UpdateTimeSettingLeagueCriteria>());
        }
    }
}