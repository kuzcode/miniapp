import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.doc;
  const [shown, setShown] = useState(false);

  const [selected, setSelected] = useState({
    country: null,
    city: null,
    district: null,
    metro: null,
  });

  // Load step and selected from localStorage
  useEffect(() => {
    const savedSelected = localStorage.getItem('selectedLocation');
    if (savedSelected) {
      setSelected(JSON.parse(savedSelected));
    }
  }, []);

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

  // Receive patterns for gram choices and price calculation
  const patterns = [
    [0.5, 1, 3],
    [1, 2],
    [0.5, 1, 3],
    [0.5, 1, 2],
    [0.5, 1],
    [0.5, 1],
    [2, 4, 5],
    [2, 5, 10],
    [6, 7, 10],
    [0.5, 1, 3],
    [0.7, 1],
    [3],
    [0.5, 1],
    [0.3, 0.5],
  ];
  // Use the passed-in position or fallback to 0
  const position = location.state?.position ?? 0;
  const idx = position % patterns.length;
  const weights = patterns[idx];
  const basePrice = product.price;
  const calculatePrice = (w) => {
    let price = basePrice * w;
    if (w > 1) {
      const discount = Math.min((w - 1) * 0.05, 0.1);
      price *= 1 - discount;
    }
    price = price >= 1000 ? Math.round(price / 100) * 100 : Math.round(price / 10) * 10;
    return price + 200;
  };

  return (
    <div className="product-page" style={{ padding: '16px' }}>
      <button className="back-arrow" onClick={() => navigate(-1)}>
        &larr; Назад
      </button>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <img
          src={product.img}
          alt={product.name}
          className="product-img"
          style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
        />
      </div>
      <h2 style={{ marginBottom: '24px' }} className="title">
        {product.name}
      </h2>
      <p className="description">{product.description}</p>
      <p>Клады в радиусе 1км от 📍 {selected?.metro || selected.district?.name || selected.city?.name || 'Вас'}:</p>
      <div className="grams">
        {weights.map((w) => (
          <li key={w}>
            <p>{w}{['Экстази', 'LSD Sunshine'].includes(product.name) ? ' шт.' : 'г'}</p>
            <p>{calculatePrice(w)}₽</p>
          </li>
        ))}
      </div>

      {shown && (
        <div className="selectgram">
          <div className="container">
            <h3 className='tc'>Выберите количество</h3>
            <div className='col'>
              {weights.map((w) => (
                <button
                  key={w}
                  className="ios-btn"
                  onClick={() =>
                    navigate('/checkout', {
                      state: { product, variants: [{ weight: w, price: calculatePrice(w) }] },
                    })
                  }
                >
                  <p>
                    {w}г - {calculatePrice(w)}₽
                  </p>
                </button>
              ))}
              <button className="ios-btn" onClick={() => setShown(false)}>
                <p>Отмена</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="center">
        <button
          className="buy-btn welcome-btn"
          style={{ padding: '12px 24px' }}
          onClick={() => {
            if (weights.length > 1) {
              setShown(true);
            } else {
              const w = weights[0];
              navigate('/checkout', {
                state: { product, variants: [{ weight: w, price: calculatePrice(w) }] },
              });
            }
          }}
        >
          Купить
        </button>
      </div>
    </div>
  );
}

export default ProductPage;