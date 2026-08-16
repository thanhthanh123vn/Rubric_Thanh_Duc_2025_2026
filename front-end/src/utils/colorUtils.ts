export const getBannerColor = (id: string) => {
    const bannerColors = [
        "blue",
        "emerald",
        "purple",
        "pink",
        "orange",
        "cyan",
        "indigo",
        "red",
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return bannerColors[Math.abs(hash) % bannerColors.length];
};