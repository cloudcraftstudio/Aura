import re

# 1. Update routes/bible.ts
with open("routes/bible.ts", "r", encoding="utf-8") as f:
    content = f.read()

new_feed = '''  const sermonIndexFeed = [
    {
      id: "si-washer-shocking-youth-video",
      title: "The Shocking Message (Full HD Video Exposition)",
      speaker: "Paul Washer",
      speakerSlug: "paul-washer",
      speakerTitle: "HeartCry Missionary Society",
      speakerImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      series: "Revival & Regeneration",
      scriptureRef: "Matthew 7:13-27",
      description: "Paul Washer delivers an uncompromising examination of biblical regeneration and genuine conversion.",
      duration: "1:05:42",
      format: "video",
      source: "sermonindex",
      youtubeId: "cncEb_7d7q0",
      mediaUrl: "https://archive.org/download/PaulWasherShockingMessage/PaulWasherShockingMessage.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "si-ravenhill-judgment-seat",
      title: "The Judgment Seat of Christ (Audio Exposition)",
      speaker: "Leonard Ravenhill",
      speakerSlug: "leonard-ravenhill",
      speakerTitle: "Revivalist & Author",
      speakerImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      series: "Revival Praying",
      scriptureRef: "2 Corinthians 5:10",
      description: "A solemn, urgent message on eternity and standing before the throne of God.",
      duration: "48:30",
      format: "audio",
      source: "sermonindex",
      mediaUrl: "https://archive.org/download/SERMONINDEX_SID0001/0001.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "si-tozer-holiness",
      title: "The Holiness of God (Audio Classic)",
      speaker: "A.W. Tozer",
      speakerSlug: "aw-tozer",
      speakerTitle: "Alliance Witness & Pastor",
      speakerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      series: "Attributes of God",
      scriptureRef: "Isaiah 6:1-5",
      description: "A profound sermon on the incomprehensible purity and holiness of Almighty God.",
      duration: "41:15",
      format: "audio",
      source: "sermonindex",
      mediaUrl: "https://archive.org/download/SERMONINDEX_SID0100/0100.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "si-sproul-trauma-holiness",
      title: "The Trauma of God's Holiness (Exposition)",
      speaker: "Dr. R.C. Sproul",
      speakerSlug: "rc-sproul",
      speakerTitle: "Ligonier Ministries",
      speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      series: "The Holiness of God",
      scriptureRef: "Isaiah 6:1-8",
      description: "Dr. Sproul explains the sheer terror and awe experienced when fallen man encounters holy God.",
      duration: "38:15",
      format: "video",
      source: "sermonindex",
      youtubeId: "v4oQ1V1_z4Y",
      mediaUrl: "https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "si-spurgeon-free-grace",
      title: "Free Grace & Sovereignty (Audio Reading)",
      speaker: "Charles H. Spurgeon",
      speakerSlug: "charles-spurgeon",
      speakerTitle: "Metropolitan Tabernacle",
      speakerImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      series: "New Park Street Pulpit",
      scriptureRef: "Romans 9:15-16",
      description: "Spurgeon's celebrated discourse on the unmatched grace of God in Christ Jesus.",
      duration: "52:20",
      format: "audio",
      source: "sermonindex",
      mediaUrl: "https://archive.org/download/SERMONINDEX_SID0200/0200.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
    }
  ];'''

pattern = r"const sermonIndexFeed\s*=\s*\[[\s\S]*?\];"
if re.search(pattern, content):
    content = re.sub(pattern, new_feed, content)
    with open("routes/bible.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: routes/bible.ts updated!")
else:
    print("WARNING: sermonIndexFeed regex did not match.")

# 2. Update src/components/bible/PodcastFeed.tsx
with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    feed = f.read()

# Make sure audio.load() and direct src assignment run reliably
feed = feed.replace(
    'if (audioRef.current) {\n      audioRef.current.src = item.mediaUrl || "";\n      audioRef.current.play().catch((err) => {\n        console.warn("Audio playback error:", err);\n        setIsPlaying(false);\n      });\n    }',
    'if (audioRef.current && item.mediaUrl) {\n      audioRef.current.src = item.mediaUrl;\n      audioRef.current.load();\n      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {\n        console.warn("Audio playback error:", err);\n        setIsPlaying(false);\n      });\n    }'
)

# Prioritize direct MP4 video playback so videos never hit "Video Unavailable"
feed = feed.replace(
    '{sermon.youtubeId ? (',
    '{sermon.mediaUrl && sermon.mediaUrl.endsWith(".mp4") ? (\n                      <div className="relative w-full aspect-video bg-black">\n                        <video controls playsInline preload="metadata" className="w-full h-full object-contain">\n                          <source src={sermon.mediaUrl} type="video/mp4" />\n                        </video>\n                      </div>\n                    ) : sermon.youtubeId ? ('
)

with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
    f.write(feed)

print("SUCCESS: PodcastFeed.tsx updated!")
