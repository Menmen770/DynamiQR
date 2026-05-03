import wa from "../../assets/preset-logos/whatsapp.svg";
import ig from "../../assets/preset-logos/instagram.svg";
import fb from "../../assets/preset-logos/facebook.svg";
import li from "../../assets/preset-logos/linkedin.svg";
import tg from "../../assets/preset-logos/telegram.svg";
import sp from "../../assets/preset-logos/spotify.svg";
import go from "../../assets/preset-logos/google.svg";
import gh from "../../assets/preset-logos/github.svg";
import yt from "../../assets/preset-logos/youtube.svg";
import tk from "../../assets/preset-logos/tiktok.svg";
import xLogo from "../../assets/preset-logos/x.svg";
import bit from "../../assets/preset-logos/Bit.svg";

/** מודולי asset ל-SVG — נטען ל-data URL בעת בחירה */
export const PRESET_BRAND_MODULES = [
  { id: "whatsapp", name: "WhatsApp", module: wa, rasterInset: 1 },
  { id: "instagram", name: "Instagram", module: ig, rasterInset: 1 },
  { id: "facebook", name: "Facebook", module: fb, rasterInset: 1 },
  { id: "linkedin", name: "LinkedIn", module: li, rasterInset: 1 },
  { id: "telegram", name: "Telegram", module: tg, rasterInset: 1 },
  { id: "spotify", name: "Spotify", module: sp, rasterInset: 1 },
  { id: "google", name: "Google", module: go, rasterInset: 0.88 },
  { id: "github", name: "GitHub", module: gh, rasterInset: 1 },
  { id: "youtube", name: "YouTube", module: yt, rasterInset: 0.46 },
  { id: "tiktok", name: "TikTok", module: tk, rasterInset: 1 },
  { id: "x", name: "X", module: xLogo, rasterInset: 0.46 },
  { id: "bit", name: "Bit", module: bit, rasterInset: 0.46 },
];
