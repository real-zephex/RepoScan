# RepoScan

A powerful web application for scanning GitHub repositories for security vulnerabilities and generating AI-powered code fixes. Built with Next.js, TypeScript, and modern web technologies.

## Features

### 🔍 Repository Analysis
- **GitHub Integration**: Import and analyze any public GitHub repository
- **File Structure Explorer**: Interactive tree view of repository contents
- **Multi-format Support**: View files in various programming languages with syntax highlighting

### 🛡️ AI-Powered Security Scanning
- **Vulnerability Detection**: Uses advanced AI to identify CWE/SANS Top 25 vulnerabilities
- **Comprehensive Coverage**: Scans for injection attacks, authentication issues, access control problems, cryptographic weaknesses, memory safety issues, and more
- **Severity Classification**: Critical, high, medium, and low severity ratings
- **Detailed Reports**: Includes CWE IDs, descriptions, and actionable remediation suggestions

### 🔧 Code Fixing
- **AI-Generated Fixes**: Automatically generate secure code fixes for identified vulnerabilities
- **Before/After Comparison**: Toggle between original and fixed code
- **Caching**: Optimized performance with intelligent caching of analysis results

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Themes**: Support for system theme preferences
- **Intuitive Interface**: Clean, professional design with smooth animations
- **Real-time Feedback**: Toast notifications for all operations

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Code Editor**: Monaco Editor (same as VS Code)
- **AI/ML**: Groq API for vulnerability scanning and code generation
- **GitHub API**: Octokit for repository access
- **State Management**: React Context API
- **Font**: Space Mono for monospace text

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- GitHub API Key (for repository access)
- Groq API Key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/repo-documentation-maker.git
cd repo-documentation-maker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add your API keys:
```env
GITHUB_API_KEY=your_github_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Importing a Repository

1. Click the "Import Repo" button in the navigation bar
2. Enter the GitHub repository URL (e.g., `https://github.com/owner/repo`)
3. Specify the branch name (defaults to `main`)
4. Click "Import" to load the repository structure

### Exploring Files

- Use the file explorer on the left to navigate through the repository
- Click on any file to view its contents in the editor
- Files are displayed with appropriate syntax highlighting based on their extension

### Scanning for Vulnerabilities

1. Open a code file in the editor
2. Click the "Analyze" button in the file header
3. View the vulnerability report in the bottom sheet
4. Each vulnerability includes:
   - Severity level and CWE information
   - Code snippet highlighting the issue
   - Detailed description and fix suggestions

### Applying Code Fixes

1. After running a vulnerability scan, click the sparkle icon (✨) to generate AI fixes
2. Toggle between original and fixed code using the same button
3. Review the changes in the editor before applying

## Supported File Types

The application supports syntax highlighting for numerous programming languages including:

- JavaScript/TypeScript (.js, .jsx, .ts, .tsx)
- Python (.py)
- Java (.java)
- C/C++ (.c, .cpp, .cc, .cxx)
- C# (.cs)
- PHP (.php)
- Ruby (.rb)
- Go (.go)
- Rust (.rs)
- Swift (.swift)
- Kotlin (.kt)
- Dart (.dart)
- And many more...

## API Keys Setup

### GitHub API Key

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` scope
3. Add it to your `.env.local` file as `GITHUB_API_KEY`

### Groq API Key

1. Sign up at [Groq Console](https://console.groq.com/)
2. Create an API key
3. Add it to your `.env.local` file as `GROQ_API_KEY`

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── context/           # React contexts
│   │   ├── RepositoryContext.tsx
│   │   └── ToastContext.tsx
│   └── ui/                # UI components
│       ├── custom-ui/     # Custom components
│       └── [component]/   # Radix UI components
├── hooks/                 # Custom React hooks
└── lib/
    ├── actions/           # Server actions
    │   └── github.ts      # GitHub API integration
    └── models/            # AI models and utilities
        ├── functions/     # AI functions
        └── groqInstance.ts # Groq client
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Security

This application is designed to help improve code security by identifying vulnerabilities. However:

- Always review AI-generated code fixes before applying them
- Use this tool as part of a comprehensive security strategy
- Consider professional security audits for critical applications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Groq](https://groq.com/) - AI inference platform
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API client
