import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.doc;

  if (!product) {
    return (
      <div className="product-page">
        <button className="back-arrow" onClick={() => navigate(-1)}>
          &larr; Назад
        </button>
        <p>Товар не найден</p>
      </div>
    );
  }

  return (
    <div className="product-page" style={{ padding: '16px' }}>
      <button className="back-arrow" onClick={() => navigate(-1)}>
        &larr; Назад
      </button>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <img
          src={product.img}
          alt={product.name}
          className='product-img'
          style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
        />
      </div>
      <h2 style={{ marginBottom: '24px' }} className='title'>
        {product.name}
      </h2>
      <p className='description'>
      {product.description}
      </p>
      {/* Dynamic gram options */}
      <div className='grams'>
        {(() => {
          // Define patterns by product index
          const patterns = [
            [0.5],
            [0.5, 1],
            [1],
            [0.5, 3],
            [1, 2, 3],
            [0.5, 1, 2],
            [0.5, 1],
            [1],
          ];
          const idx = (parseInt(id, 10) - 1 + patterns.length) % patterns.length;
          const weights = patterns[idx];
          const basePrice = product.price;
          
          return weights.map((w) => {
            let price = basePrice * w;
            // Apply discount: 5% per extra gram, capped at 10%
            if (w > 1) {
              const discount = Math.min((w - 1) * 0.05, 0.1);
              price = price * (1 - discount);
            }
            // Round to nearest ten (<1000) or hundred (>=1000)
            price =
              price >= 1000
                ? Math.round(price / 100) * 100
                : Math.round(price / 10) * 10;
            
            return (
              <li key={w}>
                <p>{w}г</p>
                <p>{price}₽</p>
              </li>
            );
          });
        })()}
      </div>
      <div className='center'>
        <button
          className="buy-btn welcome-btn"
          style={{ padding: '12px 24px' }}
          onClick={() => {
            const patterns = [
              [0.5], [0.5,1], [1],[0.5,3],
              [1,2,3],[0.5,1,2],[0.5,1],[1]
            ];
            const idx = (parseInt(id, 10) - 1 + patterns.length) % patterns.length;
            const weights = patterns[idx];
            const variants = weights.map(w => {
              let price = product.price * w;
              if (w > 1) {
                const discount = Math.min((w - 1) * 0.05, 0.1);
                price = price * (1 - discount);
              }
              price = price >= 1000
                ? Math.round(price / 100) * 100
                : Math.round(price / 10) * 10;
              return { weight: w, price };
            });
            navigate('/checkout', { state: { product, variants } });
          }}
        >
          Купить
        </button>
      </div>
    </div>
  );
}

export default ProductPage;