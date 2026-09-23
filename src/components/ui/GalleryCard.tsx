import { Tent, TreePine, Flag, Compass, PartyPopper } from "lucide-react";
import type { GalleryItem } from "@/data/content";

const categoryIcon: Record<GalleryItem["category"], typeof Tent> = {
  camps: Tent,
  activities: Compass,
  trips: TreePine,
  training: Flag,
  events: PartyPopper,
};

const categoryGradient: Record<GalleryItem["category"], string> = {
  camps: "from-brand-purple to-brand-purple-dark",
  activities: "from-brand-turquoise-dark to-brand-purple",
  trips: "from-brand-purple-light to-brand-purple",
  training: "from-brand-orange to-brand-purple-dark",
  events: "from-brand-turquoise to-brand-turquoise-dark",
};

const sizeClasses: Record<GalleryItem["size"], string> = {
  large: "sm:col-span-2 sm:row-span-2 aspect-square sm:aspect-auto",
  medium: "aspect-[4/3]",
  small: "aspect-square",
};

export default function GalleryCard({ item }: { item: GalleryItem }) {
  const Icon = categoryIcon[item.category];

  return (
    <figure
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${categoryGradient[item.category]} ${sizeClasses[item.size]}`}
    >
      <div className="texture-canvas absolute inset-0 opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          className="h-10 w-10 text-white/50 transition-transform duration-500 group-hover:scale-110"
          strokeWidth={1.5}
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
        <span className="text-sm font-semibold text-white">{item.title}</span>
      </figcaption>
    </figure>
  );
}
