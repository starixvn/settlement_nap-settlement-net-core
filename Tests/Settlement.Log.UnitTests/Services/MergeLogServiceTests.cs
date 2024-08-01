using Settlement.Log.Contants;
using Settlement.Log.Models.LogElement;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class MergeLogServiceTests
{
    private readonly MergeLogService service = new MergeLogServiceImp();

    private IEnumerable<RootElement> CreateLogs(string name, string type, string firstLogValue, string secondLogValue, string thirdLogValue)
    {
        return new List<RootElement>
        {
            new()
            {
                Logs =
                [
                    new LogItem
                    {
                        Type = type,
                        Value = firstLogValue,
                        Name = name
                    },
                    new LogItem
                    {
                        Type = type,
                        Value = secondLogValue,
                        Name = name
                    },
                    new LogItem
                    {
                        Type = type,
                        Value = thirdLogValue,
                        Name = name
                    }
                ]
            }
        };
    }

    [Fact]
    public void GetMaxDate_Always_ReturnDateLatest()
    {
        var logs = CreateLogs("StartTime", LogType.DateMax, "2023-08-18 06:00:50", "NOT_DATE_TYPE", "2023-08-18 06:00:42");

        var actual = service.MergeLog(logs);

        Assert.Equal("StartTime: 2023-08-18 06:00:50", actual);
    }

    [Fact]
    public void GetMinDate_Always_ReturnDateEarliest()
    {
        var logs = CreateLogs("EndTime", LogType.DateMin, "2023-08-18 06:00:50", "NOT_DATE_TYPE", "2023-08-18 06:00:42");

        var actual = service.MergeLog(logs);

        Assert.Equal("EndTime: 2023-08-18 06:00:42", actual);
    }

    [Theory]
    [MemberData(nameof(TestCases))]
    public void GetStatistic_Always_ReturnCorrectValue(string name, string type, string firstLogValue, string secondLogValue, string thirdLogValue, string expected)
    {
        var logs = CreateLogs(name, type, firstLogValue, secondLogValue, thirdLogValue);

        var actual = service.MergeLog(logs);

        Assert.Equal(expected, actual);
    }

    public static IEnumerable<object[]> TestCases()
    {
        yield return ["TC", LogType.Sum, "10", "20", "3d14", "TC: 33"];
        yield return ["Duration", LogType.Max, "10ms", "20ms", "50ms", "Duration: 50ms"];
        yield return ["Duration", LogType.Min, "10ms", "20ms", "50ms", "Duration: 10ms"];
        yield return ["TC", LogType.Min, "Not_Valid_Value", "md5", "abc", "TC: 0"];
    }

    [Fact]
    public void DistinctLogsString_HasLog_ReturnCorrectLog()
    {
        var distinctLogs = new List<DistinctElement>
        {
            new()
            {
                Logs =
                [
                    new LogItem
                    {
                        Name = "name",
                        Value = "value"
                    }
                ]
            }
        };

        var actual = service.DistinctLogsString(distinctLogs);


        Assert.Equal("name: value", actual);
    }

    [Fact]
    public void DistinctLogsString_EmptyLog_ReturnEmpty()
    {
        var distinctLogs = new List<DistinctElement>();

        var actual = service.DistinctLogsString(distinctLogs);


        Assert.Empty(actual);
    }
}