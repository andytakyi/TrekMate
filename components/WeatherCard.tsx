import { WeatherData, WeatherSummary } from "@/lib/types/weather";

interface WeatherCardProps {
    weather: WeatherData;
    summary: WeatherSummary;
}

const WeatherCard = ({ weather, summary }: WeatherCardProps) => {
    // Get weather icon based on code
    const getWeatherIcon = (code: number) => {
        if (code === 0 || code === 1) return "☀️";
        if (code === 2 || code === 3) return "⛅";
        if (code >= 51 && code <= 67) return "🌧️";
        if (code >= 71 && code <= 77) return "❄️";
        if (code >= 80 && code <= 82) return "🌦️";
        if (code >= 95) return "⛈️";
        return "🌤️";
    };
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-20 overflow-hidden my-3">
            {/* Header */}
            <div className="bg-green-50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="bold-16 text-white">{weather.location.name}</h4>
                        <p className="regular-12 text-white/80">
                            {weather.location.region && `${weather.location.region}, `}
                            {weather.location.country}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl">{getWeatherIcon(weather.current.weather_code)}</div>
                        <p className="bold-20 text-white">{Math.round(weather.current.temperature)}°C</p>
                    </div>
                </div>
            </div>

            {/* Current Conditions */}
            <div className="px-4 py-3 border-b border-gray-20">
                <p className="regular-14 text-gray-90 mb-2">
                    <strong>Now:</strong> {summary.condition}
                </p>
                <div className="flex gap-4 regular-12 text-gray-50">
                    <span>💨 {Math.round(weather.current.wind_speed)} km/h</span>
                    <span>💧 {weather.current.precipitation}mm</span>
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="px-4 py-3">
                <h5 className="bold-14 text-gray-90 mb-3">7-Day Forecast</h5>
                <div className="space-y-2">
                    {weather.daily.map((day, idx) => {
                        const date = new Date(day.date);
                        const dayName = idx === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
                        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                        return (
                            <div
                                key={day.date}
                                className="flex items-center justify-between py-2 border-b border-gray-10 last:border-0"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12">
                                        <p className="bold-12 text-gray-90">{dayName}</p>
                                        <p className="regular-10 text-gray-50">{dateStr}</p>
                                    </div>
                                    <div className="text-xl">{getWeatherIcon(day.weather_code)}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 regular-12 text-gray-50">
                                        <span>💧</span>
                                        <span>{Math.round(day.precipitation_probability_max)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-[80px] justify-end">
                                        <span className="regular-14 text-gray-50">{Math.round(day.temperature_min)}°</span>
                                        <div className="w-12 h-1 bg-gray-20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-50"
                                                style={{
                                                    width: `${((day.temperature_max - day.temperature_min) / 30) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="bold-14 text-gray-90">{Math.round(day.temperature_max)}°</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
