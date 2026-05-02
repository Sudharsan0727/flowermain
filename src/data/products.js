
import Prod1 from '../assets/colorful-bouquet-carnations-roses-windflowers-floss-flowers.jpg';
import Prod2 from '../assets/bouquet-red-flowers-glass-vase-dark-background.jpg';
import Prod3 from '../assets/wedding-bouquet-flowers-armchair-bridal-s-flowers-beautiful-roses.jpg';
import Prod4 from '../assets/flower-composition-glass-vase-hydrangeas-bright-orange-roses-side-view.jpg';

export { Prod1, Prod2, Prod3, Prod4 };

export const EASTER_PRODUCTS = [
  { id: 21, name: "Spring Awakening", price: "$89.00", image: Prod1, category: "Easter", badge: "New", stock: 12 },
  { id: 22, name: "Pastel Elegance", price: "$120.00", image: Prod2, category: "Easter", badge: null, stock: 8 },
  { id: 23, name: "Golden Sunrise", price: "$75.00", image: Prod3, category: "Lilies", badge: "Sale", stock: 15 },
  { id: 24, name: "Velvet Bunny", price: "$95.00", image: Prod4, category: "Easter", badge: null, stock: 5 },
  { id: 25, name: "Majestic Bloom", price: "$110.00", image: Prod1, category: "Roses", badge: "Popular", stock: 20 },
  { id: 26, name: "Easter Charm", price: "$65.00", image: Prod2, category: "Easter", badge: null, stock: 11 },
  { id: 27, name: "White Dove Reserve", price: "$140.00", image: Prod3, category: "Premium", badge: null, stock: 4 },
  { id: 28, name: "Meadow Whisper", price: "$85.00", image: Prod4, category: "Lilies", badge: null, stock: 9 },
  { id: 29, name: "Tulip Fiesta", price: "$90.00", image: Prod1, category: "Easter", badge: "Sale", stock: 6 },
];

export const ROSES_PRODUCTS = [
  { id: 101, name: "Crimson Love", price: "$129.00", image: Prod2, category: "Red Roses", badge: "Best Seller", stock: 10 },
  { id: 102, name: "White Elegance", price: "$140.00", image: Prod3, category: "White Roses", badge: null, stock: 5 },
  { id: 103, name: "Blush Melody", price: "$115.00", image: Prod1, category: "Pink Roses", badge: "Sale", stock: 14 },
  { id: 104, name: "Midnight Stroll", price: "$95.00", image: Prod4, category: "Mixed", badge: null, stock: 8 },
  { id: 105, name: "Majestic Red", price: "$210.00", image: Prod2, category: "Premium", badge: "Popular", stock: 3 },
  { id: 106, name: "Rose Garden", price: "$85.00", image: Prod1, category: "Mixed", badge: null, stock: 22 },
  { id: 107, name: "Pure Innocence", price: "$145.00", image: Prod3, category: "White Roses", badge: null, stock: 7 },
  { id: 108, name: "Sunset Kiss", price: "$105.00", image: Prod4, category: "Pink Roses", badge: null, stock: 11 },
  { id: 109, name: "The Grand Gesture", price: "$250.00", image: Prod2, category: "Premium", badge: "Sale", stock: 2 },
];

export const BIRTHDAY_PRODUCTS = [
  { id: 201, name: "Birthday Surprise", price: "$99.00", image: Prod1, category: "Bright Bouquets", badge: "Best Seller", stock: 12 },
  { id: 202, name: "Classic Red Box", price: "$130.00", image: Prod2, category: "Roses", badge: null, stock: 8 },
  { id: 203, name: "Elegant White", price: "$145.00", image: Prod3, category: "Premium", badge: "Sale", stock: 15 },
  { id: 204, name: "Vibrant Mix", price: "$85.00", image: Prod4, category: "Bright Bouquets", badge: null, stock: 5 },
  { id: 205, name: "Luxury Celebration", price: "$190.00", image: Prod2, category: "Premium", badge: "Popular", stock: 20 },
  { id: 206, name: "Sweet Treats & Blooms", price: "$110.00", image: Prod1, category: "With Chocolates", badge: null, stock: 11 },
  { id: 207, name: "Pearl Beauty", price: "$125.00", image: Prod3, category: "Roses", badge: null, stock: 4 },
  { id: 208, name: "Orange Dream", price: "$95.00", image: Prod4, category: "Bright Bouquets", badge: null, stock: 9 },
  { id: 209, name: "The Grand Party", price: "$250.00", image: Prod2, category: "Premium", badge: "Sale", stock: 6 },
];

export const FEATURED_PRODUCTS = [
  { id: 1, name: "Midnight Rose Symphony", price: "$89.00", image: Prod1, category: "Classic", stock: 12 },
  { id: 2, name: "Golden Spring Meadow", price: "$75.00", image: Prod2, category: "Seasonal", stock: 8 },
  { id: 3, name: "Timeless Dried Elegance", price: "$65.00", image: Prod3, category: "Everlasting", stock: 15 },
  { id: 4, name: "Velvet Lily Collection", price: "$95.00", image: Prod4, category: "Premium", stock: 5 },
  { id: 5, name: "Lunar Hydrangea", price: "$80.00", image: Prod4, category: "Signature", stock: 10 },
  { id: 6, name: "Sunburst Peonies", price: "$110.00", image: Prod1, category: "Seasonal", stock: 3 },
  { id: 7, name: "The Indigo Whisper", price: "$95.00", image: Prod3, category: "Classic", stock: 9 },
  { id: 8, name: "Cinnamon Rose Array", price: "$88.00", image: Prod2, category: "Premium", stock: 6 }
];

export const ALL_PRODUCTS = [
  ...EASTER_PRODUCTS,
  ...ROSES_PRODUCTS,
  ...BIRTHDAY_PRODUCTS,
  ...FEATURED_PRODUCTS
];



