export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  theme: string;
  popularity: number;
  description: string;
  stock: number;
  images: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Neon Dreams",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
    theme: "Colorful",
    popularity: 95,
    description: "Vibrant gradient keycaps with a dreamy neon aesthetic. Perfect for those who want their keyboard to stand out.",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800"
    ]
  },
  {
    id: "2",
    name: "Cyber Punk",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
    theme: "RGB",
    popularity: 88,
    description: "RGB backlit compatible keycaps with a futuristic cyberpunk theme. Shine-through legends for maximum visibility.",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800"
    ]
  },
  {
    id: "3",
    name: "Minimalist White",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=500",
    theme: "Minimal",
    popularity: 92,
    description: "Clean and elegant white keycaps with subtle gray legends. Perfect for a professional workspace setup.",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800"
    ]
  },
  {
    id: "4",
    name: "Retro Wave",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=500",
    theme: "Retro",
    popularity: 85,
    description: "80s inspired retro wave design with pink and purple gradients. Nostalgic vibes meet modern quality.",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800"
    ]
  },
  {
    id: "5",
    name: "Ocean Blues",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
    theme: "Colorful",
    popularity: 78,
    description: "Deep ocean blue themed keycaps with wave-inspired designs. Calming aesthetic for focused work sessions.",
    stock: 10,
    images: [
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800"
    ]
  },
  {
    id: "6",
    name: "Cherry Blossom",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
    theme: "Pastel",
    popularity: 90,
    description: "Soft pink and white keycaps inspired by Japanese cherry blossoms. Delicate and beautiful design.",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800"
    ]
  },
  {
    id: "7",
    name: "Carbon Fiber",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=500",
    theme: "Dark",
    popularity: 87,
    description: "Premium carbon fiber texture keycaps with a matte black finish. Ultimate sophistication and durability.",
    stock: 7,
    images: [
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800"
    ]
  },
  {
    id: "8",
    name: "Sunset Gradient",
    price: 94.99,
    image: "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=500",
    theme: "Colorful",
    popularity: 82,
    description: "Warm sunset gradient from orange to purple. Brings warmth and creativity to your desk setup.",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800"
    ]
  }
];

export const limitedEditions = [
  {
    id: "le1",
    title: "GALAXY EDITION",
    subtitle: "Limited to 500 units worldwide",
    image: "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=1200",
    price: "$199.99"
  },
  {
    id: "le2",
    title: "VAPORWAVE AESTHETIC",
    subtitle: "Exclusive collaboration drop",
    image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=1200",
    price: "$179.99"
  },
  {
    id: "le3",
    title: "ARCTIC FROST",
    subtitle: "Winter collection 2026",
    image: "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=1200",
    price: "$159.99"
  }
];
