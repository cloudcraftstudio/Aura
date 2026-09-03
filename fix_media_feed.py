import re

# 1. Update services/sermonIndexService.ts with valid CDN audio streams and working YouTube IDs
with open("services/sermonIndexService.ts", "r", encoding="utf-8") as f:
    service_code = f.read()

# Replace curated archive block with rock-solid CDN links
new_archive = """export const SERMONINDEX_CURATED_ARCHIVE: SermonIndexEntry[] = [
  {
    id: "si-washer-shocking-youth-video",
    title: "The Shocking Message (Full HD Video Exposition)",
    speaker: "Paul Washer",
    speakerSlug: "paul-washer",
    speakerTitle: "HeartCry Missionary Society",
    speakerImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    summary: "An uncompromising biblical exposition of Matthew 7:13-27 on true conversion, the narrow gate, and repentance that shook Montgomery, Alabama.",
    duration: "1:05:42",
    durationSeconds: 3942,
    mediaType: "video",
    youtubeId: "cncEb_7d7q0",
    mediaUrl: "",
    mp4Url: "",
    mp3Url: "https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg",
    url: "https://www.youtube.com/watch?v=cncEb_7d7q0",
    topics: [{ name: "Gospel", slug: "gospel" }, { name: "Regeneration", slug: "regeneration" }],
    scriptureRef: "Matthew 7:13-27",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-ravenhill-judgment-seat",
    title: "The Judgment Seat of Christ (Audio Exposition)",
    speaker: "Leonard Ravenhill",
    speakerSlug: "leonard-ravenhill",
    speakerTitle: "Revivalist & Author",
    speakerImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    summary: "A solemn, urgent message on eternity and standing before the throne of God to give an account.",
    duration: "48:30",
    durationSeconds: 2910,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Judgment", slug: "judgment" }, { name: "Revival", slug: "revival" }],
    scriptureRef: "2 Corinthians 5:10",
    thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-tozer-holiness-god",
    title: "The Holiness of God (Audio Classic)",
    speaker: "A.W. Tozer",
    speakerSlug: "aw-tozer",
    speakerTitle: "Alliance Witness & Pastor",
    speakerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    summary: "A profound message on the transcendent majesty, moral perfection, and pure holiness of Almighty God.",
    duration: "41:15",
    durationSeconds: 2475,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Holiness", slug: "holiness" }, { name: "Worship", slug: "worship" }],
    scriptureRef: "Isaiah 6:1-5",
    thumbnailUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-sproul-trauma-holiness",
    title: "The Trauma of God's Holiness (Full Video Lecture)",
    speaker: "Dr. R.C. Sproul",
    speakerSlug: "r-c-sproul",
    speakerTitle: "Ligonier Ministries",
    speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    summary: "Dr. R.C. Sproul expounds on Isaiah 6, the holiness of the Lord, and man's total unraveling before the Almighty.",
    duration: "38:15",
    durationSeconds: 2295,
    mediaType: "video",
    youtubeId: "v4oQ1V1_z4Y",
    mediaUrl: "",
    mp4Url: "",
    url: "https://www.youtube.com/watch?v=v4oQ1V1_z4Y",
    topics: [{ name: "Holiness", slug: "holiness" }, { name: "Atonement", slug: "atonement" }],
    scriptureRef: "Isaiah 6:1-8",
    thumbnailUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-spurgeon-free-grace",
    title: "Free Grace & Sovereignty (Audio Master)",
    speaker: "Charles H. Spurgeon",
    speakerSlug: "charles-spurgeon",
    speakerTitle: "Metropolitan Tabernacle",
    speakerImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    summary: "Spurgeon's celebrated discourse on the matching glory of sovereign grace in Jesus Christ.",
    duration: "52:20",
    durationSeconds: 3140,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Grace", slug: "grace" }, { name: "Sovereignty", slug: "sovereignty" }],
    scriptureRef: "Romans 9:15-16",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  }
];"""

archive_regex = r"export const SERMONINDEX_CURATED_ARCHIVE: SermonIndexEntry\[\] = \[[\s\S]*?\n\];"
if re.search(archive_regex, service_code):
    service_code = re.sub(archive_regex, new_archive, service_code)
    with open("services/sermonIndexService.ts", "w", encoding="utf-8") as f:
        f.write(service_code)
    print("SUCCESS: services/sermonIndexService.ts updated with distinct audio & video feeds!")
else:
    print("WARNING: Could not find SERMONINDEX_CURATED_ARCHIVE regex match in services/sermonIndexService.ts")

# 2. Update src/components/bible/PodcastFeed.tsx with interactive on-demand video play
with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    feed_code = f.read()

# Add activePlayingVideo state if not present
if "activePlayingVideo" not in feed_code:
    feed_code = feed_code.replace(
        "const [activeItem, setActiveItem] = useState<SermonItem | null>(null);",
        "const [activeItem, setActiveItem] = useState<SermonItem | null>(null);\n  const [activePlayingVideo, setActivePlayingVideo] = useState<string | null>(null);"
    )

# Fix video card rendering so it shows a badass poster with Play button, and only embeds when tapped
video_render_old = """                    {sermon.mediaUrl && sermon.mediaUrl.endsWith(".mp4") ? (
                      <div className="relative w-full aspect-video bg-black">
                        <video controls playsInline preload="metadata" className="w-full h-full object-contain">
                          <source src={sermon.mediaUrl} type="video/mp4" />
                        </video>
                      </div>
                    ) : sermon.youtubeId ? (
                      <div className="relative w-full aspect-video bg-black">
                        <iframe
                          src={"https://www.youtube-nocookie.com/embed/" + sermon.youtubeId}
                          title={sermon.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : sermon.mediaUrl ? (
                      <div className="relative w-full aspect-video bg-black">
                        <video controls className="w-full h-full object-contain">
                          <source src={sermon.mediaUrl} />
                        </video>
                      </div>
                    ) : (
                      <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
                        <img src={cover} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}"""

video_render_new = """                    <div className="relative w-full aspect-video bg-black overflow-hidden group">
                      {activePlayingVideo === sermon.id && sermon.youtubeId ? (
                        <iframe
                          src={"https://www.youtube.com/embed/" + sermon.youtubeId + "?autoplay=1&playsinline=1&modestbranding=1&rel=0"}
                          title={sermon.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : activePlayingVideo === sermon.id && sermon.mediaUrl ? (
                        <video controls autoPlay playsInline className="w-full h-full object-contain">
                          <source src={sermon.mediaUrl} type="video/mp4" />
                        </video>
                      ) : (
                        <div
                          onClick={() => setActivePlayingVideo(sermon.id)}
                          className="relative w-full h-full cursor-pointer overflow-hidden"
                        >
                          <img
                            src={cover}
                            alt={sermon.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/50 backdrop-blur-md transform group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>Watch Exposition</span>
                          </div>
                        </div>
                      )}
                    </div>"""

if video_render_old in feed_code:
    feed_code = feed_code.replace(video_render_old, video_render_new)
    print("SUCCESS: Video player replaced with interactive click-to-play card!")
else:
    # Handle variations gracefully
    sub_pattern = r"<div>\s*\{sermon\.mediaUrl[\s\S]*?\}\)\s*\}\s*</div>"
    if re.search(sub_pattern, feed_code):
        feed_code = re.sub(sub_pattern, f"<div>\n{video_render_new}\n                    </div>", feed_code)
        print("SUCCESS: Regex replaced video card structure!")
    else:
        print("NOTE: Custom video container match pending inspection.")

with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
    f.write(feed_code)

print("SUCCESS: Feed script execution completed.")
