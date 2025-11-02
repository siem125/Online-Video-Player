public class Collection
{
    public required string id { get; set; }
    public required string name { get; set; }
    public string? description { get; set; }
    public Dictionary<int, string> series { get; set; }
}