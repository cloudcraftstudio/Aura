export interface PresetImageItem {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  category: 'lettering' | 'spiritual' | 'scripture' | 'mosaic' | 'symbolic';
}

export const ALL_CHRISTIAN_PRESET_IMAGES: PresetImageItem[] = [
  {
    id: 'yeshua-watercolor',
    name: 'Yeshua Watercolor',
    subtitle: 'Vibrant brush stroke calligraphy',
    url: '/covers/yeshua-watercolor.jpg',
    category: 'lettering',
  },
  {
    id: 'jesus-three-nails',
    name: 'Jesus & Three Nails',
    subtitle: 'Stone engraving with nails of redemption',
    url: '/covers/jesus-three-nails.jpg',
    category: 'symbolic',
  },
  {
    id: 'jesus-space-earth',
    name: 'Jesus Over Creation',
    subtitle: 'Golden sunrise over earth & cosmos',
    url: '/covers/jesus-space-earth.jpg',
    category: 'spiritual',
  },
  {
    id: 'jesus-king-of-kings',
    name: 'King of Kings',
    subtitle: 'Lord of Lords emblem typography',
    url: '/covers/jesus-king-of-kings.jpg',
    category: 'scripture',
  },
  {
    id: 'jesus-mosaic-lightning',
    name: 'Mosaic of the Gospels',
    subtitle: 'Biblical stories radiating from Christ',
    url: '/covers/jesus-mosaic-lightning.jpg',
    category: 'mosaic',
  },
  {
    id: 'jesus-the-way-water',
    name: 'The Way & Living Water',
    subtitle: 'Glowing letters on radiant waters',
    url: '/covers/jesus-the-way-water.jpg',
    category: 'spiritual',
  },
  {
    id: 'jesus-cross-sunset',
    name: 'Calvary Sunset Crosses',
    subtitle: 'Three crosses against the dawn sky',
    url: '/covers/jesus-cross-sunset.jpg',
    category: 'symbolic',
  },
  {
    id: 'jesus-amazing-creator',
    name: 'What An Amazing Creator',
    subtitle: 'Majestic landscapes within His Name',
    url: '/covers/jesus-amazing-creator.jpg',
    category: 'spiritual',
  },
  {
    id: 'jesus-graffiti',
    name: 'Jesus Urban Lettering',
    subtitle: 'Vibrant colorful 3D dimensional art',
    url: '/covers/jesus-graffiti.jpg',
    category: 'lettering',
  },
  {
    id: 'jesus-man-of-zeal',
    name: 'Man of Zeal (John 2:17)',
    subtitle: 'Shield of zeal and unwavering faith',
    url: '/covers/jesus-man-of-zeal.jpg',
    category: 'scripture',
  },
  {
    id: 'gospel-chalkboard-collage',
    name: 'Gospel Sketches & Scriptures',
    subtitle: 'Hand-drawn chalkboard Bible art',
    url: '/covers/gospel-chalkboard-collage.jpg',
    category: 'mosaic',
  },
];

export const DEFAULT_PRESET_COVER = ALL_CHRISTIAN_PRESET_IMAGES[0].url;
