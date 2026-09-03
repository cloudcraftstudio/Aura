with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Ensure X icon is imported
if " X," not in text and ", X" not in text:
    text = text.replace("import {", "import { X,")

# 2. Insert the Video Modal directly above the final closing </div>\n  );\n}
target = """          </div>
        </div>
      )}
    </div>
  );
}"""

modal_code = """          </div>
        </div>
      )}

      {/* FULLSCREEN VIDEO MODAL PLAYER */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-[#0b0f19] border border-white/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-1">
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-black text-sm sm:text-base leading-snug line-clamp-1">{selectedVideo.title}</h2>
                <p className="text-xs text-blue-400 font-semibold">{selectedVideo.speaker} {selectedVideo.scriptureRef ? `• ${selectedVideo.scriptureRef}` : ""}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
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
                  <Video className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">No video stream available</p>
                </div>
              )}
            </div>

            {/* Footer with Direct App Pop-out */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[11px] text-slate-500">Aura Media Live</span>
              {selectedVideo.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  Watch on YouTube ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""

if target in text:
    text = text.replace(target, modal_code)
    with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("SUCCESS: Modal successfully injected!")
else:
    # Alternative match if whitespace differs slightly
    import re
    idx = text.rfind("</div>\n  );\n}")
    if idx != -1:
        prefix = text[:idx]
        text = prefix + modal_code[modal_code.find("{/* FULLSCREEN VIDEO MODAL PLAYER */}"):]
        with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
            f.write(text)
        print("SUCCESS: Modal appended via fallback index!")
    else:
        print("ERROR: Could not locate closing sequence.")
