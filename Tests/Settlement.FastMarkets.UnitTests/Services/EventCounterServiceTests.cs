using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.EventCounterModels;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System.Xml;

namespace Settlement.FastMarkets.UnitTests.Services;

public class EventCounterServiceTests
{
    private readonly IEventCounterElementService eventCounterElementService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IEventCounterService service;

    private readonly XmlDocument xmlDoc = new XmlDocument();

    public EventCounterServiceTests()
    {
        xmlConvertService = new XmlConvertServiceImp();
        eventCounterElementService = Substitute.For<IEventCounterElementService>();
        service = new EventCounterServiceImp(eventCounterElementService, xmlConvertService);
    }

    [Fact]
    public void Result_ActionIsNotCAL_ReturnsEmpty()
    {
        // Arrange
        var queryModel = new SettleRequest
        {
            Action = "REFUND"
        };

        // Act
        var actual = service.Result(queryModel);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void Result_ActionIsCALAndNotEventCounter_ReturnsNoEventCounterElement()
    {
        // Arrange
        var queryModel = new SettleRequest
        {
            Action = "CAL",
            EventCounters = new List<EventCounter>()
        };

        eventCounterElementService.GetEventCounters(Arg.Any<List<EventCounter>>()).Returns(new List<EventCounterElement>());

        // Act
        var result = service.Result(queryModel);

        // Assert
        xmlDoc.LoadXml(result);
        Assert.True(xmlDoc.DocumentElement != null && xmlDoc.DocumentElement.ChildNodes.Count == 0);
    }

    [Fact]
    public void Result_ActionIsCALAndHaveEventCounter_ReturnsOneEventCounterElement()
    {
        // Arrange
        var queryModel = new SettleRequest
        {
            Action = "CAL",
            EventCounters = new List<EventCounter>()
        };

        var eventCounters = new List<EventCounterElement>
        {
            new EventCounterElement { Id = "3", Items= new List<ItemElement>() }
        };

        eventCounterElementService.GetEventCounters(Arg.Any<List<EventCounter>>()).Returns(eventCounters);

        // Act
        var result = service.Result(queryModel);

        // Assert
        xmlDoc.LoadXml(result);
        Assert.True(xmlDoc.DocumentElement != null && xmlDoc.DocumentElement.ChildNodes.Count == 1);
    }
}