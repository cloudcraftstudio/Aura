export interface PresetImageItem {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  category: 'lettering' | 'spiritual' | 'scripture' | 'mosaic' | 'symbolic';
}

export const ALL_CHRISTIAN_PRESET_IMAGES: PresetImageItem[] = [
  {
    id: 'creation-mountains',
    name: 'Majestic Creation',
    subtitle: 'Golden sunrise over mountain peaks',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    category: 'spiritual',
  },
  {
    id: 'stained-glass',
    name: 'Mosaic of Grace',
    subtitle: 'Classic stained glass cathedral art',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop&q=80',
    category: 'mosaic',
  },
  {
    id: 'calvary-cross',
    name: 'Calvary Cross',
    subtitle: 'Silhouette of the cross at sunset',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&auto=format&fit=crop&q=80',
    category: 'symbolic',
  },
  {
    id: 'living-water',
    name: 'Living Water',
    subtitle: 'Peaceful streams in the valley',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&auto=format&fit=crop&q=80',
    category: 'spiritual',
  },
  {
    id: 'open-bible',
    name: 'The Living Word',
    subtitle: 'Morning study in the Scriptures',
    url: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&auto=format&fit=crop&q=80',
    category: 'scripture',
  },
  {
    id: 'worship-lights',
    name: 'Night of Worship',
    subtitle: 'Abstract colorful lighting',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
    category: 'lettering',
  },
  {
    id: 'dove-peace',
    name: 'Spirit of Peace',
    subtitle: 'A quiet morning in nature',
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&auto=format&fit=crop&q=80',
    category: 'spiritual',
  },
  {
    id: 'abstract-faith',
    name: 'Abstract Paint',
    subtitle: 'Vibrant watercolor brushstrokes',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
    category: 'lettering',
  },
  {
    id: 'heavens-stars',
    name: 'Heavens Declare',
    subtitle: 'The cosmos and starry night sky',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    category: 'spiritual',
  },
  {
    id: 'holy-fire',
    name: 'Refining Fire',
    subtitle: 'Warmth and zeal of the Spirit',
    url: 'https://images.unsplash.com/photo-1472806426350-603610d85659?w=1200&auto=format&fit=crop&q=80',
    category: 'symbolic',
  },
  {
    id: 'church-architecture',
    name: 'Sanctuary',
    subtitle: 'Beautiful historic arches',
    url: 'https://images.unsplash.com/photo-1548316131-7b0b7496efee?w=1200&auto=format&fit=crop&q=80',
    category: 'symbolic',
  },
];

export const DEFAULT_PRESET_COVER = ALL_CHRISTIAN_PRESET_IMAGES[0].url;
