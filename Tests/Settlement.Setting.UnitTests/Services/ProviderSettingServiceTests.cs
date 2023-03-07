using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Settlement.Setting.Criteria;
using Settlement.Setting.Criteria.ProviderManager;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.ProviderManager;

namespace Settlement.Setting.UnitTests.Services;

public class ProviderSettingServiceTests
{
    private readonly ProviderSettingService service;

    private readonly IDynamicRepository repository;

    public ProviderSettingServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var xmlConvertService = Substitute.For<XmlConvertService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SettingAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        service = new ProviderSettingServiceImp(repository, xmlConvertService, mapper);
    }

    [Fact]
    public async Task GetProvider_Always_FetchProviderSources()
    {
        var fakeSources = new List<ProviderModel>
        {
            new ProviderModel { SourceId = 1 },
            new ProviderModel { SourceId = 2 },
            new ProviderModel { SourceId = 3 },
        };

        repository.FetchAsync<ProviderModel>(Arg.Any<GetProviderCriteria>()).Returns(fakeSources);

        var result = await service.GetProvider(new GetProviderRequest());

        Assert.Equal(3, result.Count);
    }

    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1000, "Error Message", false)]
    public async Task UpdateProvider_Always_ReturnsResultFromRepositoryExecute(int errorCode, string errorMessage, bool expected)
    {
        // Arrange
        await repository.ExecuteAsync(Arg.Do<UpdateProviderCriteria>(x =>
        {
            x.ErrCode = errorCode;
            x.ErrMsg = errorMessage;
        }));

        // Act
        var actualModel = await service.UpdateProvider(new UpdateProviderRequest());

        // Assert
        Assert.Equal(expected, actualModel.IsSuccessful);
    }
}