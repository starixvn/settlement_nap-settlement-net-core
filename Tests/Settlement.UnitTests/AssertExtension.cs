using Newtonsoft.Json;

using Xunit;

namespace Settlement.UnitTests;

public static class AssertExtension
{
    public static void AreEqual<T>(T expected, T actual)
    {
        Assert.Equal(JsonConvert.SerializeObject(expected), JsonConvert.SerializeObject(actual));
    }

    public static string RemoveSessionId(this string value)
    {
        var index = value.IndexOf("\"BroadcastSessionId\"", StringComparison.Ordinal);
        return value.Remove(index, 60);
    }
}