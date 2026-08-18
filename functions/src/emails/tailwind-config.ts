import {pixelBasedPreset} from "react-email";

export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      fontFamily: {
        title: ["Bitter", "Georgia", "serif"],
      },
      colors: {
        background: "#F2EADF",
        foreground: "#2B2622",
        border: "#E6DED3",
        primary: "#C85028",
        card: "#FFFFFF",
        muted: "#FDFAF6",
        mutedForeground: "#6F6459",
      },
    },
  },
};
