using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Autodesk.Forge.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebApplication.Processing;
using WebApplication.Utilities;

namespace WebApplication
{
    /// <summary>
    /// All data required for project adoption.
    /// </summary>
    public class AdoptionData
    {
        public string InputUrl { get; set; }

        /// <summary>
        /// Relative path to top level assembly in ZIP with assembly.
        /// </summary>
        public string TLA { get; set; }

        public string ThumbnailUrl { get; set; }
        public string SvfUrl { get; set; }
        public string ParametersJsonUrl { get; set; }
    }

    public class Initializer
    {
        private readonly IForge _forge;
        private readonly ResourceProvider _resourceProvider;
        private readonly ILogger<Initializer> _logger;
        private readonly IConfiguration _configuration;
        private readonly FdaClient _fdaClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public Initializer(IForge forge, ResourceProvider resourceProvider, ILogger<Initializer> logger, FdaClient fdaClient, IConfiguration configuration)
        {
            _forge = forge;
            _resourceProvider = resourceProvider;
            _logger = logger;
            _fdaClient = fdaClient;
            _configuration = configuration;
        }

        public async Task Initialize()
        {
            // create bundles and activities
            await _fdaClient.Initialize();

            _logger.LogInformation("Initializing base data");

            await _forge.CreateBucket(_resourceProvider.BucketName);
            _logger.LogInformation($"Bucket {_resourceProvider.BucketName} created");

            // download default project files from the public location
            // specified by the appsettings.json
            using (var client = new HttpClient())
            {
                string[] defaultProjects = _configuration.GetSection("DefaultProjects:Files").Get<string[]>();
                string[] tlaFilenames = _configuration.GetSection("DefaultProjects:TopLevelAssemblies").Get<string[]>();
                if (defaultProjects.Length != tlaFilenames.Length)
                {
                    throw new Exception("Default projects are not in sync with TLA names");
                }

                for (var i = 0; i < defaultProjects.Length; i++)
                {
                    var projectUrl = defaultProjects[i];
                    var tlaFilename = tlaFilenames[i];

                    _logger.LogInformation($"Download {projectUrl}");

                    using HttpResponseMessage response = await client.GetAsync(projectUrl).ConfigureAwait(false);
                    response.EnsureSuccessStatusCode();

                    _logger.LogInformation("Upload to the app bucket");

                    Stream stream = await response.Content.ReadAsStreamAsync();
                    string[] urlParts = projectUrl.Split("/");
                    string projectName = urlParts[^1];
                    var project = new Project(projectName);

                    await _forge.UploadObject(_resourceProvider.BucketName, stream, project.OSSSourceModel);

#if true // not ready
                    _logger.LogInformation("Adopt the project");

                    var projectUrls = new AdoptionData // TODO: check - can do it in parallel?
                    {
                        InputUrl = await _forge.CreateSignedUrl(_resourceProvider.BucketName, project.OSSSourceModel, "read"),
                        ThumbnailUrl = await _forge.CreateSignedUrl(_resourceProvider.BucketName, project.OSSThumbnail, "write"),
                        SvfUrl = await _forge.CreateSignedUrl(_resourceProvider.BucketName, project.OriginalSvfZip, "write"),
                        ParametersJsonUrl = await _forge.CreateSignedUrl(_resourceProvider.BucketName, project.ParametersJson, "write"),
                        TLA = tlaFilename
                    };

                    var status = await _fdaClient.Adopt(projectUrls);
                    //_logger.LogInformation(System.Text.Json.JsonSerializer.Serialize(status, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
#endif
                }
            }

            _logger.LogInformation("Added default projects.");
        }

        public async Task Clear()
        {
            try
            {
                await _forge.DeleteBucket(_resourceProvider.BucketName);
                // We need to wait because server needs some time to settle it down. If we would go and create bucket immediately again we would receive conflict.
                await Task.Delay(4000);
            }
            catch (ApiException e) when (e.ErrorCode == StatusCodes.Status404NotFound)
            {
                _logger.LogInformation($"Nothing to delete because bucket {_resourceProvider.BucketName} does not exists yet");
            }

            // delete bundles and activities
            await _fdaClient.CleanUp();
        }
    }
}
