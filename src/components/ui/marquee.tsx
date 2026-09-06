import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MarqueeItem {
  type: 'Berita' | 'Prestasi' | 'Pengumuman';
  text: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
}

export function Marquee({ items }: MarqueeProps) {
  if (!items || items.length === 0) return null;

  const marqueeContent = items.map((item, index) => (
    <span
      key={index}
      className="mx-3 inline-flex items-center text-xs text-foreground sm:mx-5 sm:text-sm md:mx-8 md:text-base"
    >
      <Badge 
        variant={item.type === 'Prestasi' ? 'default' : 'secondary'} 
        className={cn(
          "px-1.5 py-0 text-[10px] font-medium leading-tight sm:px-2 sm:py-0.5 sm:text-xs md:text-sm",
          item.type === 'Prestasi' ? 'bg-primary text-primary-foreground' : ''
        )}
      >
        {item.type}
      </Badge>
      <span className="ml-1.5 max-w-[65vw] truncate sm:ml-2 sm:max-w-[70vw] md:max-w-none">
        {item.text}
      </span>
    </span>
  ));

  return (
    <div className="relative flex w-full overflow-x-hidden border-y border-accent/20 bg-accent/10 py-1.5 sm:py-2 md:py-3">
      <div className="animate-marquee whitespace-nowrap flex items-center shrink-0">
        {marqueeContent}
      </div>
      <div className="absolute top-0 flex h-full items-center animate-marquee2 whitespace-nowrap shrink-0">
        {marqueeContent}
      </div>
    </div>
  );
}
