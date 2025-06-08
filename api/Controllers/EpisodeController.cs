using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

[ApiController]
[Route("api/VideoProject/[controller]")]
public class EpisodeController : ControllerBase
{
    private readonly MediaStorageSettings _settings;

    public EpisodeController(IOptions<MediaStorageSettings> settings)
    {
        _settings = settings.Value;
    }

    private enum videoPathStatusCodes
    {
        Ok,
        EpisodeError,
        SeasonError,
        SeriesError,
        TypeError
    }

    private KeyValuePair<videoPathStatusCodes, string> getVideoPath(string type, string series, string season, string episode)
    {
        var basePath = Path.Combine(_settings.StoragePath, type, series);
        var seasonFolder = Directory.GetDirectories(basePath)
            .FirstOrDefault(dir => Path.GetFileName(dir).StartsWith($"{season} -"));

        if (seasonFolder == null)
            return new KeyValuePair<videoPathStatusCodes, string>(videoPathStatusCodes.SeasonError, null); //NotFound(new { error = "Season not found." });

        var episodeFolder = Directory.GetDirectories(seasonFolder)
            .FirstOrDefault(dir => Path.GetFileName(dir).StartsWith($"{episode} -"));

        if (episodeFolder == null)
            return new KeyValuePair<videoPathStatusCodes, string>(videoPathStatusCodes.EpisodeError, null);//NotFound(new { error = "Episode not found." });

        return new KeyValuePair<videoPathStatusCodes, string>(videoPathStatusCodes.EpisodeError, episodeFolder);
    }

    [HttpGet("{type}/{series}/{season}/{episode}")]
    public IActionResult GetEpisode(string type, string series, string season, string episode)
    {
        try
        {
            KeyValuePair<videoPathStatusCodes, string> episodeFolderResult = getVideoPath(type, series, season, episode);
            if (episodeFolderResult.Key != videoPathStatusCodes.Ok)
            {
                //check the error
            }

            var dataFilePath = Path.Combine(episodeFolderResult.Value, "data.json");

            if (!System.IO.File.Exists(dataFilePath))
                return NotFound(new { error = "data.json not found." });

            var data = System.IO.File.ReadAllText(dataFilePath);
            var json = JsonSerializer.Deserialize<Dictionary<string, object>>(data);

            if (json == null || !json.ContainsKey("videoFileName"))
                return BadRequest(new { error = "Invalid data.json format." });

            var videoFileName = json["videoFileName"]?.ToString();
            var webPath = $"/videos/";

            json["videoPath"] = webPath;

            return Ok(json);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error reading episode data: " + ex.Message);
            return StatusCode(500, new { error = "Unable to fetch episode." });
        }
    }

    [HttpGet("{type}/{series}/{season}/{episode}/video")]
    public IActionResult GetVideo(string type, string series, string season, string episode)
    {
        
        KeyValuePair<videoPathStatusCodes, string> episodeFolderResult = getVideoPath(type, series, season, episode);
        if (episodeFolderResult.Key != videoPathStatusCodes.Ok)
        {
            //check the error
        }

        var dataFilePath = Path.Combine(episodeFolderResult.Value, "data.json");

        try
        {
            var videoPath = Path.Combine(episodeFolderResult.Value, "Video.mp4");

            if (!System.IO.File.Exists(videoPath))
                return NotFound(new { error = "Video file not found." });

            var video = System.IO.File.OpenRead(videoPath);
            return File(video, "video/mp4", enableRangeProcessing: true); // Supports seeking
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error serving video: " + ex.Message);
            return StatusCode(500, new { error = "Unable to serve video." });
        }
    }
}
