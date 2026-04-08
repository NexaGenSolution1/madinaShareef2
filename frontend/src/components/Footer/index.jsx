import logo from "../../assets/images/logo.webp";
import { CiLogin } from "react-icons/ci";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { IoMail, IoLocationSharp } from "react-icons/io5";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { theme } from "../../theme/theme";

export default function Footer() {
  return (
    <>
      {/* TOP CTA */}
      <div
        className="py-14"
        style={{
          background: theme.colors.primary,
        }}
      >
        <div className="main-container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5 text-white">
            <IoMail className="text-5xl opacity-80" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Your Travel Journey Starts Here
              </h2>
              <p className="text-sm opacity-80">
                Sign up to get the best travel deals & offers
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/auth/register"
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                background: "#fff",
                color: theme.colors.primary,
              }}
            >
              Signup
            </Link>

            <a
              href="#login"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border transition-all"
              style={{
                borderColor: "#fff",
                color: "#fff",
              }}
            >
              Login <CiLogin />
            </a>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <footer
        className="relative pt-16"
        style={{ background: theme.colors.sidebarBg }}
      >
        <div className="main-container grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">
          {/* LEFT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo */}
            <div>
              <img src={logo} alt="logo" className="w-28 mb-4" />
              <h2
                className="text-lg font-semibold"
                style={{ color: theme.colors.sidebarTextLight }}
              >
                World Fly Travel & Tours (Pvt Ltd ).
              </h2>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: theme.colors.sidebarText }}
              >
                We make your travel dreams more beautiful and enjoyable with
                seamless experiences.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3
                className="text-xl mb-5 font-semibold"
                style={{ color: theme.colors.sidebarTextLight }}
              >
                Links
              </h3>

              <div className="flex flex-col gap-3">
                {["Home", "About", "Packages", "Contact"].map((item) => (
                  <button
                    key={item}
                    className="text-left transition-all duration-300 hover:translate-x-1"
                    style={{ color: theme.colors.sidebarText }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Services */}
            <div>
              <h3
                className="text-xl mb-5 font-semibold"
                style={{ color: theme.colors.sidebarTextLight }}
              >
                Services
              </h3>

              <div className="flex flex-col gap-3">
                {["Umrah Groups", "UAE Groups", "KSA Groups"].map((item) => (
                  <button
                    key={item}
                    className="text-left transition-all duration-300 hover:translate-x-1"
                    style={{ color: theme.colors.sidebarText }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3
                className="text-xl mb-5 font-semibold"
                style={{ color: theme.colors.sidebarTextLight }}
              >
                Contact
              </h3>

              <div className="flex flex-col gap-4">
                <a
                  href="https://wa.me/+923145266660"
                  target="_blank"
                  className="flex items-center gap-3 hover:translate-x-1 transition"
                  style={{ color: theme.colors.sidebarText }}
                >
                  <FaWhatsapp /> 0314-5266660
                </a>

                <a
                  href="tel:+923145222231"
                  className="flex items-center gap-3 hover:translate-x-1 transition"
                  style={{ color: theme.colors.sidebarText }}
                >
                  <FaPhoneAlt /> 0314-5222231
                </a>

                <a
                  href="tel:0512154600"
                  className="flex items-center gap-3 hover:translate-x-1 transition"
                  style={{ color: theme.colors.sidebarText }}
                >
                  <FaPhoneAlt /> 051-2154600
                </a>

                <a
                  href="mailto:worldflytravelisb@gmail.com"
                  className="flex items-center gap-3 break-all hover:translate-x-1 transition"
                  style={{ color: theme.colors.sidebarText }}
                >
                  <IoMail /> worldflytravelisb@gmail.com
                </a>

                <a
                  href="https://maps.app.goo.gl/FQNy83JNCoqCRcBG6"
                  target="_blank"
                  className="flex items-start gap-3 hover:translate-x-1 transition"
                  style={{ color: theme.colors.sidebarText }}
                >
                  <IoLocationSharp className="mt-1" />
                  SHOP NO 03 G FLOOR G 13 SERVICES ROAD G 12 Islamabad
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="main-container flex flex-col md:flex-row justify-between items-center gap-3 py-6 border-t"
          style={{ borderColor: theme.colors.sidebarBorder }}
        >
          <p style={{ color: theme.colors.sidebarText }}>
            {dayjs().year()} World Fly Travel & Tours (Pvt Ltd ).
          </p>

          <a
            target="_blank"
            href="https://nexagensolution.com/"
            className="text-sm"
            style={{ color: theme.colors.sidebarText }}
          >
            Designed & Developed by Nexagen Solution
          </a>
        </div>
      </footer>
    </>
  );
}
