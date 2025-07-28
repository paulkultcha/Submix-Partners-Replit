#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import { notion, createNotionPage, testNotionConnection } from '../server/notion';

// Documentation files to export
const documentationFiles = [
    {
        title: "📋 Technical Documentation",
        file: "docs/PARTNER_PROGRAM_DOCUMENTATION.md",
        description: "Comprehensive technical overview of the Submix Partner Program system"
    },
    {
        title: "🔌 API Reference", 
        file: "docs/API_REFERENCE.md",
        description: "Complete API documentation for developers and integrations"
    },
    {
        title: "🚀 Deployment Guide",
        file: "docs/DEPLOYMENT_GUIDE.md", 
        description: "Production deployment and operations guide"
    },
    {
        title: "📖 Documentation Index",
        file: "docs/README.md",
        description: "Overview and navigation guide for all documentation"
    }
];

async function exportDocumentationToNotion() {
    console.log("Starting documentation export to Notion...");
    
    // Test Notion connection first
    const isConnected = await testNotionConnection();
    if (!isConnected) {
        console.error("Failed to connect to Notion. Please check your credentials.");
        process.exit(1);
    }

    console.log("Notion connection successful. Exporting documentation...");

    try {
        // Create each documentation page
        for (const doc of documentationFiles) {
            console.log(`Exporting: ${doc.title}`);
            
            try {
                // Read the file content
                const filePath = join(process.cwd(), doc.file);
                const content = readFileSync(filePath, 'utf-8');
                
                // Create the page in Notion
                const page = await createNotionPage(doc.title, content);
                
                console.log(`✅ Successfully created: ${doc.title}`);
                console.log(`   Page ID: ${page.id}`);
                
                // Add a small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (fileError) {
                console.error(`❌ Error exporting ${doc.title}:`, fileError);
            }
        }

        console.log("\n🎉 Documentation export completed!");
        console.log("\nCreated pages in your Notion workspace:");
        
        for (const doc of documentationFiles) {
            console.log(`- ${doc.title}`);
            console.log(`  ${doc.description}`);
        }

        console.log(`\nAll documentation is now available in your "Affiliate Program Documentation" workspace.`);
        
    } catch (error) {
        console.error("Error during export:", error);
        process.exit(1);
    }
}

// Check if required environment variables are set
if (!process.env.NOTION_INTEGRATION_SECRET) {
    console.error("NOTION_INTEGRATION_SECRET environment variable is required");
    process.exit(1);
}

if (!process.env.NOTION_PAGE_URL) {
    console.error("NOTION_PAGE_URL environment variable is required");
    process.exit(1);
}

// Run the export
exportDocumentationToNotion().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});