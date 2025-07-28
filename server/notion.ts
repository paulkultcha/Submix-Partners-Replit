import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Create a new page in Notion with markdown content
 */
export async function createNotionPage(title: string, content: string) {
    try {
        // Split content into blocks (Notion has a limit of 100 blocks per page)
        const allBlocks = splitContentIntoBlocks(content);
        
        if (allBlocks.length <= 100) {
            // Single page
            const response = await notion.pages.create({
                parent: {
                    type: "page_id",
                    page_id: NOTION_PAGE_ID
                },
                properties: {
                    title: {
                        title: [
                            {
                                text: {
                                    content: title
                                }
                            }
                        ]
                    }
                },
                children: allBlocks
            });
            return response;
        } else {
            // Split into multiple pages
            const mainPage = await notion.pages.create({
                parent: {
                    type: "page_id",
                    page_id: NOTION_PAGE_ID
                },
                properties: {
                    title: {
                        title: [
                            {
                                text: {
                                    content: title
                                }
                            }
                        ]
                    }
                },
                children: allBlocks.slice(0, 99).concat([{
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: "📄 Content continues in additional pages below..."
                                }
                            }
                        ]
                    }
                }])
            });

            // Create additional pages for remaining content
            let partNumber = 2;
            for (let i = 99; i < allBlocks.length; i += 100) {
                const partBlocks = allBlocks.slice(i, i + 100);
                await notion.pages.create({
                    parent: {
                        type: "page_id",
                        page_id: mainPage.id
                    },
                    properties: {
                        title: {
                            title: [
                                {
                                    text: {
                                        content: `${title} - Part ${partNumber}`
                                    }
                                }
                            ]
                        }
                    },
                    children: partBlocks
                });
                partNumber++;
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            return mainPage;
        }
    } catch (error) {
        console.error(`Error creating Notion page "${title}":`, error);
        throw error;
    }
}

/**
 * Map code language names to Notion-supported languages
 */
function mapLanguageToNotion(lang: string): string {
    const languageMap: { [key: string]: string } = {
        'env': 'plain text',
        'ini': 'plain text',
        'dockerfile': 'docker',
        'nginx': 'plain text',
        'systemd': 'plain text',
        'bash': 'shell',
        'sh': 'shell',
        'http': 'plain text',
        'curl': 'shell',
        'yaml': 'yaml',
        'yml': 'yaml',
        'json': 'json',
        'js': 'javascript',
        'ts': 'typescript',
        'sql': 'sql',
        'md': 'markdown',
        'jsx': 'javascript',
        'tsx': 'typescript'
    };
    
    return languageMap[lang.toLowerCase()] || lang.toLowerCase() || 'plain text';
}

/**
 * Split markdown content into Notion blocks
 */
function splitContentIntoBlocks(content: string) {
    const lines = content.split('\n');
    const blocks: any[] = [];
    let currentTextBlock = '';
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Handle code blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End of code block - split if too long
                const trimmedContent = codeContent.trim();
                if (trimmedContent.length <= 2000) {
                    blocks.push({
                        object: "block",
                        type: "code",
                        code: {
                            caption: [],
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: trimmedContent
                                    }
                                }
                            ],
                            language: mapLanguageToNotion(codeLanguage)
                        }
                    });
                } else {
                    // Split long code block into multiple blocks
                    const chunks = splitCodeIntoChunks(trimmedContent, 1900);
                    chunks.forEach((chunk, index) => {
                        blocks.push({
                            object: "block",
                            type: "code",
                            code: {
                                caption: index === 0 ? [] : [{
                                    type: "text",
                                    text: { content: "(continued)" }
                                }],
                                rich_text: [
                                    {
                                        type: "text",
                                        text: {
                                            content: chunk
                                        }
                                    }
                                ],
                                language: mapLanguageToNotion(codeLanguage)
                            }
                        });
                    });
                }
                inCodeBlock = false;
                codeContent = '';
                codeLanguage = '';
            } else {
                // Start of code block
                if (currentTextBlock.trim()) {
                    blocks.push(createTextBlock(currentTextBlock.trim()));
                    currentTextBlock = '';
                }
                inCodeBlock = true;
                codeLanguage = line.substring(3).trim();
            }
            continue;
        }

        if (inCodeBlock) {
            codeContent += line + '\n';
            continue;
        }

        // Handle headers
        if (line.startsWith('# ')) {
            if (currentTextBlock.trim()) {
                blocks.push(createTextBlock(currentTextBlock.trim()));
                currentTextBlock = '';
            }
            blocks.push({
                object: "block",
                type: "heading_1",
                heading_1: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: line.substring(2)
                            }
                        }
                    ]
                }
            });
        } else if (line.startsWith('## ')) {
            if (currentTextBlock.trim()) {
                blocks.push(createTextBlock(currentTextBlock.trim()));
                currentTextBlock = '';
            }
            blocks.push({
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: line.substring(3)
                            }
                        }
                    ]
                }
            });
        } else if (line.startsWith('### ')) {
            if (currentTextBlock.trim()) {
                blocks.push(createTextBlock(currentTextBlock.trim()));
                currentTextBlock = '';
            }
            blocks.push({
                object: "block",
                type: "heading_3",
                heading_3: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: line.substring(4)
                            }
                        }
                    ]
                }
            });
        } else {
            // Regular text line
            currentTextBlock += line + '\n';
            
            // If text block is getting too long, split it
            if (currentTextBlock.length > 1800) {
                blocks.push(createTextBlock(currentTextBlock.trim()));
                currentTextBlock = '';
            }
        }
    }

    // Add any remaining text
    if (currentTextBlock.trim()) {
        blocks.push(createTextBlock(currentTextBlock.trim()));
    }

    return blocks;
}

/**
 * Split long code content into chunks
 */
function splitCodeIntoChunks(content: string, maxLength: number): string[] {
    if (content.length <= maxLength) {
        return [content];
    }
    
    const chunks: string[] = [];
    const lines = content.split('\n');
    let currentChunk = '';
    
    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = line;
            } else {
                // Single line is too long, split it
                chunks.push(line.substring(0, maxLength));
                currentChunk = line.substring(maxLength);
            }
        } else {
            if (currentChunk) {
                currentChunk += '\n' + line;
            } else {
                currentChunk = line;
            }
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks;
}

/**
 * Create a text block for Notion
 */
function createTextBlock(text: string) {
    return {
        object: "block",
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: text
                    }
                }
            ]
        }
    };
}

/**
 * Check if Notion integration is properly configured
 */
export async function testNotionConnection() {
    try {
        const response = await notion.pages.retrieve({
            page_id: NOTION_PAGE_ID
        });
        console.log("Notion connection successful");
        return true;
    } catch (error) {
        console.error("Notion connection failed:", error);
        return false;
    }
}