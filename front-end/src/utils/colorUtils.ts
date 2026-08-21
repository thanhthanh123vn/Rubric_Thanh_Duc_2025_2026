export const bannerColors = [
    "blue",
    "emerald",
    "purple",
    "pink",
    "orange",
    "cyan",
    "indigo",
    "red",
] as const;

export type BannerColor = (typeof bannerColors)[number];

export const bannerColorClasses: Record<BannerColor, string> = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    orange: "from-orange-500 to-orange-600",
    cyan: "from-cyan-500 to-cyan-600",
    indigo: "from-indigo-500 to-indigo-600",
    red: "from-red-500 to-red-600",
};

export const isBannerColor = (color?: string | null): color is BannerColor =>
    Boolean(color && bannerColors.includes(color as BannerColor));

export const getBannerColor = (id: string): BannerColor => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return bannerColors[Math.abs(hash) % bannerColors.length];
};

export const resolveBannerColor = (offeringId: string, configuredColor?: string | null): BannerColor =>
    isBannerColor(configuredColor) ? configuredColor : getBannerColor(offeringId);
