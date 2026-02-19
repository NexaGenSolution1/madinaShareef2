// import footerImg from '../../assets/images/footer.webp'
import logo from "../../assets/images/logo.webp";
import { CiLogin } from "react-icons/ci";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { IoMail, IoLocationSharp } from "react-icons/io5";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      <div className="bg-linear-to-l from-[#7f5bf7] via-[#17166d] to-[#a7a40e] h-1"></div>
      <div className="bg-linear-to-tr from-[#2A166D] via-[#17166d] to-[#a7a40e]">
        <div className="main-container flex flex-col md:flex-row justify-between sm:items-center gap-8 py-10 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <IoMail className="text-6xl sm:text-7xl text-neutral-200" />
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl text-[#d6d30b] font-semibold!">
                Your Travel Journey Starts Here
              </h2>
              <p className="text-neutral-200">
                Sign up to have best deals with Brothers International Travels
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/auth/register"
              className="bg-[#d6d30b] text-[#2A166D] border border-[#d6d30b] px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-[#d6d30b] hover:opacity-70"
            >
              Signup
            </Link>
            <Link
              to="/auth/login"
              className="flex items-center gap-1 text-[#d6d30b] px-6 sm:px-8 py-2 sm:py-3 border border-[#d6d30b] rounded-xl hover:bg-[#d6d30b] hover:text-[#2A166D]"
            >
              Login <CiLogin />
            </Link>
          </div>
        </div>
      </div>

      {/* <footer style={{ position: 'relative', color: '#fff', backgroundImage: `url(${footerImg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}> */}
      {/* <footer style={{ position: 'relative', color: '#fff', backgroundImage: `url(https://img.freepik.com/free-photo/empty-sea-beach-background_74190-313.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}> */}
      <footer className="bg-white">
        <div className="main-container min-h-96 grid grid-cols-1 lg:grid-cols-2 gap-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={logo} alt="logo" className="w-22 object-contain" />
              <div>
                <h2 className="text-xl mt-6">Brothers International Travels</h2>
                <p className="mt-4">
                  We offer a variety of travel packages tailored to your needs,
                  Join us and explore the world with Brothers International
                  Travels.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl mb-6">Links</h2>
              <div className="flex flex-col items-start gap-3">
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  Home
                </button>
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  About
                </button>
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  Packages
                </button>
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  Contact
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-6">Service</h2>
              <div className="flex flex-col items-start gap-3">
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  Umrah Groups
                </button>
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  UAE Groups
                </button>
                <button className="font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]">
                  KSA Groups
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl mb-6">Contact</h2>
              <div className="flex flex-col items-start gap-3">
                <a
                  href="https://wa.me/+923478885551"
                  target="_blank"
                  className="flex items-center gap-3 font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]"
                >
                  <FaWhatsapp /> 0347 8885551
                </a>
                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]"
                >
                  <FaPhoneAlt /> 0932 412499
                </a>
                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]"
                >
                  <FaPhoneAlt /> 0932 414499
                </a>
                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 font-semibold break-all transition-all duration-300 ease-in-out hover:text-[#d6d30b]"
                >
                  <IoMail /> brothersit369@gmail.com
                </a>
                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 font-semibold break-all transition-all duration-300 ease-in-out hover:text-[#d6d30b]"
                >
                  <IoMail /> aizazbtk@gmail.com
                </a>
                <a
                  href="https://maps.app.goo.gl/GZ4C6ZMPfg758iV29"
                  target="_blank"
                  className="flex items-start gap-3 font-semibold transition-all duration-300 ease-in-out hover:text-[#d6d30b]"
                >
                  <IoLocationSharp className="mt-1" /> Main Bazaar Batkhela
                  Distt, Malakand.
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main-container flex flex-col md:flex-row justify-between gap-2 py-6 sm:py-10 text-sm sm:text-base border-t border-neutral-600">
          <p>
            &copy; Brothers International Travels. All Rights Reserved{" "}
            {dayjs().year()}.
          </p>
          {/* <p><span className='text-neutral-100 font-semibold'>Designed & Developed By</span> <a href="https://nexagensolution.com/" target='_blank'>Nexagen Solution</a></p> */}
        </div>

        <div className="absolute inset-0 bg-black/70 -z-1"></div>
      </footer>
    </>
  );
}
