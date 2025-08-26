
---
title: "Vulfy"
date: 2025-05-18
draft: false
description: "🐺 Fast Rust-based package version scanner."
tags: ["Rust", "vulnerability", "dependency"]
links:
  - icon: "github"
    name: "GitHub"
    url: "https://github.com/mindPatch/vulfy"
---

# Vulfy 🐺

**Vulfy** is a fast, cross-language vulnerability scanner that checks your project dependencies for known security issues across 9 programming languages. Built with Rust for maximum performance and reliability.

## Overview

Vulfy is designed to be the fastest and most comprehensive dependency vulnerability scanner available. It integrates with the OSV.dev vulnerability database to provide up-to-date security information about your project dependencies. With zero configuration required, Vulfy is ready to scan your projects right out of the box.

Key advantages:
- **Lightning-fast scanning** using Rust's performance capabilities
- **Cross-language support** for 9 different programming ecosystems  
- **Zero configuration** - works immediately without setup
- **CI/CD ready** for seamless integration into development workflows

## Key Features

⚡ **Blazing Fast Performance**
- Written in Rust for maximum speed and efficiency
- Concurrent package analysis
- Optimized dependency resolution
- Minimal resource consumption

🔍 **Multi-Language Support**
- 📦 **npm** (Node.js/JavaScript)
- 🐍 **Python** (pip, poetry, pipenv)
- 🦀 **Rust** (Cargo)
- ☕ **Java** (Maven, Gradle)
- 🐹 **Go** (go modules)
- 💎 **Ruby** (Bundler)
- ⚙️ **C/C++** (vcpkg, conan)
- 🐘 **PHP** (Composer)
- 🔷 **.NET** (NuGet)

🛡️ **Advanced Security Features**
- Integration with OSV.dev vulnerability database
- Real-time vulnerability detection
- Advanced policy engine for custom rules
- High-severity vulnerability filtering
- Multi-platform notifications

📊 **Flexible Output Formats**
- Table format (default, human-readable)
- JSON (structured data)
- CSV (spreadsheet compatible)  
- SARIF (static analysis results format)
- Custom formatting options

## How It Works

1. **Project Analysis**: Automatically detects package managers and dependency files
2. **Dependency Parsing**: Extracts package names and versions from manifest files
3. **Vulnerability Lookup**: Queries OSV.dev database for known security issues
4. **Risk Assessment**: Evaluates severity levels and potential impact
5. **Report Generation**: Outputs results in your preferred format

## Installation

### Pre-built Binaries (Recommended)
```bash
# Download latest release for your platform
# Available for Linux, macOS, and Windows
wget https://github.com/mindpatch/vulfy/releases/latest/download/vulfy-linux
chmod +x vulfy-linux
```

### Via Cargo
```bash
cargo install vulfy
```

### From Source
```bash
git clone https://github.com/mindpatch/vulfy
cd vulfy
cargo build --release
```

## Usage Examples

```bash
# Basic scan of current directory
vulfy scan packages

# Scan specific directory
vulfy scan packages --path /path/to/project

# Show only high-severity vulnerabilities
vulfy scan packages --high-only

# Output as JSON
vulfy scan packages --format json --output report.json

# Export as CSV for analysis
vulfy scan packages --format csv --output vulnerabilities.csv

# Generate SARIF report for CI/CD
vulfy scan packages --format sarif --output results.sarif
```

## Vulnerability Data Source

Vulfy integrates with **OSV.dev** (Open Source Vulnerabilities), which aggregates vulnerability data from multiple sources:
- Google OSV Database
- GitHub Security Advisories
- npm Security Advisories  
- PyPA Advisory Database
- RustSec Advisory Database
- Go Vulnerability Database
- And many more ecosystem-specific databases

## Architecture & Performance

**Async-First Design**
- Built with Tokio for maximum concurrency
- Non-blocking I/O operations
- Efficient memory usage

**Strategy Pattern Implementation**  
- Modular package manager support
- Easy to extend for new ecosystems
- Clean separation of concerns

**Error Resilient**
- Graceful handling of network failures
- Partial scan results when possible
- Detailed error reporting

## CI/CD Integration

Simple integration examples:

### GitHub Actions
```yaml
- name: Scan Dependencies
  run: |
    curl -L https://github.com/mindpatch/vulfy/releases/latest/download/vulfy-linux -o vulfy
    chmod +x vulfy
    ./vulfy scan packages --high-only
```

### GitLab CI
```yaml
scan:
  script:
    - curl -L https://github.com/mindpatch/vulfy/releases/latest/download/vulfy-linux -o vulfy
    - chmod +x vulfy
    - ./vulfy scan packages
```

## Use Cases

- Check dependencies before releases
- Find vulnerable packages in existing projects
- Integrate security checks into development workflow
- Generate reports for security audits

## Roadmap

Planned features:
- **Fix Mode**: Automatically suggest dependency updates
- **Trend Analysis**: Track vulnerability trends over time  
- **Watch Mode**: Monitor projects for new vulnerabilities
- **Container Scanning**: Extend beyond package dependencies

## Technical Details

- **Language**: Rust  
- **Async Runtime**: Tokio
- **HTTP Client**: Reqwest
- **Data Source**: OSV.dev API
- **Output Formats**: Table, JSON, CSV, SARIF
- **License**: MIT

Vulfy is a straightforward tool for checking if your project dependencies have known security vulnerabilities. It's designed to be fast, easy to use, and integrate well with existing development workflows.
