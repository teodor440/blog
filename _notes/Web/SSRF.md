---
layout: note
title: "SSRF"
category: Web
---

# Server Side Request Forgery

## Testing guide

1. Change urls inside relevant API calls
2. Beware for blacklist-based and whitelist-based input filters - obfuscate localhost
3. SSRF with filter bypass via open redirection vulnerability
4. Maybe check the referer header
5. Spoof hostname

## Attack surface
- **Accessing resources unauthorized**

## Resources
[Portswigger](https://portswigger.net/web-security/xxe)
