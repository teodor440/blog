---
layout: note
title: "Request Smuggling"
category: Web security
tag: [Web security, Note]
---

# Http Request Smuggling

## Overview

Most of the time web applications sit behind a reverse proxy or load balancer. Due to performance concerns, the TCP link between those two servers is reused and carries multiple client requests over the same pipeline, so if the servers have different interpretations of message length then it might be possible to poison other user's requests.  
The expected setup would be with two servers, usually a reverse proxy and a web server. Check for compliance with the standard. Design automated tools that detect smuggling vulnerabilities based on timeout and without affecting user experience.

## Standards
### [RFC 7320](https://tools.ietf.org/html/rfc7230#section-3.3.3)

#### Transfer-Encoding priority
_RFC 7320 section 3.3.3_
> If a Transfer-Encoding header field is present and the chunked transfer coding (Section 4.1) is the final encoding, the message body length is determined by reading and decoding the chunked data until the transfer coding indicates the data is complete.

> If a message is received with both a Transfer-Encoding and a Content-Length header field, the Transfer-Encoding overrides the Content-Length. Such a message might indicate an attempt to perform request smuggling (Section 9.5) or response splitting (Section 9.4) and ought to be handled as an error. A sender MUST remove the received Content-Length field prior to forwarding such a message downstream.

#### Bad Chunked Transmission
_RFC7230 section 3.3.3_  
> If a Transfer-Encoding header field is present in a request and the chunked transfer coding is not the final encoding, the message body length cannot be determined reliably; the server MUST respond with the 400 (Bad Request) status code and then close the connection.

#### Two Identical Fields - CL
_RFC 7230 section 3.3.3_  
> If a message is received without Transfer-Encoding and with either multiple Content-Length header fields having differing field-values or a single Content-Length header field having an invalid value, then the message framing is invalid and the recipient MUST treat it as an unrecoverable error. If this is a request message, the server MUST respond with a 400 (Bad Request) status code and then close the connection.  

_RFC7230 section 3.3.2_  
> If a message is received that has multiple Content-Length header fields with field-values consisting of the same decimal value, or a single Content-Length header field with a field value containing a list of identical decimal values (e.g., “Content-Length: 42, 42”), indicating that duplicate Content-Length header fields have been generated or combined by an upstream message processor, then the recipient MUST either reject the message as invalid or replace the duplicated field-values with a single valid Content-Length field containing that decimal value prior to determining the message body length or forwarding the message.
If a message is received without Transfer-Encoding and with either multiple Content-Length header fields having differing field-values or a single Content-Length header field having an invalid value, then the message framing is invalid and the recipient MUST treat it as an unrecoverable error. If this is a request message, the server MUST respond with a 400 (Bad Request) status code and then close the connection.  

#### Line endings
_RFC7320 section 3.5_   
> Although the line terminator for the start-line and header fields is the sequence CRLF, a recipient MAY recognize a single LF as a line terminator and ignore any preceding CR.

#### Optional WhiteSpace
_RFC7320 section 3.2_  
> 3.2. Header Fields  
Each header field consists of a case-insensitive field name followed
by a colon (“:”), optional leading whitespace, the field value, and
optional trailing whitespace.  
```javascript class:"lineNo"
header-field   = field-name ":" OWS field-value OWS

field-name     = token
field-value    = *( field-content / obs-fold )
field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
field-vchar    = VCHAR / obs-text

obs-fold       = CRLF 1*( SP / HTAB )
               ; obsolete line folding
               ; see Section 3.2.4
```  
> The field-name token labels the corresponding field-value as having
the semantics defined by that header field. For example, the Date
header field is defined in Section 7.1.1.2 of [RFC7231] as containing
the origination timestamp for the message in which it appears.  

#### CL inside GET request  
_RFC7230 section 3.3.2_  
> For example, a Content-Length header field is normally sent in a POST request even when the value is 0 (indicating an empty payload body).  A user agent SHOULD NOT send a Content-Length header field when the request message does not contain a payload body and the method semantics do not anticipate such a body.  

RFC7231 section 4.3.1  
> A payload within a GET request message has no defined semantics; sending a payload body on a GET request might cause some existing implementations to reject the request.

## Testing guide

1. Check for Transfer-Encoding priority over Content-length. Basic TE-CL and CL-TE attacks.
2. Test what happens when chunked is not the final encoding. See how the server deals with encodings. Obfuscate encoding.
3. Check the behavior of the servers when inserting null inside headers.
4. Check what happens if using LF instead of CRLF.
5. Check if content length or chunked lengths are truncated.
6. Check if you can use HTTP 1.0 or 0.9.
7. Check if GET allows CL header

## Attack Surface
- **Web cache poisoning/deception**
- **Poison Request headers**, SSRF, any exploit than can be achieved by spoofing headers or having internal access in the network
- **Self XSS** are required **no user interaction** anymore
- **Open redirects** become **without user interaction**
- **Store user requests** on a public page, private chat
- **Redirect users** by server behavior: request a file without trailing slash and modify a header like X-Forwarded-SSL to malicious website

## Tools

- Burp extension - HTTP Request Smuggler

## Resources
[Http desync attacks, request smuggling reborn](https://portswigger.net/research/http-desync-attacks-request-smuggling-reborn)  
[HTTP-Smuggling-chinese](http://blog.zeddyu.info/2019/12/08/HTTP-Smuggling-en/#Size-Issue)  
[RFC test for defense](https://github.com/regilero/HTTPWookiee)
