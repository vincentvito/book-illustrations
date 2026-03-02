import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'

export interface ShowcaseItem {
  id: string
  title: string
  description: string
  style: StylePresetId
  styleName: string
  palette: PalettePresetId
  paletteName: string
  genre: string
  imagePath: string
  blurDataURL: string
  width: number
  height: number
}

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'watercolor-enchanted-oak',
    title: 'The Hidden Door',
    description: 'A little girl in a red raincoat discovering a hidden door in an ancient oak tree, fireflies floating in twilight',
    style: 'watercolor',
    styleName: 'Watercolor',
    palette: 'forest',
    paletteName: 'Forest',
    genre: 'Children\'s',
    imagePath: '/gallery/watercolor-enchanted-oak.webp',
    blurDataURL: 'data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAABQBACdASoUABQAPzmUwFmvKiajqAgB4CcJQBhQAiOjOwyycPjblzX6yDaoAPlRPH43MivCa0yZVdT5Uy/YBJAnzQpLnHBmuF4/OdKWJu6PXjd85dqMFhf2GoOwKzrXk867uDL6BssIUcfCyBka6ln32IbLrrMrSk152X2pggEPJj398AA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'oil-painting-knight-kingdom',
    title: 'Edge of the Kingdom',
    description: 'A lone knight at the edge of a cliff overlooking a vast dragon-dotted kingdom at sunset',
    style: 'oil-painting',
    styleName: 'Oil Painting',
    palette: 'sunset',
    paletteName: 'Sunset',
    genre: 'Fantasy',
    imagePath: '/gallery/oil-painting-knight-kingdom.webp',
    blurDataURL: 'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABQBACdASoUABQAPzmMulYvKSWkqA1R4CcJYgCxHtpBo+3zC9UHIxlFH/sAAPI8nMLS1Ne0SmH2PvtNqUF24LWD08O0xvI6jKJkb8N6RbUpDpozWj7aoPssNDts0VRtOpaU4aDnHjrzSqIZW5+AAA==',
    width: 2048,
    height: 2048,
  },
  {
    id: 'manga-sorceress-library',
    title: 'Constellation Sorceress',
    description: 'A young sorceress summoning a constellation of glowing stars in a moonlit library',
    style: 'manga-anime',
    styleName: 'Manga / Anime',
    palette: 'night',
    paletteName: 'Night',
    genre: 'Young Adult',
    imagePath: '/gallery/manga-sorceress-library.webp',
    blurDataURL: 'data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAABQBACdASoUABQAPzmOuFavKaUjqA1R4CcJZQDDNA3vpAGNNc1Gxbct9EkAAP5JQolHLyRxw4N03kIvFMPZAuFOL6vSxZCp2eRwW+Lf/R4LxaWyUnyCFsp+S0/JFb1agO9jC+ZmH+TgbpjUOcNwVk4JRs/gAAAA',
    width: 2048,
    height: 2048,
  },
  {
    id: 'flat-vector-fox-picnic',
    title: 'Cherry Blossom Picnic',
    description: 'A cheerful fox and a shy rabbit having a picnic under a cherry blossom tree',
    style: 'flat-vector',
    styleName: 'Flat Vector',
    palette: 'pastel',
    paletteName: 'Pastel',
    genre: 'Children\'s',
    imagePath: '/gallery/flat-vector-fox-picnic.webp',
    blurDataURL: 'data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAACQBACdASoUABQAPzmQvFgvKaWjqAqp4CcJagDImA9o7//2NgiLgZhjuE84YAAA/pNUIYI81NAzB5uH30uRMTu1HmN//OMJBiHxQPQvLzTJYwFFlVNAxxBuJYyr04l0ullHzGOtnR91iVhFlIJW46iAAAA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'pencil-sketch-fireplace',
    title: 'Fireside Stories',
    description: 'An old man reading to wide-eyed children by a crackling fireplace',
    style: 'pencil-sketch',
    styleName: 'Pencil Sketch',
    palette: 'warm-earthy',
    paletteName: 'Warm Earthy',
    genre: 'Literary',
    imagePath: '/gallery/pencil-sketch-fireplace.webp',
    blurDataURL: 'data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAACwBACdASoUABQAPzmUwVmvKicjqAgB4CcJYgCsMy/BfDokdYUEo9Q22IsshnoAAP6sQNRaonONxV0x6l+haPCDX6It2+zmnHGVHDsWEv5KZIkW6MeEgQZPLNAL4aCDPhHkP+QTdXMAC6WAAsnYsb7DUWFq9nsgf10gAWyYAAA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'storybook-mouse-captain',
    title: 'Captain Mouse Sets Sail',
    description: 'A brave mouse captain steering a tiny ship through a bottle floating on a vast ocean',
    style: 'storybook',
    styleName: 'Storybook',
    palette: 'ocean',
    paletteName: 'Ocean',
    genre: 'Children\'s Adventure',
    imagePath: '/gallery/storybook-mouse-captain.webp',
    blurDataURL: 'data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAACQBACdASoUABQAPzmSv1mvKaajqAgB4CcJQBYhiYgw8gTmLd7fz1vvyu1Y6EAA/lkJiyTB2SIhV1NMygP3ovBk3BRGGRoMRQT9G5m59Imhy0zvD5Cm7Ji1s8+9T1RVrdNyZfLYI98UKGepiwGVEa3yrfyLvxrC03dPnPaI4wptevQmbU7r4nsI4wr7E+r2AAA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'digital-painting-victorian',
    title: 'The Lantern in the Mist',
    description: 'A mysterious woman in a Victorian dress in a misty garden, holding a glowing lantern',
    style: 'digital-painting',
    styleName: 'Digital Painting',
    palette: 'cool-blues',
    paletteName: 'Cool Blues',
    genre: 'Gothic',
    imagePath: '/gallery/digital-painting-victorian.webp',
    blurDataURL: 'data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAADwBACdASoUABQAPzmUwVmvKicjqAgB4CcJQBZwAS2CoFf6YIGsCuU3qrhK+fULxAAA/oGMe1DdNw72yUifc5Xy2+WT62CxZiDixH4wdU1h5phZ8bFv7LtgY2E3Yd0HxctintbwxNWHz3sctGCUaoK6NlwCUK7b7Q0UtLkxkd29eU4MMoHqyGT2IYtLpL+591/EDBUUAAA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'retro-vintage-attic',
    title: 'The Attic Explorers',
    description: 'Two kids and their loyal dog exploring a dusty attic full of maps and telescopes',
    style: 'retro-vintage',
    styleName: 'Retro / Vintage',
    palette: 'autumn',
    paletteName: 'Autumn',
    genre: 'Middle Grade',
    imagePath: '/gallery/retro-vintage-attic.webp',
    blurDataURL: 'data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAABwBACdASoUABQAPzmUwlmvKicjqAgB4CcJQBg5giN4uHH7UQyBxxtO/oo2gAD9pBbgRJTIsI9/6A9MJuLCKYLldtgbGKOOHGKvAnJkAYHuzEYa3R2PcFFVdO08h0fwtxGxv/t6MK0XqOO/GUzvjWG7t5KG/EIpSX2pgCJNiHJaQQ1Apkt7ioPED/lnIKUAAAA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'line-art-heron-lotus',
    title: 'Heron at Dawn',
    description: 'An elegant heron standing in still water, surrounded by lotus flowers and dragonflies',
    style: 'line-art',
    styleName: 'Line Art',
    palette: 'monochrome',
    paletteName: 'Monochrome',
    genre: 'Poetry',
    imagePath: '/gallery/line-art-heron-lotus.webp',
    blurDataURL: 'data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAwBACdASoUABQAPzmSv1mvKaajqAgB4CcJaQAALlRds+4z77hxaK3IgAAA/ucTsXwEtuthVRejV7qlQzu0Lv1flVa/PpBU50z6oqX7ZYjX5CR2ioboA+pSilUSdjegAAA=',
    width: 2048,
    height: 2048,
  },
  {
    id: 'collage-moroccan-medina',
    title: 'Medina Market',
    description: 'A bustling marketplace in a Moroccan medina with colorful spices and flowing textiles',
    style: 'collage',
    styleName: 'Collage',
    palette: 'vibrant',
    paletteName: 'Vibrant',
    genre: 'Cultural',
    imagePath: '/gallery/collage-moroccan-medina.webp',
    blurDataURL: 'data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAABwBACdASoUABQAPzmUwFmvKiajqAgB4CcJYwCCSQRWrS8YtV1o15HfN4sFOAD+s6Y2r2R057MEOGAyAkrkhHMtFn6zBd/023qdNIasGL184+tqbfy8Zx7iQZUCvw+qOxp94xfqwEjuGbbN1fecLQcqm7wUFyvR2F7NQQGeLREPWbufpeVQfJhrgngAAA==',
    width: 2048,
    height: 2048,
  }
]

export const GALLERY_STYLES = [...new Set(SHOWCASE_ITEMS.map((i) => i.styleName))]
export const GALLERY_GENRES = [...new Set(SHOWCASE_ITEMS.map((i) => i.genre))]

export const HOMEPAGE_SHOWCASE = SHOWCASE_ITEMS.filter((item) =>
  ["watercolor","oil-painting","manga-anime","flat-vector","storybook","digital-painting"].includes(item.style)
)
