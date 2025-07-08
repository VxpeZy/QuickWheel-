import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1>Limited Time Google Play Promo <span className="hero__highlight">50% OFF</span></h1>
        <p>Get your digital codes instantly. Secure, fast, and trusted by thousands.</p>
        <div className="hero__actions">
          <button className="hero__cta">Shop Now</button>
          <div className="hero__badges">
            <span className="badge badge--green">⚡ Instant Delivery</span>
            <span className="badge badge--blue">🛡️ 100% Secure Payment</span>
            <span className="badge badge--purple">⭐ Trusted by 10,000+ customers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;