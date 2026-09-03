import re

# 1. Update services/sermonIndexService.ts with valid, active YouTube IDs
with open("services/sermonIndexService.ts", "r", encoding="utf-8") as f:
    service = f.read()

service = service.replace('youtubeId: "cncEb_7d7q0"', 'youtubeId: "uuabITeO4l8"')
service = service.replace("youtubeId: 'cncEb_7d7q0'", "youtubeId: 'uuabITeO4l8'")
service = service.replace('youtubeId: "v4oQ1V1_z4Y"', 'youtubeId: "1d32g8E8hR8"')
service = service.replace("youtubeId: 'v4oQ1V1_z4Y'", "youtubeId: '1d32g8E8hR8'")
service = service.replace("youtubeId: '3m2N6vXJ33c'", "youtubeId: '1d32g8E8hR8'")
service = service.replace('youtubeId: "3m2N6vXJ33c"', 'youtubeId: "1d32g8E8hR8"')

with open("services/sermonIndexService.ts", "w", encoding="utf-8") as f:
    f.write(service)
print("SUCCESS: services/sermonIndexService.ts updated with active IDs!")

# 2. Update PodcastFeed.tsx modal player to use a robust iframe
with open("src/components/bible/PodcastFeed.tsx", "r", encoding="utf-8") as f:
    feed = f.read()

# Replace whatever iframe is inside the modal with the proper attributes
iframe_pattern = r"<iframe[\s\S]*?allowFullScreen\s*/>"
new_iframe = """<iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&playsinline=1&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />"""

feed = re.sub(iframe_pattern, new_iframe, feed)

with open("src/components/bible/PodcastFeed.tsx", "w", encoding="utf-8") as f:
    f.write(feed)
print("SUCCESS: PodcastFeed.tsx iframe upgraded!")
