using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

[ApiController]
[Route("api/VideoProject/UserData")]
public class UserDataController : ControllerBase
{
    private readonly MediaStorageSettings _settings;

    public UserDataController(IOptions<MediaStorageSettings> settings)
    {
        _settings = settings.Value;
    }

    public class UserData
    {
        public bool IsAdmin { get; set; }
        public Dictionary<AutoSkipOption, bool> AutoSkip { get; set; } = new();
        public List<Collection> Collections { get; set; } = new();
        public List<ToContinue> ContinueList { get; set; } = new();
        public List<MyListEntry> MyList { get; set; } = new();
    }


    [HttpGet("getUser")]
    public IActionResult GetOrCreateUser([FromHeader] string userID)
    {
        try
        {
            var userData = LoadUser(userID);
            return Ok(userData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private UserData LoadUser(string userId)
    {
        var userDir = _settings.UserStoragePath;
        if (!Directory.Exists(userDir))
            Directory.CreateDirectory(userDir);

        var userFilePath = Path.Combine(userDir, $"{userId}.json");

        if (!System.IO.File.Exists(userFilePath))
        {
            // Eerste user check
            var existingFiles = Directory.GetFiles(userDir, "*.json");
            bool isFirstUser = existingFiles.Length == 0;

            var newUser = new UserData
            {
                IsAdmin = isFirstUser
            };

            SaveUser(userId, newUser);
            return newUser;
        }

        var data = System.IO.File.ReadAllText(userFilePath);
        return JsonSerializer.Deserialize<UserData>(data) ?? new UserData();
    }

    private void SaveUser(string userId, UserData user)
    {
        var userDir = _settings.UserStoragePath;
        if (!Directory.Exists(userDir))
            Directory.CreateDirectory(userDir);

        var userFilePath = Path.Combine(userDir, $"{userId}.json");

        var json = JsonSerializer.Serialize(user, new JsonSerializerOptions { WriteIndented = true });
        System.IO.File.WriteAllText(userFilePath, json);
    }


    #region AutoSkip

    [HttpPatch("getUser/autoskip")]
    public IActionResult UpdateAutoSkip([FromHeader] string userId, [FromBody] AutoSkipUpdateRequest request)
    {
        var user = LoadUser(userId);

        if (user == null) return NotFound();

        user.AutoSkip[request.Option] = request.Value;
        SaveUser(userId, user);

        return Ok(user.AutoSkip);
    }

    public class AutoSkipUpdateRequest
    {
        public AutoSkipOption Option { get; set; }
        public bool Value { get; set; }
    }

    #endregion


    #region collection

    [HttpPost("getUser/collections")]
    public IActionResult CreateCollection([FromHeader] string userId, [FromBody] Collection newCollection)
    {
        var user = LoadUser(userId);
        if (user == null) return NotFound();

        newCollection.id = Guid.NewGuid().ToString();
        user.Collections.Add(newCollection);

        SaveUser(userId, user);
        return Ok(newCollection);
    }

    [HttpPatch("getUser/collections/{collectionId}")]
    public IActionResult UpdateCollection([FromHeader] string userId, string collectionId, [FromBody] CollectionUpdateRequest request)
    {
        var user = LoadUser(userId);
        if (user == null) return NotFound();

        var collection = user.Collections.FirstOrDefault(c => c.id == collectionId);
        if (collection == null) return NotFound();

        if (!string.IsNullOrEmpty(request.Name))
            collection.name = request.Name;
        if (!string.IsNullOrEmpty(request.Description))
            collection.description = request.Description;

        if (request.Action == "add")
            collection.series[request.Series.Key] = request.Series.Value;
        else if (request.Action == "remove")
            collection.series.Remove(request.Series.Key);

        SaveUser(userId, user);
        return Ok(collection);
    }

    [HttpDelete("getUser/collections/{collectionId}")]
    public IActionResult DeleteCollection([FromHeader] string userId, string collectionId)
    {
        var user = LoadUser(userId);
        if (user == null) return NotFound();

        user.Collections.RemoveAll(c => c.id == collectionId);
        SaveUser(userId, user);

        return NoContent();
    }

    public class CollectionUpdateRequest
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public string Action { get; set; } = "";
        public KeyValuePair<int, string> Series { get; set; }
    }

    #endregion

    #region ContinueList

    [HttpPatch("getUser/continue")]
    public IActionResult UpsertContinue([FromHeader] string userId, [FromBody] ToContinue entry)
    {
        var user = LoadUser(userId);
        if (user == null) return NotFound();
        //Console.WriteLine("User has been found with id: " + userId);

        var existing = user.ContinueList.FirstOrDefault(c => c.seriesID == entry.seriesID);
        if (existing == null)
        {
            user.ContinueList.Add(entry);
            //Console.WriteLine("Did not exist so created a new one");
        }
        else
        {
            existing.seasonNumber = entry.seasonNumber;
            existing.episodeNumber = entry.episodeNumber;
            existing.time = entry.time;
            //Console.WriteLine("Was found so updating info");
        }

        SaveUser(userId, user);
        //Console.WriteLine("Creating/Updating continue data");

        return Ok(entry);
    }

    [HttpDelete("getUser/continue/{seriesId}")]
    public IActionResult RemoveContinue([FromHeader] string userId, string seriesId)
    {
        var user = LoadUser(userId);
        if (user == null) return NotFound();

        user.ContinueList.RemoveAll(c => c.seriesID == seriesId);
        SaveUser(userId, user);

        return NoContent();
    }

    #endregion

    

    #region MyList

    public class MyListEntry
    {
        public string Type { get; set; } = "";
        public string SeriesName { get; set; } = "";
    }

    [HttpPatch("getUser/mylist")]
    public IActionResult UpdateMyList([FromHeader] string userId, [FromBody] MyListRequest request)
    {
        var user = LoadUser(userId);
        if (user == null) return NotFound();

        if (request.Action == "add")
        {
            if (!user.MyList.Any(m => m.Type == request.Entry.Type && m.SeriesName == request.Entry.SeriesName))
                user.MyList.Add(request.Entry);
        }
        else if (request.Action == "remove")
        {
            user.MyList.RemoveAll(m => m.Type == request.Entry.Type && m.SeriesName == request.Entry.SeriesName);
        }

        SaveUser(userId, user);
        return Ok(user.MyList);
    }

    public class MyListRequest
    {
        public string Action { get; set; } = "";
        public MyListEntry Entry { get; set; }
    }


    #endregion

}
