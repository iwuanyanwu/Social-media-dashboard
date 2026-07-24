import { SiFacebook, SiLinkedin, SiX, SiInstagram } from "react-icons/si";

export const PLATFORM_COLORS = {
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  twitter: "#000000",
  instagram: "#E1306C",
} as const;

export const PLATFORM_ICONS = {
  facebook: SiFacebook,
  linkedin: SiLinkedin,
  twitter: SiX,
  instagram: SiInstagram,
};

export const STATUS_COLORS = {
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};
