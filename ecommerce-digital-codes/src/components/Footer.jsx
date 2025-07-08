import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__socials">
        <a href="#"><img src="/facebook.svg" alt="Facebook" className="social-icon" /></a>
        <a href="#"><img src="/line.svg" alt="Line" className="social-icon" /></a>
        <a href="#"><img src="/discord.svg" alt="Discord" className="social-icon" /></a>
      </div>
      <div className="footer__links">
        <a href="#">Home</a>
        <a href="#products">Products</a>
        <a href="#promotions">Promotions</a>
        <a href="#contact">Contact</a>
      </div>
      <div className="footer__copyright">
        &copy; {new Date().getFullYear()} DigiCodes. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;