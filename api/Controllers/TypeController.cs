using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.IO;

[ApiController]
[Route("api/VideoProject/[controller]")]
public class TypeController : ControllerBase
{
private readonly MediaStorageSettings _settings;

    public TypeController(IOptions<MediaStorageSettings> settings)
    {
        _settings = settings.Value;
    }

    [HttpGet("{type}")]
    public IActionResult GetVideoFolders(string type)
    {
        try
        {
            var videoDir = Path.Combine(_settings.StoragePath, type);

            if (!Directory.Exists(videoDir))
            {
                return NotFound(new { error = "Directory not found." });
            }

            var folderNames = Directory
                .GetDirectories(videoDir)
                .Select(dir => Path.GetFileName(dir))
                .ToList();

            return Ok(folderNames);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error reading video folders: " + ex.Message);
            return StatusCode(500, new { error = "Unable to fetch folders." });
        }
    }
}
