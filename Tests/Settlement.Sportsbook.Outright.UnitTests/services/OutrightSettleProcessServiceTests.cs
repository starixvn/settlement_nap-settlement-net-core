using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Outright;
using Settlement.Outright.Criteria;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.services;

public class OutrightSettleProcessServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleService;

    private readonly OutrightSettleProcessService service;

    public OutrightSettleProcessServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleThirdPartyService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OutrightMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var appSettingsKey = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var options = Options.Create(appSettingsKey);

        service = new OutrightSettleProcessServiceImp(repository, options, scaleOutSettleService, mapper);
    }

    [Theory]
    [InlineData(1, false)]
    [InlineData(0, true)]
    public async Task ValidateDeployment_Always_ReturnValueFromLibrary(int errorCode, bool expectedResult)
    {
        scaleOutSettleService.GetDeploymentInfo(Arg.Any<GetDeploymentInfoRequest>())
            .Returns(new ResultMessage { ErrorCode = errorCode });

        var actual = await service.ValidateDeployment("");

        Assert.Equal(expectedResult, actual.IsSuccessful);
    }

    [Fact]
    public async Task UpdateResultUndo_Always_ExecuteSPAndGetResponse()
    {
        await repository.ExecuteAsync(Arg.Do<UpdateResultOutrightCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "one";
        }));

        var actual = await service.UpdateResultUndo(new OutrightSettleCriteria());

        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task UpdateResultCalculate_Always_ExecuteSPAndGetResponse()
    {
        await repository.ExecuteAsync(Arg.Do<UpdateResultOutrightCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "one";
        }));

        var actual = await service.UpdateResultUndo(new OutrightSettleCriteria());

        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task OutrightSettleMultiSite_ExecuteSucceeded_ExecuteEnoughTime()
    {
        await repository.ExecuteAsync(Arg.Do<OutrightSettleCriteria>(c =>
        {
            c.ErrCode = 0;
            c.ErrMsg = "";
        }));

        var actual = await service.OutrightSettleMultiSite(new OutrightSettleCriteria());

        Assert.True(actual.IsSuccessful);
        await repository.Received(2).ExecuteAsync(Arg.Any<OutrightSettleCriteria>());
    }

    [Fact]
    public async Task OutrightSettleMultiSite_ExecuteFailed_ReturnMessage()
    {
        await repository.ExecuteAsync(Arg.Do<OutrightSettleCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "Test";
        }));

        var actual = await service.OutrightSettleMultiSite(new OutrightSettleCriteria());

        Assert.False(actual.IsSuccessful);
        Assert.Equal("<br/>- Test<br/>- Test", actual.ErrMsg);
    }
}