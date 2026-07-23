/**
 * ============================================================================
 * SITE CONFIGURATION
 * ============================================================================
 * This is the ONLY file you need to edit to customize the site for your own use.
 * All branding, personal info, social links, and site metadata are defined here.
 *
 * After editing this file, restart the dev server to see changes.
 * ============================================================================
 */

import type { ContactCardTitle } from "@/components/contact-card";

export const siteConfig = {
  /** Site name used in metadata, logo, and branding */
  name: "My Travel Atlas",

  /** Tagline shown alongside name (e.g. "Photo", "Photography") */
  tagline: "Travel Atlas",

  /** Your role/title shown in profile cards and footer */
  role: "Travel Archivist",

  /** Short bio shown on the home page profile card */
  bio: "一个记录个人旅行足迹的地图档案网站，用于收藏去过的国家和城市、旅行照片，以及每一段旅途背后的故事。",

  /** Avatar image path (place your avatar in /public/avatar.jpg) */
  avatar: "/avatar.jpg",

  /** Initials used as avatar fallback */
  initials: "MTA",

  /** Site metadata for SEO */
  metadata: {
    title: {
      template: "%s - My Travel Atlas",
      default: "My Travel Atlas",
    },
    description:
      "一个记录个人旅行足迹的地图档案网站，用于记录去过的国家和城市、旅行照片和旅行故事。",
  },

  /** Social links shown in profile card and footer */
  socialLinks: [
    {
      title: "Instagram",
      href: "https://instagram.com/ekkooooooooooo0o0",
    },
    {
      title: "GitHub",
      href: "https://github.com/ecarry",
    },
    {
      title: "Xiaohongshu",
      href: "https://www.xiaohongshu.com/user/profile/66c84ba2000000001b01b3f1",
    },
    {
      title: "Contact me",
      href: "mailto:lianshiliang93@gmail.com",
      /** If true, this link gets the primary button style */
      primary: true,
    },
  ] as { title: ContactCardTitle; href: string; primary?: boolean }[],

  /** Footer attribution */
  footer: {
    designCredit: {
      name: "Pawel Gola",
      href: "https://templates.gola.io/template/hanssen",
    },
    poweredBy: {
      name: "ECarry",
      href: "https://github.com/ecarry",
    },
  },

  /**
   * Map style URLs.
   * These OpenFreeMap styles work with MapLibre without a Mapbox token.
   */
  mapbox: {
    lightStyle: "https://tiles.openfreemap.org/styles/liberty",
    darkStyle: "https://tiles.openfreemap.org/styles/liberty",
  },

  /**
   * Image loader configuration.
   * Set to "cloudflare" to use the Cloudflare custom image loader,
   * or "default" to use Next.js built-in image optimization.
   */
  imageLoader: "cloudflare" as "cloudflare" | "default",

  /**
   * Gear / equipment shown on the About page.
   * Each item has a brand and model name.
   */
  gear: [
    { brand: "SONY", model: "Alpha 7RⅡ" },
    { brand: "DJI", model: "Air 2S" },
    { brand: "Tamron", model: "50-400mm F/4.5-6.3 Di III VC VXD" },
    { brand: "Sigma", model: "35mm F/1.4 DG HSM" },
    { brand: "Viltrox", model: "AF 40mm F/2.5 FE" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
