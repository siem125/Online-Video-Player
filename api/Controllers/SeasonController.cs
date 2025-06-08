using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

[ApiController]
[Route("api/VideoProject/[controller]")]
public class SeasonController : ControllerBase
{
    private readonly MediaStorageSettings _settings;

    public SeasonController(IOptions<MediaStorageSettings> settings)
    {
        _settings = settings.Value;
    }

    [HttpGet("{type}/{series}/{season}")]
    public IActionResult GetEpisodes(string type, string series, string season)
    {
        try
        {
            var seriesPath = Path.Combine(_settings.StoragePath, type, series);
            var seasonFolder = Directory.GetDirectories(seriesPath)
                .FirstOrDefault(folder => Path.GetFileName(folder).StartsWith($"{season} -"));

            if (seasonFolder == null)
            {
                return NotFound(new { error = "Season not found." });
            }

            var episodeFolders = Directory.GetDirectories(seasonFolder)
                .Select(dir => Path.GetFileName(dir))
                .Where(name => int.TryParse(name.Split(" - ")[0], out _))
                .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
                .Select(name =>
                {
                    var parts = name.Split(" - ");
                    return new object[] { int.Parse(parts[0]), parts[1] };
                })
                .ToList();

            return Ok(episodeFolders);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error reading season data: " + ex.Message);
            return StatusCode(500, new { error = "Unable to fetch episodes." });
        }
    }
}
