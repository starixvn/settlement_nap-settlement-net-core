using Settlement.Log.Contants;

namespace Settlement.Log.Services;

public interface ResultService
{
    string MinuteSetPieceResultName(string position, string result);

    string ResultName(string position, string result);
}

public class ResultServiceImp : ResultService
{
    private static readonly string[] EventCounterLabels = ["N", "G", "C", "FK", "GK", "T", "B", "P"];

    public string MinuteSetPieceResultName(string position, string result)
    {
        var value = Convert.ToInt32(result);
        var resultName = "Yes";

        if (value != SetPiece.CornerFreeKickGoalKickAndPenalty)
        {
            resultName = value == 1 ? "No" : string.Empty;
        }

        return $"{position}:{resultName}";
    }

    public string ResultName(string position, string result)
    {
        var value = Convert.ToInt32(result);
        var binaryResult = Convert.ToString(value, 2).PadLeft(8, '0').Reverse();
        return $"{position}:{MappingName(binaryResult)}";
    }

    private static string MappingName(string binaryResult)
    {
        var results = new List<string>();

        for (var pos = 0; pos < binaryResult.Length; pos++)
        {
            var value = binaryResult[pos];
            if (value.Equals('1'))
            {
                var result = EventCounterLabels[pos];
                if (!string.IsNullOrWhiteSpace(result))
                {
                    results.Add(result);
                }
            }
        }

        return string.Join(",", results);
    }
}