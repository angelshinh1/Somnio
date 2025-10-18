import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">DreamSync</h3>
            <p className="text-sm text-neutral-400">
              Connect your dreams with others and discover shared experiences in an immersive 3D network.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Developers */}
          <div>
            <h3 className="text-white font-semibold mb-3">Developed By</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <a 
                href="https://github.com/angelshinh1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition-colors"
              >
                Angel Shinh
              </a>
              <a 
                href="https://github.com/Rakshit-Giri" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition-colors"
              >
                Rakshit Giri
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} DreamSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
