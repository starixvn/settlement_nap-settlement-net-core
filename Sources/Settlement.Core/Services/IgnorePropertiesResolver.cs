using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Reflection;

namespace Settlement.Core.Services;
public class IgnorePropertiesResolver(IEnumerable<string> propNamesToIgnore) : DefaultContractResolver
{
    private readonly HashSet<string> ignoreProps = [..propNamesToIgnore];

    protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
    {
        var property = base.CreateProperty(member, memberSerialization);
        if (ignoreProps.Contains(property.PropertyName))
        {
            property.ShouldSerialize = _ => false;
        }
        return property;
    }
}