import './TrustBar.css';

function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="trust-bar__payments">
        <img src="/visa.svg" alt="Visa" className="payment-icon" />
        <img src="/mastercard.svg" alt="Mastercard" className="payment-icon" />
        <img src="/promptpay.svg" alt="PromptPay" className="payment-icon" />
      </div>
      <div className="trust-bar__info">
        <span className="badge badge--blue">🛡️ 100% Secure Payment</span>
        <span className="badge badge--purple">⭐ Trusted by 10,000+ customers</span>
      </div>
    </div>
  );
}

export default TrustBar;