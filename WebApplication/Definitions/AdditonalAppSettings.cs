﻿namespace WebApplication.Definitions
{
    // Strongly typed classes for settings defined in appsettings.json to be deserialized to

    public class AppBundleZipPaths
    {
        public string CreateSVF { get; set; }
        public string CreateThumbnail { get; set; }
        public string ExtractParameters { get; set; }
        public string UpdateParameters { get; set; }
    }

    public class DefaultProjectsConfiguration
    {
        public DefaultProjectConfiguration[] Projects { get; set; }
    }

    public class DefaultProjectConfiguration : ProjectInfo
    {
        public string Url { get; set; }
    }
}
