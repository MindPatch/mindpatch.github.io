---
title: "Mermaid Test - OTA Security Flow"
date: 2025-12-24
draft: false
tags: ["test", "mermaid"]
---

## Testing Mermaid Diagrams

This post demonstrates Mermaid diagram rendering.

### OTA Update Security Flow

```mermaid
flowchart TD
    A["Stage 1: Download & Extract (Untrusted)"] --> B["Stage 2: Validate (Security Gate)"]
    B --> C["Stage 3: Install (Trusted)"]

    A1["Location: /var/lib/otahub/runtime/packages/v3/staging/0000/files/"] --> A
    A2["- Artifact downloaded and extracted to staging area"] --> A
    A3["- Files NOT yet on production filesystem"] --> A
    A4["- This is the 'sandbox' where validation happens"] --> A

    B1["- Verify SHA256 checksums from checksums"] --> B
    B2["- Validate artifact signatures (if enabled)"] --> B
    B3["- Confirm device type compatibility"] --> B
    B4["- Check dependencies and prerequisites"] --> B

    C1["- Update module moves files to final destination"] --> C
    C2["- Example: /opt/myapp/, /usr/bin/, /etc/myapp/"] --> C
    C3["- Rollback data preserved for recovery"] --> C

    style A fill:#fff4e6
    style B fill:#e6f3ff
    style C fill:#e6ffe6
```

### Attack Flow Example

```mermaid
sequenceDiagram
    participant Attacker
    participant OTAHub
    participant Filesystem

    Attacker->>OTAHub: Upload malicious artifact with ../ paths
    OTAHub->>OTAHub: Extract to staging (vulnerable)
    OTAHub->>Filesystem: Files escape to /etc/passwd
    Filesystem-->>Attacker: System compromised
```

### Simple Graph

```mermaid
graph LR
    A[Vulnerability] --> B{Exploitable?}
    B -->|Yes| C[Proof of Concept]
    B -->|No| D[Further Research]
    C --> E[Report to Vendor]
```

## Code Example with Syntax Highlighting

Here's some Python code:

```python
def exploit_path_traversal(filename):
    # Create malicious path
    malicious_path = f"../../../../etc/{filename}"

    # This will escape the sandbox
    with open(malicious_path, 'w') as f:
        f.write("attacker controlled content")

    return malicious_path

# Usage
exploit_path_traversal("passwd")
```

And some bash:

```bash
# Extract malicious tar
tar -xzf malicious.tar.gz

# Check where files ended up
ls -la /etc/passwd
```
