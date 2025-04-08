import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontHeading = localFont({
  src: "../../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
  variable: "--font-heading",
  weight: "500",
  display: "swap",
});

export const spaceGrotesk = localFont({
  src: [
    {
      path: "../../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-grotesk",
});
