namespace ReactPharmacyPortal.DTOs
{
    public class FileDownloadDto
    {
        public byte[] FileContent { get; set; } = null!;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/pdf";
    }
}