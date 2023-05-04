using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;
using Settlement.ResourceName.Services.ESports;

namespace Settlement.BettypeName.UnitTests.Services.ESports;

public class ESportsResourceNameServiceTests
{
    private readonly IMapperService service;

    public ESportsResourceNameServiceTests()
    {
        service = new ESportsResourceNameService();
    }

    [Theory]
    [InlineData("00", ResourceNameConstants.FullTime, "00")]
    [InlineData("M1", "Map 1", "M1")]
    [InlineData("902801", "Map 1 Dragons Score", "9028")]
    [InlineData("903401", "Map 1 Barons Score", "9034")]
    [InlineData("904001", "Map 1 Inhibitors Score", "9040")]
    [InlineData("904601", "Map 1 Tyrants Score", "9046")]
    [InlineData("905201", "Map 1 Overlords Score", "9052")]
    [InlineData("905801", "Map 1 Duration", "9058")]
    [InlineData("905901", "Map 1 Rounds Score", "9059")]
    [InlineData("907401", "Map 1 Rounds Score (including Overtime)", "9074")]
    [InlineData("906501", "Map 1 Total First Kills", "9065")]
    [InlineData("900201", "Map 1 Total Kills Score", "9002")]
    [InlineData("900801", "Map 1 Towers Score", "9008")]
    [InlineData("901201", "Map 1 Roshans Score", "9012")]
    [InlineData("901801", "Map 1 Barracks Score", "9018")]
    [InlineData("902401", "Map 1 Turrets Score", "9024")]
    [InlineData("906601", "Map 1 Clutches Score", "9066")]
    [InlineData("909001", "Map 1 First Blood Time", "9090")]
    [InlineData("909101", "Map 1 Total Kills at 10 Mins", "9091")]
    [InlineData("909301", "Map 1 Total Kills at 20 Mins", "9093")]
    [InlineData("911301", "Map 1 Lane With Most Turrets Destroyed", "9113")]
    [InlineData("911401", "Map 1 First Turret Location", "9114")]
    [InlineData("911501", "Map 1 Total Gold", "9115")]
    [InlineData("912101", "Map 1 First Tyrant Time", "9121")]
    [InlineData("912201", "Map 1 First Dark Tyrant", "9122")]
    [InlineData("912301", "Map 1 First Overlord Time", "9123")]
    [InlineData("912401", "Map 1 Will Storm Dragon Be Killed", "9124")]
    [InlineData("912501", "Map 1 First Herald", "9125")]
    [InlineData("912601", "Map 1 First Herald Time", "9126")]
    [InlineData("912701", "Map 1 First Baron Time", "9127")]
    [InlineData("912801", "Map 1 First Baron No. Players Buff", "9128")]
    [InlineData("912901", "Map 1 First Inhibitor Time", "9129")]
    [InlineData("913001", "Map 1 First Inhibitor Location", "9130")]
    [InlineData("913101", "Map 1 First Dragon Time", "9131")]
    [InlineData("913201", "Map 1 Will Elder Dragon Be Killed", "9132")]
    [InlineData("913301", "Map 1 Will Any Aegis Be Snatched Yes/No", "9133")]
    [InlineData("913401", "Map 1 First Tower Time", "9134")]
    [InlineData("913501", "Map 1 First Tower Location", "9135")]
    [InlineData("913601", "Map 1 First Roshan Time", "9136")]
    [InlineData("913701", "Map 1 First Barrack Time", "9137")]
    [InlineData("913801", "Map 1 First Barrack Location", "9138")]
    [InlineData("913901", "Map 1 Total Bomb Detonations (excl. OT)", "9139")]
    [InlineData("914001", "Map 1 Total Bomb Defuses (excl. OT)", "9140")]
    [InlineData("90680101", "Map 1 Round 1 Winner", "9068")]
    [InlineData("90690101", "Map 1 Round 1 Total Kills", "9069")]
    [InlineData("90890101", "Map 1 First to 1 Kills Time", "9089")]
    [InlineData("91010101", "Map 1 1st Kill", "9101")]
    [InlineData("91010102", "Map 1 2nd Kill", "9101")]
    [InlineData("91010103", "Map 1 3rd Kill", "9101")]
    [InlineData("91010104", "Map 1 4th Kill", "9101")]
    [InlineData("914101", "Map 1 Lane With Most Turrets Destroyed (KOG)", "9141")]
    [InlineData("914201", "Map 1 First Turret Location (KOG)", "9142")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, string betTypeName, string betType)
    {
        var actual = service.GetResourceName(resourceId, 0);

        Assert.Equal(betType, actual.Item1);
        Assert.Equal(betTypeName, actual.Item2);
    }
}