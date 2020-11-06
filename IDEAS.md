# Provide a Web App that will archive MP3 audio streams

## Archive an existing stream archive
Copy/paste a stream archive URL (m3u format).
Download mp3 file(s) and store in my own cloud storage provider.

### Example 

URL - https://wmbr.org/m3u/Backwoods_20201031_1000.m3u
Expands out to
```
#EXTM3U
#EXTINF:7443,Backwoods
http://wmbr.org/archive/Backwoods____10_31_20_9:58_AM.mp3
```

## Schedule recording of a live stream
Define a time window to capture a live stream
Time window will be exact to content length
Capture will be +/- 2 minutes

### Example
URL - http://wmbr.org:8000/hi
