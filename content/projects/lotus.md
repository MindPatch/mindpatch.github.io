---
title: "Lotus"
date: 2025-06-01
draft: false
description: "⚡ Fast Web Security Scanner written in Rust based on Lua Scripts."
tags: ["Rust", "scanner", "web security"]
images: ["/images/lotus.png"]
links:
  - icon: "github"
    name: "GitHub"
    url: "https://github.com/CyAxe/lotus"
---

# Lotus ⚡

**Lotus** is a high-performance web security scanner built in Rust that leverages the power and flexibility of Lua scripts for vulnerability detection. It combines the speed and memory safety of Rust with the scriptability and extensibility of Lua.

## Overview

Modern web application security testing requires both speed and flexibility. Lotus addresses this by providing:

- **High-performance scanning** through Rust's efficient concurrency model
- **Extensible detection logic** via Lua scripting engine
- **Customizable vulnerability checks** for specific application types
- **Lightweight resource usage** for large-scale scanning operations

## Key Features

🚀 **Blazing Fast Performance**
- Written in Rust for maximum speed and safety
- Async HTTP client with connection pooling
- Concurrent request processing
- Minimal memory footprint

📝 **Lua-Based Detection Scripts**
- Custom vulnerability detection logic
- Easy-to-write and maintain scripts
- Community-driven script repository
- Support for complex detection patterns

🎯 **Comprehensive Vulnerability Detection**
- SQL Injection detection
- Cross-Site Scripting (XSS) identification
- Server-Side Request Forgery (SSRF) testing
- Directory traversal detection
- Custom payload injection

⚙️ **Flexible Configuration**
- Configurable scan intensity and speed
- Custom headers and authentication
- Proxy support for testing
- Multiple output formats

## Architecture

Lotus uses a modular architecture:

1. **Rust Core Engine**: Handles HTTP requests, concurrency, and performance optimization
2. **Lua Script Engine**: Executes vulnerability detection logic
3. **Plugin System**: Allows for custom detection modules
4. **Reporting Engine**: Generates comprehensive security reports

## Lua Script Examples

### SQL Injection Detection
```lua
-- sqli_basic.lua
function check_sql_injection(response, payload)
    local error_patterns = {
        "mysql_fetch_array",
        "ORA-[0-9]+",
        "PostgreSQL.*ERROR",
        "Warning.*\\Wmysql_"
    }
    
    for _, pattern in ipairs(error_patterns) do
        if string.match(response.body, pattern) then
            return {
                vulnerable = true,
                confidence = "high",
                payload = payload,
                evidence = pattern
            }
        end
    end
    return {vulnerable = false}
end
```

### XSS Detection
```lua
-- xss_reflected.lua
function check_xss(response, payload)
    if string.find(response.body, payload, 1, true) then
        return {
            vulnerable = true,
            type = "reflected_xss",
            payload = payload,
            location = "response_body"
        }
    end
    return {vulnerable = false}
end
```

## Installation

```bash
# Install from GitHub releases
wget https://github.com/CyAxe/lotus/releases/latest/download/lotus-linux
chmod +x lotus-linux

# Build from source
git clone https://github.com/CyAxe/lotus
cd lotus
cargo build --release
```

## Usage Examples

```bash
# Basic web application scan
./lotus scan -u https://target.com

# Scan with custom Lua scripts
./lotus scan -u https://target.com -s custom_scripts/

# High-intensity scan with multiple threads
./lotus scan -u https://target.com -t 100 -i high

# Scan with authentication
./lotus scan -u https://target.com -H "Authorization: Bearer token123"

# Output results to JSON
./lotus scan -u https://target.com -o json -f results.json
```

## Script Development

Creating custom detection scripts is straightforward:

```lua
-- template.lua
function init()
    return {
        name = "Custom Vulnerability Check",
        description = "Detects custom vulnerability pattern",
        severity = "medium"
    }
end

function check(target, response)
    -- Your detection logic here
    return {
        vulnerable = false,
        confidence = "low"
    }
end
```

## Use Cases

- **Penetration Testing**: Automated vulnerability assessment of web applications
- **Bug Bounty Hunting**: Fast scanning of multiple targets and endpoints
- **DevSecOps Integration**: CI/CD pipeline security testing
- **Red Team Operations**: Reconnaissance and vulnerability identification
- **Security Research**: Custom vulnerability pattern development

## Performance

Lotus is designed for speed:
- **Concurrent Scanning**: Up to 1000+ concurrent connections
- **Smart Rate Limiting**: Adaptive request throttling
- **Memory Efficient**: Low memory usage even with large target lists
- **Resume Capability**: Continue interrupted scans

## Technical Stack

- **Core Language**: Rust (for performance and safety)
- **Scripting Engine**: Lua 5.4
- **HTTP Client**: Tokio + Reqwest
- **Async Runtime**: Tokio
- **Configuration**: TOML/YAML support

This scanner represents the next generation of web security testing tools, combining the reliability of systems programming with the flexibility of scripting languages for maximum effectiveness in modern security assessments.
