import React from 'react';
import { Instagram, Facebook, UtensilsCrossed, MessageCircle } from 'lucide-react';

// Custom Logo Component for MITE EAT
const MiteEatLogo = () => (
  <div className="flex items-center justify-center h-10 w-10 bg-gray-900 rounded-full">
    <span className="text-white font-black text-sm tracking-tighter">ME</span>
  </div>
);

// The Main Footer Component - Redesigned for MITE EAT
const Footer = () => {
  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { name: "Today's Menu", href: '/menu' },
        { name: 'Special Offers', href: '/offers' },
        { name: 'Your Orders', href: '/orders' },
        { name: 'My Account', href: '/account' },
      ],
    },
    {
      title: 'Discover',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Meet the Chefs', href: '/chefs' },
        { name: 'Allergen Info', href: '/allergens' },
        { name: 'FAQs', href: '/faq' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { name: 'Instagram', href: '#', icon: <Instagram size={16} /> },
        { name: 'Facebook', href: '#', icon: <Facebook size={16} /> },
        { name: 'Contact Us', href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="text-gray-800  relative overflow-hidden px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 border-t border-gray-200/80 py-12 ">
          {/* Left Section: Branding and Info */}
          <div className="mb-8 md:mb-0 max-w-sm">
            <a href="/" className="flex items-center gap-3 lg:mr-6">
              <MiteEatLogo />
              <span className="font-bold text-2xl text-gray-800">MITE EAT</span>
            </a>

            <p className="text-gray-500 mt-4 leading-relaxed">
              Your daily dose of delicious. Freshly prepared meals, right on campus.
            </p>
            <div className="mt-4">
                <button className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-2 px-4 border border-amber-200 rounded-lg transition-colors duration-200 text-sm">
                  <MessageCircle size={14} />
                  <span>Leave Feedback</span>
                </button>
            </div>
          </div>
          
          {/* Right Section: Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:max-w-lg">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-gray-500 hover:text-amber-600 flex items-center gap-2 transition-colors">
                        {link.icon}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* "Wow" Text Section */}
        <div className="w-full flex mt-16 mb-8 items-center justify-center">
          <h1 className="text-center text-7xl md:text-9xl lg:text-[12rem] xl:text-[16rem] font-black bg-clip-text text-transparent bg-gradient-to-b from-gray-100 to-gray-300 select-none tracking-tighter leading-none">
            MITE EATS
          </h1>
        </div>

        {/* Bottom Copyright Section */}
        <div className="border-t border-gray-200/80 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} MITE EAT. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
                Freshly coded with ❤️ on campus.
            </p>
        </div>
      </div>
    </footer>
  );
};


// Main App component to render the Footer
export default function App() {
    return (
        <div className="">
            <Footer />
        </div>
    );
}
