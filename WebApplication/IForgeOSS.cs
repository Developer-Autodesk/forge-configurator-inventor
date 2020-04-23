using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Autodesk.Forge.Core;
using Autodesk.Forge.Model;

namespace WebApplication
{
    public enum ObjectAccess
    {
        Read,
        Write,
        ReadWrite
    }

    public interface IForgeOSS
    {
        /// <summary>
        /// Forge configuration.
        /// </summary>
        ForgeConfiguration Configuration { get; }

        Task<List<ObjectDetails>> GetBucketObjectsAsync(string bucketKey, string beginsWith = null);
        Task CreateBucketAsync(string bucketKey);
        Task DeleteBucketAsync(string bucketKey);
        Task CreateEmptyObjectAsync(string bucketKey, string objectName);
        Task UploadObjectAsync(string bucketKey, Stream stream, string objectName);
        Task UploadChunkAsync(string bucketKey, Stream stream, string objectName, string contentRange, string sessionId);

        /// <summary>
        /// Generate a signed URL to OSS object.
        /// NOTE: An empty object created if not exists.
        /// </summary>
        /// <param name="bucketKey">Bucket key.</param>
        /// <param name="objectName">Object name.</param>
        /// <param name="access">Requested access to the object.</param>
        /// <param name="minutesExpiration">Minutes while the URL is valid. Default is 30 minutes.</param>
        /// <returns>Signed URL</returns>
        Task<string> CreateSignedUrlAsync(string bucketKey, string objectName, ObjectAccess access = ObjectAccess.Read, int minutesExpiration = 30);

        /// <summary>
        /// Rename object.
        /// </summary>
        /// <param name="bucketKey">Bucket key.</param>
        /// <param name="oldName">Old object name.</param>
        /// <param name="newName">New object name.</param>
        Task RenameObjectAsync(string bucketKey, string oldName, string newName);
    }
}
