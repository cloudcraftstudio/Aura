import https from "https";

export interface MinistryChannel {
  name: string;
  handle: string;
  channelId: string;
  speaker: string;
  speakerTitle: string;
  featured?: boolean;
  defaultCover?: string;
}

export interface SyncedSermonItem {
  id: string;
  title: string;
  speaker: string;
  speakerSlug: string;
  speakerTitle: string;
  summary: string;
  duration?: string;
  mediaType: "video";
  format: "video";
  source: "community";
  featured?: boolean;
  youtubeId: string;
  mediaUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
  topics: { name: string; slug: string }[];
}

export const MONITORED_CHANNELS: MinistryChannel[] = [
  {
    name: "Lighthouse Baptist Church",
    handle: "@lighthousewinc",
    channelId: "UC-rPauVwKrxsFn05cecsF-w",
    speaker: "Pastor Luke Shope",
    speakerTitle: "Lighthouse Baptist Church • Winchester, VA",
    featured: true,
    defaultCover: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Tyler Gaulden",
    handle: "@TylerGaulden",
    channelId: "UCunY7TdNYdO_8tgZqNpUYfA",
    speaker: "Tyler Gaulden",
    speakerTitle: "Evangelist & Speaker",
    defaultCover: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Steven Furtick",
    handle: "@stevenfurtick",
    channelId: "UCIQqvZbHSwX0yKNVK1MyYjQ",
    speaker: "Steven Furtick",
    speakerTitle: "Elevation Church",
    defaultCover: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Scott Pauley",
    handle: "@ETJ",
    channelId: "UCJ-nK4Wv807yYZrRGEufnig",
    speaker: "Scott Pauley",
    speakerTitle: "Enjoying The Journey",
    defaultCover: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Dr. Tony Evans",
    handle: "@drtonyevans",
    channelId: "UCCWRy-Q4ejmtHpmQJJYJd6A",
    speaker: "Dr. Tony Evans",
    speakerTitle: "The Urban Alternative",
    defaultCover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Fargo Baptist Church",
    handle: "@FargoBaptistChurch",
    channelId: "UC-GMRbrd4dY8iiid8czVxWw",
    speaker: "Fargo Baptist Church",
    speakerTitle: "Fargo, ND",
    defaultCover: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Our Daily Bread",
    handle: "@ourdailybread",
    channelId: "UCsOZjmfxUh94dQPzrgIRrLA",
    speaker: "Our Daily Bread",
    speakerTitle: "Ministries Worldwide",
    defaultCover: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Lilly Grove Missionary Baptist Church",
    handle: "@lillygrovembc",
    channelId: "UCwibXBbhAZNTqYeEyeHpwaw",
    speaker: "Lilly Grove Baptist",
    speakerTitle: "Houston, TX",
    defaultCover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Alfred Street Baptist Church",
    handle: "@AlfredStreetBaptistChurch",
    channelId: "UCKFkEcTQsLP7j6DFo-O4xrg",
    speaker: "Alfred Street Baptist",
    speakerTitle: "Alexandria, VA",
    defaultCover: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Reformers Unanimous",
    handle: "@RURecoveryProgram",
    channelId: "UCDmfM_p5-je826nxz8UX5_g",
    speaker: "RU Recovery Ministries",
    speakerTitle: "Faith-Based Addiction Recovery",
    defaultCover: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
  }
];

let cachedFeed: SyncedSermonItem[] = [];
let lastFetch = 0;
const TTL = 10 * 60 * 1000; // 10 minutes

function fetchXml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 AuraApp/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 400) return reject(new Error(String(res.statusCode)));
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(body));
    }).on("error", reject);
  });
}

function parseXml(xml: string, ch: MinistryChannel): SyncedSermonItem[] {
  const list: SyncedSermonItem[] = [];
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

  for (const entry of entries) {
    const vidMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const pubMatch = entry.match(/<published>(.*?)<\/published>/);
    const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

    if (!vidMatch || !titleMatch) continue;

    const youtubeId = vidMatch[1].trim();
    const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
    const publishedAt = pubMatch ? pubMatch[1].trim() : new Date().toISOString();
    const summary = descMatch ? descMatch[1].slice(0, 200).trim() + "..." : "";

    list.push({
      id: `yt-${youtubeId}`,
      title,
      speaker: ch.speaker,
      speakerSlug: ch.handle.replace("@", "").toLowerCase(),
      speakerTitle: ch.speakerTitle,
      summary: summary || `Broadcast from ${ch.name}`,
      mediaType: "video",
      format: "video",
      source: "community",
      featured: !!ch.featured,
      youtubeId,
      mediaUrl: "",
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      publishedAt,
      topics: [{ name: "Sermon", slug: "sermon" }]
    });
  }
  return list;
}

export async function getLiveMinistryFeed(): Promise<SyncedSermonItem[]> {
  const now = Date.now();
  if (cachedFeed.length > 0 && now - lastFetch < TTL) {
    return cachedFeed;
  }

  const promises = MONITORED_CHANNELS.map(async (ch) => {
    try {
      const xml = await fetchXml(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`);
      return parseXml(xml, ch);
    } catch {
      return [];
    }
  });

  const results = await Promise.all(promises);
  
  // Extract featured home church (Pastor Luke Shope)
  const homeChurch = results[0] || [];
  const others = results.slice(1).flat();

  // Sort other channels by publishedAt descending
  others.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Priority layout: Pastor Luke Shope uploads always pinned at the top
  const combined = [...homeChurch, ...others];

  if (combined.length > 0) {
    cachedFeed = combined;
    lastFetch = now;
  }
  return cachedFeed;
}
