import React from "react";
import aboutImg from "../../assets/images/hero1.webp";
import hangingLights from "../../assets/images/hanging-lights.png";
import moon from "../../assets/images/moon.png";
import dots from "../../assets/images/dots.svg";
import { BsArrowRight } from "react-icons/bs";
import { theme } from "../../theme/theme";

export default function AboutSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.backgroundDark})`,
      }}
    >
      {/* Decorations */}
      <img
        src={hangingLights}
        alt=""
        className="hidden sm:block absolute top-0 -right-10 w-80 opacity-60"
      />
      <img
        src={moon}
        alt=""
        className="absolute bottom-0 -left-6 opacity-60 max-w-60"
      />
      <img
        src={dots}
        alt=""
        className="absolute top-10 left-5 w-52 opacity-30"
      />

      <div className="main-container relative z-10 flex flex-col lg:flex-row gap-14 py-20">
        {/* LEFT IMAGE */}
        <div className="group relative w-full lg:w-5/12 h-100 lg:h-120 rounded-[28px] overflow-hidden">
          {/* Glow Border */}
          <div
            className="absolute inset-0 rounded-[28px] p-px"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primaryLight}, ${theme.colors.accentLight})`,
            }}
          />

          {/* Inner */}
          <div className="relative w-full h-full rounded-[28px] overflow-hidden">
            <img
              style={{ height: "100%" }}
              src={aboutImg}
              alt="about"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110 floating-img"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

            <h2 className="absolute bottom-6 left-6 text-3xl font-bold text-white">
              About Us
            </h2>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-2"
            style={{ color: theme.colors.accent }}
          >
            About Company
          </p>

          <h2
            className="text-3xl sm:text-4xl font-bold mb-5 leading-tight"
            style={{ color: theme.colors.textPrimary }}
          >
            Trusted Travel Services with Professional Excellence
          </h2>

          <div
            className="w-20 h-1 rounded-full mb-6"
            style={{
              background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          />

          <p
            className="text-[16px] leading-relaxed mb-5"
            style={{ color: theme.colors.textSecondary }}
          >
            If you are looking for a dependable and professional travel partner,
            World Fly Tickets Travels is your premier choice. With years of
            industry expertise, we have built a reputation for excellence and
            integrity in every journey we plan.
          </p>

          <p
            className="text-[16px] leading-relaxed mb-5"
            style={{ color: theme.colors.textSecondary }}
          >
            <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>
              Expert Travel Solutions
            </span>
            <br />
            Our experienced team ensures smooth bookings, route planning, and
            exclusive deals for all travelers.
          </p>

          <p
            className="text-[16px] leading-relaxed"
            style={{ color: theme.colors.textSecondary }}
          >
            <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>
              Personalized Support
            </span>
            <br />
            We focus on individual customer needs, providing one-on-one
            assistance to make every journey stress-free.
          </p>

          {/* BUTTON */}
          <button
            className="mt-10 w-fit flex items-center gap-3 px-7 py-3 rounded-xl font-semibold transition-all duration-300 group"
            style={{
              background: theme.colors.primary,
              color: "#fff",
            }}
          >
            Discover More
            <BsArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-2" />
          </button>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
      
      /* Floating subtle image animation */
      .floating-img {
        animation: float 6s ease-in-out infinite;
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }

      `}</style>
    </section>
  );
}
