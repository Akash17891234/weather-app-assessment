"use client"

import { useEffect, useState } from "react"

interface WeatherBackgroundProps {
  condition?: string
}

export function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const [weatherType, setWeatherType] = useState<string>("default")

  useEffect(() => {
    if (!condition) {
      setWeatherType("default")
      return
    }

    const conditionLower = condition.toLowerCase()

    if (conditionLower.includes("sun") || conditionLower.includes("clear")) {
      setWeatherType("sunny")
    } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
      setWeatherType("rainy")
    } else if (conditionLower.includes("snow") || conditionLower.includes("blizzard")) {
      setWeatherType("snowy")
    } else if (conditionLower.includes("wind")) {
      setWeatherType("windy")
    } else if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
      setWeatherType("cloudy")
    } else if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
      setWeatherType("foggy")
    } else if (conditionLower.includes("thunder") || conditionLower.includes("storm")) {
      setWeatherType("stormy")
    } else {
      setWeatherType("default")
    }
  }, [condition])

  return (
    <>
      <div className={`weather-background ${weatherType}`} />
      <style jsx>{`
        .weather-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          transition: all 1s ease-in-out;
          overflow: hidden;
        }

        .weather-background::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.15;
          animation: slide 20s linear infinite;
        }

        /* Sunny */
        .sunny {
          background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        }
        .sunny::before {
          background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 200, 0, 0.2) 0%, transparent 50%);
          animation: sunRays 15s ease-in-out infinite;
        }

        /* Rainy */
        .rainy {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .rainy::before {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          );
          animation: rain 0.5s linear infinite;
        }

        /* Snowy */
        .snowy {
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
        }
        .snowy::before {
          background: radial-gradient(circle, white 1px, transparent 1px),
            radial-gradient(circle, white 1px, transparent 1px);
          background-size: 50px 50px, 80px 80px;
          background-position: 0 0, 40px 60px;
          animation: snow 10s linear infinite;
        }

        /* Windy */
        .windy {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }
        .windy::before {
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 20px
          );
          animation: wind 3s linear infinite;
        }

        /* Cloudy */
        .cloudy {
          background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
        }
        .cloudy::before {
          background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          animation: clouds 25s ease-in-out infinite;
        }

        /* Foggy */
        .foggy {
          background: linear-gradient(135deg, #d7d2cc 0%, #304352 100%);
        }
        .foggy::before {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          animation: fog 8s ease-in-out infinite;
        }

        /* Stormy */
        .stormy {
          background: linear-gradient(135deg, #232526 0%, #414345 100%);
        }
        .stormy::before {
          background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
          animation: lightning 4s ease-in-out infinite;
        }

        /* Default */
        .default {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Animations */
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100px);
          }
        }

        @keyframes sunRays {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(180deg);
          }
        }

        @keyframes rain {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(20px);
          }
        }

        @keyframes snow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        @keyframes wind {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(50px);
          }
        }

        @keyframes clouds {
          0%,
          100% {
            transform: translateX(-50px);
          }
          50% {
            transform: translateX(50px);
          }
        }

        @keyframes fog {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes lightning {
          0%,
          90%,
          100% {
            opacity: 0.15;
          }
          95% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  )
}
