
---
title: "Lorsrf"
date: 2025-05-10
draft: false
description: "Fast CLI tool to discover parameters vulnerable to SSRF or out-of-band resource load 🛰️."
tags: ["Rust", "SSRF", "bug bounty"]
links:
  - icon: "github"
    name: "GitHub"
    url: "https://github.com/mindpatch/lorsrf"
---

# Lorsrf 🛰️

**Lorsrf** is a fast, efficient CLI tool written in Rust designed to discover HTTP parameters that are vulnerable to **Server-Side Request Forgery (SSRF)** attacks and out-of-band resource loading vulnerabilities.

## Overview

SSRF vulnerabilities occur when an application makes requests to external resources based on user-controlled input without proper validation. These vulnerabilities can lead to:

- Internal network reconnaissance
- Cloud metadata access (AWS, Azure, GCP)
- Port scanning of internal services
- Reading local files via file:// protocol
- Bypassing firewalls and access controls

## Key Features

🚀 **High Performance**
- Written in Rust for maximum speed and memory safety
- Concurrent request processing
- Minimal resource consumption

🎯 **Smart Detection**
- Automatic parameter discovery in URLs, forms, and JSON
- Multiple payload injection techniques
- Support for various SSRF attack vectors

🔍 **Comprehensive Testing**
- HTTP/HTTPS parameter testing
- POST data parameter analysis
- JSON parameter injection
- Custom payload support

⚡ **Fast Execution**
- Multi-threaded scanning
- Intelligent rate limiting
- Resume capability for large scans

## How It Works

1. **Parameter Discovery**: Automatically identifies potential injection points in web applications
2. **Payload Injection**: Injects SSRF test payloads into discovered parameters
3. **Response Analysis**: Analyzes responses for indicators of successful SSRF
4. **Out-of-Band Detection**: Integrates with external services to detect blind SSRF

## Installation

```bash
# Install from GitHub releases
wget https://github.com/mindpatch/lorsrf/releases/latest/download/lorsrf-linux
chmod +x lorsrf-linux

# Or build from source
git clone https://github.com/mindpatch/lorsrf
cd lorsrf
cargo build --release
```

## Usage Examples

```bash
# Basic SSRF parameter discovery
./lorsrf -u https://target.com/api/endpoint

# Scan with custom payload list
./lorsrf -u https://target.com -p payloads.txt

# Scan multiple URLs from file
./lorsrf -l urls.txt -t 50

# Use with Burp Suite collaboration server
./lorsrf -u https://target.com --collaborator burp-collab-url
```

## Use Cases

- **Bug Bounty Hunting**: Quickly identify SSRF vulnerabilities in web applications
- **Penetration Testing**: Automated parameter fuzzing for SSRF detection
- **Security Research**: Discover new SSRF attack vectors and bypasses
- **Red Team Operations**: Internal network reconnaissance via SSRF

## Technical Details

- **Language**: Rust
- **Dependencies**: Tokio for async operations, Reqwest for HTTP client
- **Performance**: Capable of testing thousands of parameters per minute
- **Output Formats**: JSON, CSV, plain text

This tool is part of my security research toolkit, designed to make SSRF discovery more efficient and accessible to security researchers and bug bounty hunters.
