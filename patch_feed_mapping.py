with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Normalize SermonIndex objects cleanly to match frontend expectations
old_si_block = """      if (resSI.ok && cType.includes("application/json")) {
        const siData = await resSI.json();
        const normalizedSI = (Array.isArray(siData) ? siData : []).map((item: any) => ({
          ...item,
          format: item.format || (item.youtubeId ? "video" : "audio"),
          source: "sermonindex" as const,
        }));
        combined = [...combined, ...normalizedSI];
      }"""

new_si_block = """      if (resSI.ok && cType.includes("application/json")) {
        const siData = await resSI.json();
        const normalizedSI = (Array.isArray(siData) ? siData : []).map((item: any) => {
          const isVideo = item.mediaType === "video" || !!item.mp4Url || (!!item.youtubeId && !item.mp3Url);
          const audioStream = item.mp3Url || item.cdnMp3Url || (isVideo ? "" : item.mediaUrl);
          const videoStream = item.mp4Url || (isVideo ? item.mediaUrl : "");
          return {
            ...item,
            format: isVideo ? "video" : "audio",
            mediaUrl: isVideo ? videoStream : audioStream,
            mp3Url: audioStream,
            mp4Url: videoStream,
            source: "sermonindex" as const,
          };
        });
        combined = [...combined, ...normalizedSI];
      }"""

if old_si_block in code:
    code = code.replace(old_si_block, new_si_block)
    print("MATCH 1 SUCCESS")
else:
    # Fallback pattern if spacing varies
    import re
    code = re.sub(
        r'const normalizedSI = \(Array\.isArray\(siData\) \? siData : \[\]\)\.map\(\(item: any\) => \(\{[\s\S]*?source: "sermonindex" as const,\s*\}\)\);',
        """const normalizedSI = (Array.isArray(siData) ? siData : []).map((item: any) => {
          const isVideo = item.mediaType === "video" || !!item.mp4Url || (!!item.youtubeId && !item.mp3Url);
          const audioStream = item.mp3Url || item.cdnMp3Url || (isVideo ? "" : item.mediaUrl);
          const videoStream = item.mp4Url || (isVideo ? item.mediaUrl : "");
          return {
            ...item,
            format: isVideo ? "video" : "audio",
            mediaUrl: isVideo ? videoStream : audioStream,
            mp3Url: audioStream,
            mp4Url: videoStream,
            source: "sermonindex" as const,
          };
        });""",
        code
    )
    print("REGEX REPLACEMENT APPLIED")

with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("PodcastFeed.tsx feed mapping successfully fixed!")
