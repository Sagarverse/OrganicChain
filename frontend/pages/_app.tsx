import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <Component {...pageProps} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
