import './ProductGrid.css';

const products = [
  {
    name: 'Steam Wallet $50',
    price: '$50.00',
    image: '/steam.svg',
  },
  {
    name: 'Netflix Premium Account',
    price: '$15.00',
    image: '/netflix.svg',
  },
  {
    name: 'Garena Shells',
    price: '$20.00',
    image: '/garena.svg',
  },
  {
    name: 'iTunes Gift Card',
    price: '$25.00',
    image: '/itunes.svg',
  },
];

function ProductGrid() {
  return (
    <section className="product-grid">
      {products.map((product) => (
        <div className="product-card" key={product.name}>
          <img src={product.image} alt={product.name} className="product-card__img" />
          <div className="product-card__info">
            <h2>{product.name}</h2>
            <div className="product-card__price">{product.price}</div>
            <button className="product-card__buy">Buy Now</button>
            <span className="badge badge--green product-card__badge">⚡ Instant Delivery</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export default ProductGrid;