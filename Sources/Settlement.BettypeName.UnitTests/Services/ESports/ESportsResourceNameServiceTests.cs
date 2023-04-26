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
    [InlineData("00", ResourceNameConstants.FullTime)]
    [InlineData("M1", "Map 1")]
    [InlineData("902801", "Map 1 Dragons Score")]
    [InlineData("903401", "Map 1 Barons Score")]
    [InlineData("904001", "Map 1 Inhibitors Score")]
    [InlineData("904601", "Map 1 Tyrants Score")]
    [InlineData("905201", "Map 1 Overlords Score")]
    [InlineData("905801", "Map 1 Duration")]
    [InlineData("905901", "Map 1 Rounds Score")]
    [InlineData("907401", "Map 1 Rounds Score (including Overtime)")]
    [InlineData("906501", "Map 1 Total First Kills")]
    [InlineData("900201", "Map 1 Total Kills Score")]
    [InlineData("900801", "Map 1 Towers Score")]
    [InlineData("901201", "Map 1 Roshans Score")]
    [InlineData("901801", "Map 1 Barracks Score")]
    [InlineData("902401", "Map 1 Turrets Score")]
    [InlineData("906601", "Map 1 Clutches Score")]
    [InlineData("909001", "Map 1 First Blood Time")]
    [InlineData("909101", "Map 1 Total Kills at 10 Mins")]
    [InlineData("909301", "Map 1 Total Kills at 20 Mins")]
    [InlineData("911301", "Map 1 Lane With Most Turrets Destroyed")]
    [InlineData("911401", "Map 1 First Turret Location")]
    [InlineData("911501", "Map 1 Total Gold")]
    [InlineData("912101", "Map 1 First Tyrant Time")]
    [InlineData("912201", "Map 1 First Dark Tyrant")]
    [InlineData("912301", "Map 1 First Overlord Time")]
    [InlineData("912401", "Map 1 Will Storm Dragon Be Killed")]
    [InlineData("912501", "Map 1 First Herald")]
    [InlineData("912601", "Map 1 First Herald Time")]
    [InlineData("912701", "Map 1 First Baron Time")]
    [InlineData("912801", "Map 1 First Baron No. Players Buff")]
    [InlineData("912901", "Map 1 First Inhibitor Time")]
    [InlineData("913001", "Map 1 First Inhibitor Location")]
    [InlineData("913101", "Map 1 First Dragon Time")]
    [InlineData("913201", "Map 1 Will Elder Dragon Be Killed")]
    [InlineData("913301", "Map 1 Will Any Aegis Be Snatched Yes/No")]
    [InlineData("913401", "Map 1 First Tower Time")]
    [InlineData("913501", "Map 1 First Tower Location")]
    [InlineData("913601", "Map 1 First Roshan Time")]
    [InlineData("913701", "Map 1 First Barrack Time")]
    [InlineData("913801", "Map 1 First Barrack Location")]
    [InlineData("913901", "Map 1 Total Bomb Detonations (excl. OT)")]
    [InlineData("914001", "Map 1 Total Bomb Defuses (excl. OT)")]
    [InlineData("90680101", "Map 1 Round 1 Winner")]
    [InlineData("90690101", "Map 1 Round 1 Total Kills")]
    [InlineData("90890101", "Map 1 First to 1 Kills Time")]
    [InlineData("91010101", "Map 1 1st Kill")]
    [InlineData("91010102", "Map 1 2nd Kill")]
    [InlineData("91010103", "Map 1 3rd Kill")]
    [InlineData("91010104", "Map 1 4th Kill")]
    [InlineData("914101", "Map 1 Lane With Most Turrets Destroyed (KOG)")]
    [InlineData("914201", "Map 1 First Turret Location (KOG)")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, string betTypeName)
    {
        var actual = service.GetResourceName(resourceId);

        Assert.Equal(betTypeName, actual);
    }
}