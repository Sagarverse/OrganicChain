import React from 'react';
import { FaGithub, FaTwitter, FaLeaf } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="glass mt-20 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaLeaf className="text-primary-400 text-2xl" />
              <span className="text-xl font-bold gradient-text">OrganicChain</span>
            </div>
            <p className="text-gray-400 text-sm">
              Blockchain-powered supply chain traceability for organic produce.
              Building trust from farm to table.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social & Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-2xl hover:text-primary-400 transition-colors">
                <FaGithub />
              </a>
              <a href="#" className="text-2xl hover:text-primary-400 transition-colors">
                <FaTwitter />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Built for hackathon 2026
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2026 OrganicChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
