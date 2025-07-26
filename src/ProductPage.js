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
      <div className='center'>
        <button className="buy-btn welcome-btn" style={{ padding: '12px 24px' }}>
          Купить
        </button>
      </div>
    </div>
  );
}

export default ProductPage;