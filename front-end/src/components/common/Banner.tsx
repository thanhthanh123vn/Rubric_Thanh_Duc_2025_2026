import React from 'react';
import { bannerColorClasses, type BannerColor, isBannerColor } from '@/utils/colorUtils';


export interface BannerProps {
    title: string;
    description?: string;
    color?: string;
    imageUrl?: string | null;
}

const Banner: React.FC<BannerProps> = ({ title, description, color = "emerald", imageUrl }) => {
    const selectedColor: BannerColor = isBannerColor(color) ? color : 'emerald';

    return (
        <div
            className={`relative overflow-hidden bg-gradient-to-r ${
                bannerColorClasses[selectedColor]
            } text-white rounded-2xl p-6 mb-4 md:mb-6 shadow-sm`}
        >
            {imageUrl ? (
                <>
                    <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/45" />
                </>
            ) : null}
            <h2 className="relative text-2xl md:text-3xl font-semibold">
                {title}
            </h2>

            {description && (
                <p className="relative text-base md:text-lg opacity-90 mt-1">
                    {description}
                </p>
            )}
        </div>
    );
};

export default Banner;
