with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add selectedVideo state
if "const [selectedVideo, setSelectedVideo] = useState" not in content:
    content = content.replace(
        "const [activeItem, setActiveItem] = useState<SermonItem | null>(null);",
        "const [activeItem, setActiveItem] = useState<SermonItem | null>(null);\n  const [selectedVideo, setSelectedVideo] = useState<SermonItem | null>(null);"
    )

# 2. Rework the Video Card UI inside the filtered.map loop
import re

# Replace the video card rendering with a clean, interactive poster card
video_card_replacement = """            if (sermon.format === "video") {
              return (
                <div
                  key={sermon.id}
                  onClick={() => setSelectedVideo(sermon)}
                  className="cursor-pointer bg-slate-900/70 backdrop-blur-md border border-white/10 hover:border-blue-500/50 rounded-3xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full aspect-video bg-black overflow-hidden">
                      <img
                        src={cover}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tap to Watch</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className={"text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md " + (sermon.source === "sermonindex" ? "bg-indigo-600/90 text-white" : "bg-emerald-600/90 text-white")}>
                          {sermon.source === "sermonindex" ? "Historical Archive" : "Community"}
                        </span>
                        {sermon.duration && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sermon.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-white text-base leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {sermon.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-white">{sermon.speaker}</span>
                        {sermon.speakerTitle && <span className="text-slate-500 font-normal">• {sermon.speakerTitle}</span>}
                      </div>

                      {sermon.scriptureRef && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{sermon.scriptureRef}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }"""

# Find and replace the video card block
card_pattern = r"if \(sermon\.format === \"video\"\) \{[\s\S]*?return \([\s\S]*?</div>\s*</div>\s*\);\s*\}"
content = re.sub(card_pattern, video_card_replacement, content)

# 3. Add Modal Player at the bottom before the closing </div>
modal_jsx = """
      {/* VIDEO MODAL PLAYER */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-[#0f1422] border border-white/20 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div>
                <h2 className="text-white font-black text-base line-clamp-1">{selectedVideo.title}</h2>
                <p className="text-xs text-slate-400">{selectedVideo.speaker} • {selectedVideo.scriptureRef || ""}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedVideo.mediaUrl ? (
                <video controls autoPlay playsInline className="w-full h-full object-contain">
                  <source src={selectedVideo.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <Video className="w-8 h-8" />
                  <p className="text-xs">No direct video feed available</p>
                </div>
              )}
            </div>

            {/* Footer with External Link */}
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[11px] text-slate-500">Aura Gospel Media Player</span>
              {selectedVideo.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20"
                >
                  Open in YouTube App ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
"""

# Replace the closing tags with modal + closing tags
content = re.sub(r"\s*</div>\s*\);\s*\};\s*export default PodcastFeed;", modal_jsx + "\nexport default PodcastFeed;", content)

with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Fullscreen interactive Video Modal installed!")
