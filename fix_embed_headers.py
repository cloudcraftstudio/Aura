with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace the iframe inside the modal with the proper referrer policy and attributes
old_iframe = """              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />"""

new_iframe = """              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />"""

if old_iframe in text:
    text = text.replace(old_iframe, new_iframe)
    with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("SUCCESS: Updated iframe embed headers and referrer policy!")
else:
    print("WARNING: Exact iframe string not found, inspecting alternative match...")
