import React from "react";
import footerLogo from "../../assets/logo.png";
import Banner from "../../assets/website/footer-pattern.jpg";
import { useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaLocationArrow,
  FaMobileAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../../utils/motion";

const BannerImg = {
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${Banner})`,
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  height: "100%",
  width: "100%",
};

const FooterLinks = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About",
    link: "/AboutUs",
  },
  {
    title: "Contact",
    link: "/contact",
  },
  {
    title: "Blog",
    link: "/BlogPage",
  },
  {
    title: "Shop",
    link: "/Product",
  },
  {
    title: "Customizer",
    link: "/customizer",
  },
];

const socialLinks = [
  {
    icon: <FaInstagram className="text-2xl" />,
    url: "https://instagram.com",
  },
  {
    icon: <FaFacebook className="text-2xl" />,
    url: "https://facebook.com",
  },
  {
    icon: <FaLinkedin className="text-2xl" />,
    url: "https://linkedin.com",
  },
];

const Footer = () => {
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <motion.footer
      style={BannerImg}
      className="text-white min-h-[400px] relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      <div className="container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className="grid md:grid-cols-3 pb-44 pt-12"
        >
          {/* Company details */}
          <motion.div
            variants={fadeIn("right", "tween", 0.2, 1)}
            className="py-8 px-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.img
                src={footerLogo}
                alt="Footer Logo"
                className="max-w-[50px]"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              <h1 className="text-3xl font-bold font-poppins tracking-wide">
                SportWearXpress
              </h1>
            </div>
            <p className="text-gray-300 font-roboto leading-relaxed">
              A web application for creating personalized t-shirts with custom
              colors, logos, and text. Users can drag and position logos, add
              custom text with styling options, and see real-time previews before
              checkout.
            </p>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            variants={fadeIn("up", "tween", 0.4, 1)}
            className="grid grid-cols-2 sm:grid-cols-3 col-span-2 md:pl-10"
          >
            <div>
              <div className="py-8 px-4">
                <h1 className="text-xl font-bold font-poppins mb-6 text-primary">
                  Quick Links
                </h1>
                <ul className="flex flex-col gap-4">
                  {FooterLinks.slice(0, 4).map((link, index) => (
                    <motion.li
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="cursor-pointer text-gray-300 font-roboto hover:text-primary transition-colors duration-300"
                      key={link.title}
                      onClick={() => handleLinkClick(link.link)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        {link.title}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <div className="py-8 px-4">
                <h1 className="text-xl font-bold font-poppins mb-6 text-primary">
                  Shop
                </h1>
                <ul className="flex flex-col gap-4">
                  {FooterLinks.slice(4).map((link, index) => (
                    <motion.li
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="cursor-pointer text-gray-300 font-roboto hover:text-primary transition-colors duration-300"
                      key={link.title}
                      onClick={() => handleLinkClick(link.link)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        {link.title}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="py-8 px-4">
              <h1 className="text-xl font-bold font-poppins mb-6 text-primary">
                Connect With Us
              </h1>
              <div className="flex gap-4 mb-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                    className="bg-gray-800 p-3 rounded-full hover:bg-primary transition-colors duration-300"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-300 font-roboto"
                >
                  <FaLocationArrow className="text-primary" />
                  <span>123 Fashion Street, Lahore, Pakistan</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-300 font-roboto"
                >
                  <FaMobileAlt className="text-primary" />
                  <span>+92 306 4599489</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="bg-black/80 py-4">
        <div className="container text-center text-gray-400 font-roboto text-sm">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © {new Date().getFullYear()} SportWearXpress. All rights reserved.
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;