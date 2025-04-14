
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with <Heart className="inline-block h-4 w-4 text-brand-purple" /> by ContentCrafter
        </p>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
          © {new Date().getFullYear()} ContentCrafter. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
