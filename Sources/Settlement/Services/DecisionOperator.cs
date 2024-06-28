namespace Settlement.Services;

public static class DecisionOperator
{
    public static T QuaternaryDecision<T>(bool firstCondition, T firstResult, bool secondCondition, T secondResult, T defaultResult)
    {
        if (firstCondition)
        {
            return firstResult;
        }

        return secondCondition ? secondResult : defaultResult;
    }

    public static T QuinaryDecision<T>(bool firstCondition, T firstResult, bool secondCondition, T secondResult, bool thirdCondition, T thirdResult, T defaultResult)
    {
        if (firstCondition)
        {
            return firstResult;
        }

        if (secondCondition)
        {
            return secondResult;
        }

        return thirdCondition ? thirdResult : defaultResult;
    }
}