using System;
using System.IO;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace KokoodiReportGenerator
{
    /// <summary>
    /// Part 3: C# OpenXML Implementation
    /// Required NuGet Package: DocumentFormat.OpenXml (version 2.x or 3.x)
    /// Install via: dotnet add package DocumentFormat.OpenXml
    /// </summary>
    public class ReportGenerator
    {
        /// <summary>
        /// Creates a simple Word document report using OpenXML SDK
        /// </summary>
        /// <param name="clientName">Name or ID of the client</param>
        /// <param name="reportType">Type of report (P&L, Balance Sheet, or Cash Flow)</param>
        /// <param name="reportingYear">Year for the financial report</param>
        /// <returns>Full path to the generated document</returns>
        public static string CreateSimpleReport(string clientName, string reportType, int reportingYear)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(clientName))
                throw new ArgumentException("Client name cannot be empty", nameof(clientName));
            
            if (string.IsNullOrWhiteSpace(reportType))
                throw new ArgumentException("Report type cannot be empty", nameof(reportType));
            
            // Generate filename with timestamp for uniqueness
            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string fileName = $"GeneratedReport_{reportType.Replace(" ", "")}_{timestamp}.docx";
            string filePath = Path.Combine(Environment.CurrentDirectory, fileName);
            
            try
            {
                // Create a new Word document
                using (WordprocessingDocument wordDoc = WordprocessingDocument.Create(
                    filePath, 
                    WordprocessingDocumentType.Document))
                {
                    // Add main document part
                    MainDocumentPart mainPart = wordDoc.AddMainDocumentPart();
                    mainPart.Document = new Document();
                    Body body = new Body();
                    
                    // Create document title
                    Paragraph titleParagraph = CreateParagraph(
                        $"Financial Report: {reportType}", 
                        isBold: true, 
                        fontSize: "32"
                    );
                    body.Append(titleParagraph);
                    
                    // Add spacing
                    body.Append(CreateParagraph("", false, "24"));
                    
                    // Create main content paragraph
                    Paragraph contentParagraph = CreateParagraph(
                        $"Report: {reportType} for Client: {clientName}", 
                        isBold: false, 
                        fontSize: "24"
                    );
                    body.Append(contentParagraph);
                    
                    // Add reporting year
                    Paragraph yearParagraph = CreateParagraph(
                        $"Reporting Year: {reportingYear}", 
                        isBold: false, 
                        fontSize: "24"
                    );
                    body.Append(yearParagraph);
                    
                    // Add generation timestamp
                    body.Append(CreateParagraph("", false, "24"));
                    Paragraph timestampParagraph = CreateParagraph(
                        $"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", 
                        isBold: false, 
                        fontSize: "20"
                    );
                    timestampParagraph.ParagraphProperties = new ParagraphProperties(
                        new ParagraphStyleId() { Val = "Normal" }
                    );
                    
                    Run timestampRun = timestampParagraph.Elements<Run>().First();
                    timestampRun.RunProperties = new RunProperties(
                        new RunFonts() { Ascii = "Calibri" },
                        new FontSize() { Val = "20" },
                        new Color() { Val = "666666" }
                    );
                    body.Append(timestampParagraph);
                    
                    // Append body to document
                    mainPart.Document.Append(body);
                    mainPart.Document.Save();
                }
                
                Console.WriteLine($"Report successfully created: {filePath}");
                return filePath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating report: {ex.Message}");
                throw;
            }
        }
        
        /// <summary>
        /// Helper method to create formatted paragraphs
        /// </summary>
        private static Paragraph CreateParagraph(string text, bool isBold, string fontSize)
        {
            Paragraph paragraph = new Paragraph();
            Run run = new Run();
            
            RunProperties runProperties = new RunProperties();
            runProperties.Append(new RunFonts() { Ascii = "Calibri" });
            runProperties.Append(new FontSize() { Val = fontSize });
            
            if (isBold)
            {
                runProperties.Append(new Bold());
            }
            
            run.Append(runProperties);
            run.Append(new Text(text));
            paragraph.Append(run);
            
            return paragraph;
        }
        
        /// <summary>
        /// Example usage and entry point for testing
        /// </summary>
        public static void Main(string[] args)
        {
            try
            {
                // Example: Generate a P&L report for Acme Corp
                string reportPath = CreateSimpleReport(
                    clientName: "Acme Corporation",
                    reportType: "P&L",
                    reportingYear: 2025
                );
                
                Console.WriteLine($"\nSuccess! Report saved to:\n{reportPath}");
                Console.WriteLine("\nPress any key to exit...");
                Console.ReadKey();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nError: {ex.Message}");
                Console.WriteLine("\nPress any key to exit...");
                Console.ReadKey();
            }
        }
    }
}

/*
Part 3: Architectural Explanation

Why C#/OpenXML runs on the server instead of JavaScript/Office.js in the Task Pane:

The C#/OpenXML approach runs on the server because it requires direct file system access 
and complex binary document manipulation that cannot be performed in the browser's sandboxed 
JavaScript environment. Office.js is designed for interacting with the open document in 
the Task Pane, but creating entirely new, well-formatted Word documents with precise styling, 
structure, and OpenXML compliance requires server-side processing with the full .NET SDK. 
Additionally, server-side generation enables centralized business logic, database integration, 
template management, and secure document storage without exposing sensitive operations to 
the client.
*/
