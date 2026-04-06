import {
  Droplets,
  Package,
  Shirt,
  Thermometer,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { Category } from "../backend.d";

interface CategoryIconProps {
  category: Category;
  className?: string;
  size?: number;
}

export function CategoryIcon({
  category,
  className = "",
  size = 20,
}: CategoryIconProps) {
  const props = { className, size };
  switch (category) {
    case Category.hvac:
      return <Thermometer {...props} />;
    case Category.plumbing:
      return <Droplets {...props} />;
    case Category.kitchen:
      return <UtensilsCrossed {...props} />;
    case Category.electrical:
      return <Zap {...props} />;
    case Category.laundry:
      return <Shirt {...props} />;
    default:
      return <Package {...props} />;
  }
}
