using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

[ApiController]
[Route("api/VideoProject/[controller]")]
public class SeriesController : ControllerBase
{
    private readonly MediaStorageSettings _settings;

    public SeriesController(IOptions<MediaStorageSettings> settings)
    {
        _settings = settings.Value;
    }

    [HttpGet("{type}/{series}")]
    public IActionResult GetSeriesData(string type, string series)
    {
        try
        {
            var seriesPath = Path.Combine(_settings.StoragePath, type, series);
            if (!Directory.Exists(seriesPath))
                return NotFound(new { error = "Series not found." });

            var seasonFolders = Directory.GetDirectories(seriesPath);

            var seasons = seasonFolders.Select(seasonFolder =>
            {
                var seasonName = Path.GetFileName(seasonFolder);
                var parts = seasonName.Split(" - ");
                var seasonNumber = int.Parse(parts[0]);
                var originalSeasonName = parts.Length > 1 ? parts[1] : $"Season {seasonNumber}";

                var episodes = Directory.GetDirectories(seasonFolder)
                    .Select(epPath =>
                    {
                        var epName = Path.GetFileName(epPath);
                        var epParts = epName.Split(" - ");
                        var episodeNumber = int.Parse(epParts[0]);
                        var originalEpName = epParts.Length > 1 ? epParts[1] : $"Episode {episodeNumber}";

                        return new
                        {
                            Number = episodeNumber,
                            Name = originalEpName
                        };
                    })
                    .OrderBy(e => e.Number)
                    .ToList();

                return new
                {
                    Number = seasonNumber,
                    Name = originalSeasonName,
                    Episodes = episodes
                };
            })
            .OrderBy(s => s.Number)
            .ToList();

            return Ok(new
            {
                Name = series,
                Seasons = seasons
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error fetching series data: " + ex.Message);
            return StatusCode(500, new { error = "Unable to fetch series data." });
        }
    }


    [HttpPost("upload-folder")]
    [RequestSizeLimit(long.MaxValue)] // Or specify e.g. 5_000_000_000 for 5GB
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
    public async Task<IActionResult> UploadFolder([FromForm] List<IFormFile> files, [FromForm] string type, [FromForm] string seriesName)
    {
        if (files == null || !files.Any() || string.IsNullOrEmpty(type) || string.IsNullOrEmpty(seriesName))
            return BadRequest(new { error = "Missing required fields or files." });

        var basePath = Path.Combine(_settings.StoragePath, type, seriesName);
        var logs = new List<string>();

        try
        {
            foreach (var file in files)
            {
                var relativePath = file.FileName.Replace('\\', '/'); // should contains season/episode.mp4
                var parts = relativePath.Split('/');
                if (parts.Length < 2)
                    continue;

                //Console.WriteLine("File had the structure of (season)/(episode).(ext)");

                var seasonName = parts[0];
                var fileName = parts[^1];
                var episodeName = Path.GetFileNameWithoutExtension(fileName);
                var ext = Path.GetExtension(fileName);

                // Get or assign season folder
                var seasonIndex = GetNextIndexedFolderNumber(basePath, seasonName);
                var seasonFolder = $"{seasonIndex} - {seasonName}";
                var seasonPath = Path.Combine(basePath, seasonFolder);
                Directory.CreateDirectory(seasonPath);

                // Get or assign episode folder
                var episodeIndex = GetNextIndexedFolderNumber(seasonPath);
                var episodeFolder = $"{episodeIndex} - {episodeName}";
                var episodePath = Path.Combine(seasonPath, episodeFolder);
                Directory.CreateDirectory(episodePath);

                // Save video
                var videoFileName = $"Video{ext}";
                var videoPath = Path.Combine(episodePath, videoFileName);
                using (var stream = new FileStream(videoPath, FileMode.Create))
                    await file.CopyToAsync(stream);

                // Write data.json
                var episodeMeta = new
                {
                    name = episodeName,
                    videoFileName = videoFileName,
                    description = $"Auto-imported {episodeName}",
                    skippoints = new List<object>()
                };

                var json = JsonSerializer.Serialize(episodeMeta, new JsonSerializerOptions { WriteIndented = true });
                string episodeToPath = Path.Combine(episodePath, "data.json");
                await System.IO.File.WriteAllTextAsync(episodeToPath, json);

                string log = $"Saved {videoFileName} in {episodeToPath}";
                logs.Add(log);

                Console.WriteLine(log);
            }

            return Ok(new { logs = logs });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to upload folder.", details = ex.Message });
        }
    }

    private int GetNextIndexedFolderNumber(string parentPath, string? nameToCheck = null)
    {
        if (!Directory.Exists(parentPath))
            return 0;

        var folders = Directory.GetDirectories(parentPath)
            .Select(dir => Path.GetFileName(dir))
            .Where(name => Regex.IsMatch(name!, @"^\d+ - "))
            .ToList();

        if (!string.IsNullOrEmpty(nameToCheck))
        {
            foreach (var folder in folders)
            {
                var parts = folder.Split(" - ");
                if (parts.Length > 1 && parts[1].Equals(nameToCheck, StringComparison.OrdinalIgnoreCase))
                {
                    return int.Parse(parts[0]); // existing index
                }
            }
        }

        int index = 0;
        while (folders.Any(name => name.StartsWith($"{index} - ")))
            index++;

        return index;
    }



    [HttpPost("{type}/{series}/update-episode-order")]
    public IActionResult UpdateEpisodeOrder(string type, string series, [FromBody] EpisodeMoveRequest request)
    {
        try
        {
            var seriesPath = Path.Combine(_settings.StoragePath, type, series);

            var seasonFolders = Directory.GetDirectories(seriesPath)
                .Select(folder =>
                {
                    var parts = Path.GetFileName(folder).Split(" - ");
                    return new
                    {
                        Number = int.Parse(parts[0]),
                        Name = parts.Length > 1 ? parts[1] : "",
                        Path = folder
                    };
                })
                .ToDictionary(s => s.Number);

            if (!seasonFolders.ContainsKey(request.OldSeasonNumber) || !seasonFolders.ContainsKey(request.NewSeasonNumber))
                return NotFound(new { error = "Season not found." });

            var oldSeason = seasonFolders[request.OldSeasonNumber];
            var newSeason = seasonFolders[request.NewSeasonNumber];

            var oldEpisodes = Directory.GetDirectories(oldSeason.Path)
                .Select(dir => new EpisodeFolder(dir))
                .OrderBy(ep => ep.Number)
                .ToList();

            var newEpisodes = request.OldSeasonNumber == request.NewSeasonNumber
                ? new List<EpisodeFolder>(oldEpisodes)
                : Directory.GetDirectories(newSeason.Path)
                    .Select(dir => new EpisodeFolder(dir))
                    .OrderBy(ep => ep.Number)
                    .ToList();

            var movingEpisode = oldEpisodes[request.OldEpisodeNumber];

            // Step 1: Shift new episodes to make space
            for (int i = newEpisodes.Count - 1; i >= request.NewEpisodeIndex; i--)
            {
                newEpisodes[i].Rename(newSeason.Path, i + 1);
            }

            // Step 2: Move and rename the episode
            string newEpisodePath = Path.Combine(newSeason.Path, $"{request.NewEpisodeIndex} - {movingEpisode.Name}");
            Directory.Move(movingEpisode.FullPath, newEpisodePath);

            newEpisodes.Insert(request.NewEpisodeIndex, new EpisodeFolder(newEpisodePath));

            // Step 3: Fix old season episode order (if moved between seasons)
            if (request.OldSeasonNumber != request.NewSeasonNumber)
            {
                oldEpisodes.RemoveAt(request.OldEpisodeNumber);
                for (int i = 0; i < oldEpisodes.Count; i++)
                {
                    oldEpisodes[i].Rename(oldSeason.Path, i);
                }
            }

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error updating episode order: " + ex.Message);
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    public class EpisodeMoveRequest
    {
        public int OldSeasonNumber { get; set; }
        public int NewSeasonNumber { get; set; }
        public int OldEpisodeNumber { get; set; }
        public int NewEpisodeIndex { get; set; }
    }

    public class EpisodeFolder
    {
        public int Number { get; set; }
        public string Name { get; set; }
        public string FullPath { get; set; }

        public EpisodeFolder(string fullPath)
        {
            FullPath = fullPath;
            var parts = Path.GetFileName(fullPath).Split(" - ");
            Number = int.Parse(parts[0]);
            Name = parts.Length > 1 ? parts[1] : "";
        }

        public void Rename(string seasonPath, int newNumber)
        {
            string newName = $"{newNumber} - {Name}";
            string newPath = Path.Combine(seasonPath, newName);
            if (FullPath != newPath)
            {
                Directory.Move(FullPath, newPath);
                FullPath = newPath;
                Number = newNumber;
            }
        }
    }

}
