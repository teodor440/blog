---
layout: note
title: "Clickjacking"
category: Web security
tag: [Web security, Note]
---

# Clickjacking

## Overview
Clickjacking is an interface-based attack in which a user is tricked into clicking on actionable content on a hidden website by clicking on some other content in a decoy website.

## Testing guide

#### Look after X-Frame-options
This can be circumvented, but might be effective in a multi-layer defense.
```http
X-Frame-Options: deny
X-Frame-Options: sameorigin
X-Frame-Options: allow-from https://normal-website.com
```
Beware that this checks are performed only the oldest ancestor frame.

#### Configure CSP
```http
Content-Security-Policy: frame-ancestors 'none';
Content-Security-Policy: frame-ancestors 'self';
Content-Security-Policy: frame-ancestors normal-website.com;
Content-Security-Policy: frame-ancestors 'self' https://*.robust-website.com ;
```

## Resources
[Portswigger](https://portswigger.net/web-security/clickjacking)
