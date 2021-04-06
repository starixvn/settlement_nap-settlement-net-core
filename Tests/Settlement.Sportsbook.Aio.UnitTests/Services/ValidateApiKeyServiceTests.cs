using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Services;
using System;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class ValidateApiKeyServiceTests
    {
        private readonly ICriteriaFactory criteriaFactory;

        private readonly IValidateApiKeyService service;

        private const string Key = "api";

        private readonly object MockData = null;

        public ValidateApiKeyServiceTests()
        {
            criteriaFactory = Substitute.For<ICriteriaFactory>();
            service = new ValidateApiKeyServiceImp(criteriaFactory);
            MockData = new { matchId = 1 };
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
            Type value = null;
            criteriaFactory.GetCriteriaType(Key).Returns(value);

            //Assert
            Assert.Throws<EmptyKeyException>(() =>
                {
                    service.CriteriaName(MockData, Key);
                });
        }

        [Fact]
        public void CriteriaName_ExistedCriteriaTypeButCriteriaIsNull_ThrowException()
        {
            //Arrange
            ICriteria criteria = null;
            criteriaFactory.GetCriteriaType(Key).Returns(typeof(GetMatchDetailCriteria));
            criteriaFactory.CreateCriteria(Arg.Any<Type>(), MockData).Returns(criteria);

            // Assert
            Assert.Throws<EmptyKeyException>(() => service.CriteriaName(MockData, Key));
        }

        [Fact]
        public void CriteriaName_ExistedCriteriaTypeAndCriteria_ReturnsNotNull()
        {
            //Arrange
            criteriaFactory.GetCriteriaType(Key).Returns(typeof(GetMatchDetailCriteria));
            criteriaFactory.CreateCriteria(Arg.Any<Type>(), MockData).Returns(new GetMatchDetailCriteria());

            //Act
            var result = service.CriteriaName(MockData, Key);

            //Assert
            Assert.NotNull(result);
        }

        [Fact]
        public void CreateNonQueryCommand_CriteriaTypeIsNull_ThrowException()
        {
            //Arrange
            Type value = null;
            criteriaFactory.GetCriteriaType(Key).Returns(value);

            //Assert
            Assert.Throws<EmptyKeyException>(() => service.CreateNonQueryCommand(MockData, Key));
        }

        [Fact]
        public void CreateNonQueryCommand_ExistedCriteriaTypeButCreateNonQueryCommandIsNull_ThrowException()
        {
            //Arrange
            ICriteria criteria = null;
            criteriaFactory.GetCriteriaType(Key).Returns(typeof(SettleCriteria));
            criteriaFactory.CreateNonQueryCommand(Arg.Any<Type>(), MockData).Returns(criteria);

            //Assert
            Assert.Throws<EmptyKeyException>(() => service.CreateNonQueryCommand(MockData, Key));
        }

        [Fact]
        public void CreateNonQueryCommand_ExistedCriteriaTypeAndCreateNonQueryCommand_ReturnsNotNull()
        {
            //Arrange
            criteriaFactory.GetCriteriaType(Key).Returns(typeof(SettleCriteria));
            criteriaFactory.CreateNonQueryCommand(Arg.Any<Type>(), MockData).Returns(new SettleCriteria());

            //Act
            var result = service.CreateNonQueryCommand(MockData, Key);

            //Assert
            Assert.NotNull(result);
        }
    }
}