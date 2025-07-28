#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = "Submix-Partners-Replit";
const REPO_DESCRIPTION = "Comprehensive B2B2C affiliate program platform for Submix.io with advanced partner management, intelligent commission processing, and flexible tracking mechanisms.";

if (!GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN environment variable is required");
    process.exit(1);
}

async function createGitHubRepo() {
    console.log("Creating GitHub repository...");
    
    try {
        // Create the repository using GitHub API
        const createRepoResponse = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Replit-GitHub-Integration'
            },
            body: JSON.stringify({
                name: REPO_NAME,
                description: REPO_DESCRIPTION,
                private: false,
                auto_init: false,
                gitignore_template: 'Node',
                license_template: 'mit'
            })
        });

        if (!createRepoResponse.ok) {
            const errorData = await createRepoResponse.json();
            if (errorData.message && errorData.message.includes('already exists')) {
                console.log("Repository already exists, continuing with push...");
            } else {
                throw new Error(`Failed to create repository: ${errorData.message}`);
            }
        } else {
            const repoData = await createRepoResponse.json();
            console.log(`✅ Repository created: ${repoData.html_url}`);
        }

        return `https://github.com/${await getGitHubUsername()}/${REPO_NAME}.git`;
    } catch (error) {
        console.error("Error creating repository:", error);
        throw error;
    }
}

async function getGitHubUsername(): Promise<string> {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Replit-GitHub-Integration'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to get GitHub user info');
    }

    const userData = await response.json();
    return userData.login;
}

function runCommand(command: string, description: string) {
    console.log(`${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed`);
    } catch (error) {
        console.error(`❌ Failed: ${description}`);
        throw error;
    }
}

async function pushToGitHub() {
    console.log("🚀 Starting GitHub repository setup and push...");
    
    try {
        // Get the repository URL
        const repoUrl = await createGitHubRepo();
        const username = await getGitHubUsername();
        const authenticatedUrl = repoUrl.replace('https://', `https://${username}:${GITHUB_TOKEN}@`);
        
        // Create a comprehensive README
        const readmeContent = `# Submix Partners (Replit)

A comprehensive B2B2C affiliate program platform for Submix.io featuring advanced partner management, intelligent commission processing, and flexible tracking mechanisms.

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Vite, and Tailwind CSS
- **Backend**: Express.js with TypeScript and PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **UI Components**: Radix UI with shadcn/ui design system

## 🚀 Features

### Partner Management
- Complete partner lifecycle management
- Advanced commission models (new customers only, coupon-based, period-based)
- Partner approval workflow with status tracking
- Comprehensive partner portal with dashboard

### Commission Processing
- Intelligent commission calculation engine
- Multiple payout models and validation rules
- Automated payment processing
- Customer history tracking and fraud detection

### Security & Compliance
- GDPR compliance with data privacy tools
- Comprehensive audit trail system
- Fraud detection and prevention
- Secure password reset with token-based system

### Reporting & Analytics
- Real-time partner performance metrics
- CSV export functionality for all reports
- Commission tracking and payout history
- Coupon usage analytics

## 🎨 Branding

Fully integrated with Submix branding including:
- Official Submix logos and favicon
- Custom Aktiv Grotesk typography family
- Consistent brand colors and design system

## 📚 Documentation

Comprehensive technical documentation available in the \`docs/\` directory:

- **Technical Documentation**: System architecture and implementation details
- **API Reference**: Complete API documentation with examples
- **Deployment Guide**: Production deployment and operations
- **README**: Project overview and quick start guide

## 🛠️ Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Push database schema
npm run db:push

# Generate database migrations
npm run db:generate
\`\`\`

## 🔧 Environment Variables

Required environment variables:
- \`DATABASE_URL\`: PostgreSQL connection string
- \`SESSION_SECRET\`: Session encryption key
- \`NODE_ENV\`: Environment mode (development/production)

## 📦 Deployment

Built for deployment on Replit with proper configuration for both development and production environments. The application supports horizontal scaling through stateless API design and external session storage.

## 🏢 Company

Built for **Submix.io** - Advanced affiliate program management platform.

## 📄 License

MIT License - See LICENSE file for details.
`;

        writeFileSync('README.md', readmeContent);
        console.log("✅ Created comprehensive README.md");

        // Initialize git repository
        runCommand('git init', 'Initializing Git repository');
        
        // Configure git user (using GitHub token info)
        runCommand(`git config user.name "${username}"`, 'Setting Git username');
        runCommand('git config user.email "noreply@github.com"', 'Setting Git email');
        
        // Add all files
        runCommand('git add .', 'Adding all files to Git');
        
        // Create initial commit
        runCommand('git commit -m "Initial commit: Submix Partners affiliate program platform\n\n- Complete React TypeScript frontend with Vite\n- Express.js backend with PostgreSQL and Drizzle ORM\n- Advanced partner management and commission processing\n- Comprehensive documentation suite\n- Submix branding with Aktiv Grotesk fonts\n- Security features: GDPR compliance, audit trails, fraud detection\n- Partner portal with authentication and dashboard\n- CSV reporting and analytics\n- Production-ready deployment configuration"', 'Creating initial commit');
        
        // Add remote origin
        runCommand(`git remote add origin ${authenticatedUrl}`, 'Adding GitHub remote');
        
        // Set main branch
        runCommand('git branch -M main', 'Setting main branch');
        
        // Push to GitHub
        runCommand('git push -u origin main', 'Pushing to GitHub');
        
        console.log(`\n🎉 Successfully pushed to GitHub!`);
        console.log(`📂 Repository: https://github.com/${username}/${REPO_NAME}`);
        console.log(`🔗 Direct link: https://github.com/${username}/${REPO_NAME}`);
        
    } catch (error) {
        console.error("Failed to push to GitHub:", error);
        process.exit(1);
    }
}

// Run the GitHub push
pushToGitHub().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});