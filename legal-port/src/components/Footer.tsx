import React from 'react';
// Changed from react-icons to lucide-react
import { Scale, Youtube, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    Solutions: ["Community & Culture", "Blog"],
    Services: ["Property", "Startup", "Challan", "Ask Lawyer", "Find Lawyer in Cities"],
    Learn: ["How it Works", "Education Center", "What is Legal Port?", "Trust & Safety"],
    Contact: ["Help & Support", "Press", "Careers", "Get in touch"]
  };

  // Using lucide-react icons
  const socialIcons = [
    { icon: <Youtube size={20} />, href: "#" },
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Linkedin size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "#" }
  ];

  return (
    <footer id="contact" className="bg-gray-800 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        {/* Top Section: Logo and Links */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 pb-8 border-b border-gray-700">
          {/* Logo Area */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              {/* Using the icon from lucide-react */}
              <Scale className="text-amber-500" size={32} />
              <span className="text-white text-2xl font-bold">Legal Port</span>
            </div>
            <p className="text-sm">Connect. Consult. Resolve.</p>
          </div>

          {/* Links Area */}
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#hover" className="hover:text-amber-500 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright and Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start">
            <span>© {new Date().getFullYear()} Legal Port. All Rights Reserved</span>
            <a href="#terms" className="hover:text-white">Terms of Use</a>
            <a href="#policy" className="hover:text-white">Privacy Policy</a>
            <a href="#cookie" className="hover:text-white">Cookie Policy</a>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            {socialIcons.map((social, index) => (
              <a key={index} href={social.href} className="hover:text-amber-500 transition-colors">
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;