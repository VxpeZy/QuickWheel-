import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header__logo">DigiCodes</div>
      <nav className="header__nav">
        <a href="#">Home</a>
        <a href="#products">Products</a>
        <a href="#promotions">Promotions</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="header__payments">
        <img src="/visa.svg" alt="Visa" className="payment-icon" />
        <img src="/mastercard.svg" alt="Mastercard" className="payment-icon" />
        <img src="/promptpay.svg" alt="PromptPay" className="payment-icon" />
      </div>
      <button className="header__support">
        <span role="img" aria-label="chatbot">💬</span>
      </button>
    </header>
  );
}

export default Header;