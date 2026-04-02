import React from "react";
import { theme } from "../../theme/theme";

import service1 from "../../assets/images/service1.webp";
import service2 from "../../assets/images/service2.webp";
import service3 from "../../assets/images/service3.webp";
import service4 from "../../assets/images/service4.webp";
import service5 from "../../assets/images/service5.webp";
import service6 from "../../assets/images/service6.webp";
import mosque from "../../assets/images/mosque.png";

const services = [
  {
    id: 1,
    title: "Air Tickets",
    description:
      "We arrange safe, comfortable air tickets, activities, and hotels for your stay.",
    image: service1,
  },
  {
    id: 2,
    title: "Umrah Packages",
    description:
      "We offer Umrah travel packages for groups and affordable deals with top service quality.",
    image: service2,
  },
  {
    id: 3,
    title: "Visa Services",
    description:
      "Efficient visa services for seamless international travel with expert guidance.",
    image: service3,
  },
  {
    id: 4,
    title: "Hotel Packages",
    description:
      "Luxurious hotel stays with curated experiences at top destinations worldwide.",
    image: service4,
  },
  {
    id: 5,
    title: "Travel Consultancy",
    description:
      "Expert guidance, personalized bookings, and travel tips for unforgettable adventures.",
    image: service5,
  },
  {
    id: 6,
    title: "Meet & Assist",
    description:
      "Seamless meet and assist services for stress-free airport experiences.",
    image: service6,
  },
];

export default function ServicesSection() {
  return (
    <section
      className="relative py-20"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.backgroundDark})`,
      }}
    >
      <div className="main-container relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-semibold"
            style={{ color: theme.colors.textPrimary }}
          >
            Our Services
          </h2>
          <div
            className="w-24 h-1 mx-auto mt-4 rounded-full"
            style={{
              background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="card group">
              {/* Animated Blob */}
              <div className="blob"></div>

              {/* Shine */}
              <div className="shine"></div>

              {/* Card Content */}
              <div className="card-inner">
                {/* Image (FIXED HEIGHT) */}
                <div className="img-wrapper">
                  <img src={service.image} alt={service.title} />
                </div>

                {/* Content */}
                <div className="p-5 text-center flex flex-col flex-1">
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: theme.colors.primary }}
                  >
                    {service.title}
                  </h3>

                  <p
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {service.description}
                  </p>

                  <button
                    className="mt-4 px-4 py-2 text-sm rounded-md transition-all duration-300"
                    style={{
                      background: theme.colors.primary,
                      color: "#fff",
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mosque */}
      <img
        src={mosque}
        alt="mosque"
        className="absolute bottom-0 right-0 w-full sm:w-1/2 opacity-10"
      />

      {/* STYLES */}
      <style>{`
      
      .card {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        transition: 0.4s;
        box-shadow: ${theme.shadows.lg};
      }

      .card:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: ${theme.shadows.xl};
      }

      .card-inner {
        position: relative;
        z-index: 2;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(16px);
        border: 1px solid ${theme.colors.border};
        border-radius: 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* FIXED IMAGE HEIGHT */
      .img-wrapper {
        height: 220px;
        overflow: hidden;
      }

      .img-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: 0.5s;
      }

      .card:hover img {
        transform: scale(1.1);
      }

      /* BLOB */
      .blob {
        position: absolute;
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, ${theme.colors.primaryLight}, ${theme.colors.accentLight});
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.5;
        animation: moveBlob 6s infinite ease-in-out;
        z-index: 1;
      }

      @keyframes moveBlob {
        0% { top: -50px; left: -50px; }
        25% { top: -50px; left: 70%; }
        50% { top: 60%; left: 70%; }
        75% { top: 60%; left: -50px; }
        100% { top: -50px; left: -50px; }
      }

      /* SHINE EFFECT */
      .shine {
        position: absolute;
        top: 0;
        left: -75%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          120deg,
          transparent,
          rgba(255,255,255,0.5),
          transparent
        );
        transform: skewX(-20deg);
        z-index: 3;
      }

      .card:hover .shine {
        animation: shineMove 0.8s forwards;
      }

      @keyframes shineMove {
        100% {
          left: 125%;
        }
      }

      `}</style>
    </section>
  );
}
