using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.MapperFactory;

namespace Settlement.Sportsbook.Aio.UnitTests.Services;

public class ValidateApiKeyServiceTests
{
    private readonly ICriteriaFactory criteriaFactory;

    private readonly IValidateApiKeyService service;

    private const string Key = "api";

    private readonly object mockData;

    public ValidateApiKeyServiceTests()
    {
        criteriaFactory = Substitute.For<ICriteriaFactory>();
        service = new ValidateApiKeyServiceImp(criteriaFactory);
        mockData = new { matchId = 1 };
    }

    [Fact]
    public void GetApiKey_ApiKeyIsEmpty_ThrowException()
    {
        // Assert
        Assert.Throws<EmptyKeyException>(() =>
        {
            service.GetApiKey(string.Empty);
        });
    }

    [Fact]
    public void GetApiKey_HasApiKey_ReturnsRightKey()
    {
        //Act
        var result = service.GetApiKey(Key);

        Assert.Equal(Key, result);
    }

    [Fact]
    public void CriteriaName_CriteriaTypeIsNull_ThrowException()
    {
        //Arrange
        Type? value = null;
        criteriaFactory.GetCriteriaType(Key).Returns(value);

        //Assert
        Assert.Throws<EmptyKeyException>(() =>
        {
            service.CriteriaName(mockData, Key);
        });
    }

    [Fact]
    public void CriteriaName_ExistedCriteriaTypeButCriteriaIsNull_ThrowException()
    {
        //Arrange
        ICriteria? criteria = null;
        criteriaFactory.GetCriteriaType(Key).Returns(typeof(GetMatchDetailCriteria));
        criteriaFactory.CreateCriteria(Arg.Any<Type>(), mockData).Returns(criteria);

        // Assert
        Assert.Throws<EmptyKeyException>(() => service.CriteriaName(mockData, Key));
    }

    [Fact]
    public void CriteriaName_ExistedCriteriaTypeAndCriteria_ReturnsNotNull()
    {
        //Arrange
        criteriaFactory.GetCriteriaType(Key).Returns(typeof(GetMatchDetailCriteria));
        criteriaFactory.CreateCriteria(Arg.Any<Type>(), mockData).Returns(new GetMatchDetailCriteria());

        //Act
        var result = service.CriteriaName(mockData, Key);

        //Assert
        Assert.NotNull(result);
    }

    [Fact]
    public void CreateNonQueryCommand_CriteriaTypeIsNull_ThrowException()
    {
        //Arrange
        Type? value = null;
        criteriaFactory.GetCriteriaType(Key).Returns(value);

        //Assert
        Assert.Throws<EmptyKeyException>(() => service.CreateNonQueryCommand(mockData, Key));
    }

    [Fact]
    public void CreateNonQueryCommand_ExistedCriteriaTypeButCreateNonQueryCommandIsNull_ThrowException()
    {
        //Arrange
        ICriteria? criteria = null;
        criteriaFactory.GetCriteriaType(Key).Returns(typeof(SettleCriteria));
        criteriaFactory.CreateNonQueryCommand(Arg.Any<Type>(), mockData).Returns(criteria);

        //Assert
        Assert.Throws<EmptyKeyException>(() => service.CreateNonQueryCommand(mockData, Key));
    }

    [Fact]
    public void CreateNonQueryCommand_ExistedCriteriaTypeAndCreateNonQueryCommand_ReturnsNotNull()
    {
        //Arrange
        criteriaFactory.GetCriteriaType(Key).Returns(typeof(SettleCriteria));
        criteriaFactory.CreateNonQueryCommand(Arg.Any<Type>(), mockData).Returns(new SettleCriteria());

        //Act
        var result = service.CreateNonQueryCommand(mockData, Key);

        //Assert
        Assert.NotNull(result);
    }
}