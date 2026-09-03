import urllib.request
import re
import json

channels = [
    {"name": "Tyler Gaulden", "handle": "@TylerGaulden"},
    {"name": "Lighthouse Baptist Church", "handle": "@lighthousewinc"},
    {"name": "Steven Furtick", "handle": "@stevenfurtick"},
    {"name": "Fargo Baptist Church", "handle": "@FargoBaptistChurch"},
    {"name": "Scott Pauley - Enjoying The Journey", "handle": "@ETJ"},
    {"name": "Dr. Tony Evans", "handle": "@drtonyevans"},
    {"name": "Our Daily Bread", "handle": "@ourdailybread"},
    {"name": "Lilly Grove Missionary Baptist Church", "handle": "@lillygrovembc"},
    {"name": "Alfred Street Baptist Church", "handle": "@AlfredStreetBaptistChurch"},
    {"name": "Reformers Unanimous Recovery", "handle": "@RURecoveryProgram"}
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}

resolved = []

for ch in channels:
    url = f"https://www.youtube.com/{ch['handle']}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            
            # Match channelId in meta tags or JSON payload
            m = re.search(r'itemprop="channelId"\s+content="(UC[\w-]+)"', html)
            if not m:
                m = re.search(r'"channelId":"(UC[\w-]+)"', html)
            if not m:
                m = re.search(r'/channel/(UC[\w-]+)', html)
                
            if m:
                cid = m.group(1)
                print(f"[FOUND] {ch['name']}: {cid}")
                resolved.append({
                    "name": ch["name"],
                    "handle": ch["handle"],
                    "channelId": cid
                })
            else:
                print(f"[MISSING] {ch['name']} ({ch['handle']})")
    except Exception as e:
        print(f"[ERROR] {ch['name']}: {e}")

with open("ministry_channels.json", "w") as f:
    json.dump(resolved, f, indent=2)

print(f"\nSuccessfully resolved {len(resolved)} / {len(channels)} channels.")
