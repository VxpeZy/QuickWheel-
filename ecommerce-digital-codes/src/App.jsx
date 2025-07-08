import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import TrustBar from './components/TrustBar';
import Footer from './components/Footer';
import SupportChatButton from './components/SupportChatButton';
import './App.css';

function App() {
  return (
    <div className="app-root">
      <Header />
      <Hero />
      <ProductGrid />
      <TrustBar />
      <Footer />
      <SupportChatButton />
    </div>
  );
}

export default App;
