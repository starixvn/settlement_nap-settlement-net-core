using MessagePack;

namespace Settlement.Core.Models;

[MessagePackObject]
public class Score
{
    public Score()
    {
    }

    public Score(string value)
    {
        Home = Away = value;
    }

    public Score(string home, string away)
    {
        Home = home;
        Away = away;
    }

    public Score(string home, string away, string background)
        : this(home, away)
    {
        Background = background;
    }

    [Key("home")]
    public string Home { get; set; }

    [Key("away")]
    public string Away { get; set; }

    [Key("background")]
    public string Background { get; set; }

    [Key("isDirty")]
    public bool IsDirty { get; set; }

    [Key("isConfirmed")]
    public bool IsConfirmed { get; set; }

    [Key("isNotSettled")]
    public bool IsNotSettled { get; set; }

    public bool EqualValue(Score score)
    {
        return Home == score.Home && Away == score.Away;
    }
}