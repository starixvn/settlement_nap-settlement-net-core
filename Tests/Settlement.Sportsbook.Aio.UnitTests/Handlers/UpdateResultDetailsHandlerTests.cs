using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Fanex.Settlement.Converter.Services;
using Settlement.Core;
using Settlement.Core.Criteria;
using Settlement.Sportsbook.Aio.Handlers;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio.UnitTests.Handlers;

public class UpdateResultDetailsHandlerTests
{
    private readonly IDynamicRepository _repository = Substitute.For<IDynamicRepository>();
    private readonly XmlConvertService _xmlConvertService = Substitute.For<XmlConvertService>();
    private readonly INapSession _napSession = Substitute.For<INapSession>();
    private readonly UpdateResultDetailsHandler _handler;

    public UpdateResultDetailsHandlerTests()
    {
        _napSession.UserId.Returns(123);
        _handler = new UpdateResultDetailsHandler(_repository, _xmlConvertService, _napSession);
    }

    [Fact]
    public async Task Handle_SuccessfulUpdate_ReturnsSuccessResult()
    {
        // Arrange
        var request = new UpdateResultDetailsRequest(1, new List<Models.ResultDetail>
        {
             new() { ResourceId = "R1", HomeValue = "1", AwayValue = "0" }
        }, true);

        await _repository.ExecuteAsync(Arg.Any<UpdateResultDetailsCriteria>());

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.ErrCode);
        await _repository.Received().ExecuteAsync(Arg.Any<UpdateResultDetailsCriteria>());
        await _repository.Received().ExecuteAsync(Arg.Any<LogCriteria>());
    }

    [Fact]
    public async Task Handle_UpdateFails_ReturnsErrorResult()
    {
        // Arrange
        var request = new UpdateResultDetailsRequest(1, new List<Models.ResultDetail>
        {
             new() { ResourceId = "R2", HomeValue = "2", AwayValue = "1" }
        }, true);
        // Simulate error from repository
        _repository
            .When(x => x.ExecuteAsync(Arg.Any<UpdateResultDetailsCriteria>()))
            .Do(call =>
            {
                var criteria = call.Arg<UpdateResultDetailsCriteria>();
                criteria.ErrCode = 99;
                criteria.ErrMsg = "Update failed";
            });

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(99, result.ErrCode);
        Assert.Equal("Update failed", result.ErrMsg);
        await _repository.Received().ExecuteAsync(Arg.Any<UpdateResultDetailsCriteria>());
        await _repository.DidNotReceive().ExecuteAsync(Arg.Any<LogCriteria>());
    }
}
