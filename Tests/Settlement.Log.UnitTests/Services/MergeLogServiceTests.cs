using Settlement.Log.Models.LogElement;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class MergeLogServiceTests
{
    private readonly MergeLogService service;

    public MergeLogServiceTests()
    {
        service = new MergeLogServiceImp();
    }

    private List<LogItem> CreateLogs(string name, string firstLogValue, string secondLogValue, string thirdLogValue)
    {
        return new List<LogItem>
        {
            new()
            {
                Value = firstLogValue,
                Name = name
            },

            new()
            {
                Value = secondLogValue,
                Name = name
            },

            new()
            {
                Value = thirdLogValue,
                Name = name
            }
        };
    }

    [Fact]
    public void GetMaxDate_Always_ReturnDateLatest()
    {
        var logs = CreateLogs("StartTime", "2023-08-18 06:00:50", "NOT_DATE_TYPE", "2023-08-18 06:00:42");

        var actual = service.GetMaxDate(logs);

        Assert.Equal("StartTime: 2023-08-18 06:00:50", actual);
    }

    [Fact]
    public void GetMinDate_Always_ReturnDateEarliest()
    {
        var logs = CreateLogs("EndTime", "2023-08-18 06:00:50", "NOT_DATE_TYPE", "2023-08-18 06:00:42");

        var actual = service.GetMinDate(logs);

        Assert.Equal("StartTime: 2023-08-18 06:00:42", actual);
    }

    [Theory]
    [MemberData(nameof(TestCases))]
    public void GetStatistic_Always_ReturnCorrectValue(string name, string firstLogValue, string secondLogValue, string thirdLogValue, Func<IEnumerable<int>, int> aggregation, string expected)
    {
        var logs = CreateLogs(name, firstLogValue, secondLogValue, thirdLogValue);

        var actual = service.GetStatistic(logs, aggregation);

        Assert.Equal(expected, actual);
    }

    public static IEnumerable<object[]> TestCases()
    {
        yield return new object[] { "TC", "10", "20", "3d14", (Func<IEnumerable<int>, int>)(values => values.Sum()), "TC: 33" };
        yield return new object[] { "Duration", "10ms", "20ms", "50ms", (Func<IEnumerable<int>, int>)(values => values.Max()), "Duration: 50ms" };
        yield return new object[] { "Duration", "10ms", "20ms", "50ms", (Func<IEnumerable<int>, int>)(values => values.Min()), "Duration: 10ms" };
        yield return new object[] { "TC", "Not_Valid_Value", "md5", "abc", (Func<IEnumerable<int>, int>)(values => values.Min()), "TC: 0" };
    }
}