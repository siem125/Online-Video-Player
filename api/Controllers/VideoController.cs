using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/VideoProject/[controller]")]
public class VideosController : ControllerBase
{
    private readonly string _videoRoot = Path.Combine(Directory.GetCurrentDirectory(), "Media/Videos");

    [HttpGet("{filename}")]
    public IActionResult GetVideo(string filename)
    {
        var videoPath = Path.Combine(_videoRoot, filename);
        if (!System.IO.File.Exists(videoPath))
            return NotFound();

        var video = System.IO.File.OpenRead(videoPath);
        return File(video, "video/mp4", enableRangeProcessing: true); // Important for video seeking
    }
}
