import React from 'react';


export interface BannerProps {
    title: string;
    description?: string;
    color?: string;
}

const Banner: React.FC<BannerProps> = ({ title, description, color = "emerald" }) => {
    const colorClasses: Record<string, string> = {
        blue: "from-blue-500 to-blue-600",
        emerald: "from-emerald-500 to-emerald-600",
        purple: "from-purple-500 to-purple-600",
        pink: "from-pink-500 to-pink-600",
        orange: "from-orange-500 to-orange-600",
        cyan: "from-cyan-500 to-cyan-600",
        indigo: "from-indigo-500 to-indigo-600",
        red: "from-red-500 to-red-600",
    };

    return (
        <div
            className={`bg-gradient-to-r ${
                colorClasses[color] || colorClasses.emerald
            } text-white rounded-2xl p-6 mb-4 md:mb-6 shadow-sm`}
        >
            <h2 className="text-2xl md:text-3xl font-semibold">
                {title}
            </h2>

            {description && (
                <p className="text-base md:text-lg opacity-90 mt-1">
                    {description}
                </p>
            )}
        </div>
    );
};

export default Banner;