import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import copy from './copy.png'

const coinIds = [{
  name: 'Bitcoin',
  id: 'bitcoin',
  img: 'https://user-images.githubusercontent.com/73211975/128097437-7c56579c-79a4-4d41-b699-bcd8c093cb3e.png'
},
{
  name: 'Ethereum',
  id: 'ethereum',
  img: 'https://static.tildacdn.com/tild3236-6133-4335-a366-316262313538/ethereum-eth.svg'
},
{
  name: 'USDT trc20',
  id: 'tether',
  img: 'https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png'
},
{
  name: 'USDT erc20',
  id: 'tether',
  img: 'https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png'
},
];

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { product, variants } = state || {};
  const [selected, setSelected] = useState(null);
  const [payment, setPayment] = useState('');
  const [coin, setCoin] = useState('');
  const [loading, setLoading] = useState(false);
  const [cryptoInfo, setCryptoInfo] = useState(null);

  useEffect(() => {
    if (!product || !variants) return navigate(-1);
    if (variants.length === 1) {
      setSelected(variants[0]);
    }
  }, [product, variants, navigate]);

  const handleCoin = async (c) => {
    setLoading(true);
    setCoin(c.id);
    try {
      // Используем API CoinCap
      const res = await fetch(`https://api.coincap.io/v2/assets/${c.id}`);
      const data = await res.json();
      const rate = parseFloat(data.data.priceUsd);
      const amount = (selected.price / rate).toFixed(6);
      setCryptoInfo({ coin: c.name, amount, address: '0xABC123DEF456...' });
    } catch (err) {
      console.error('Ошибка загрузки курса:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page" style={{ padding: '16px' }}>
      <button className="back-arrow" onClick={() => navigate(-1)}>
        &larr; Назад
      </button>
      <h2>Оформление заказа</h2>

      {!selected && (
        <ul className="variant-select">
          {variants.map(v => (
            <li key={v.weight}>
              <button onClick={() => setSelected(v)}>
                {v.weight}г — {v.price}₽
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="order-summary" style={{ margin: '24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={product.img}
              alt={product.name}
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <div style={{ marginLeft: '12px' }}>
              <p>{product.name}</p>
              <p>{selected.weight}г — {selected.price}₽</p>
            </div>
          </div>

          {!payment && (
            <div className="payment-method" style={{ marginTop: '16px' }}>
              <h3>Способ оплаты</h3>
              <button className='ios-btn' onClick={() => setPayment('card')}>
                Карта
              </button>
              <button className='ios-btn' onClick={() => setPayment('crypto')} style={{ marginTop: '12px' }}>
                Криптовалюта
              </button>
            </div>
          )}

          {payment === 'card' && (
            <div className="card-form" style={{ marginTop: '16px' }}>
              <p>
                Номер карты: 1234 5678 9012 3456
              </p>
              <button style={{ marginTop: '12px' }}>Подтвердить</button>
            </div>
          )}

          {payment === 'crypto' && (
            <div className="crypto-form" style={{ marginTop: '16px' }}>
              {!cryptoInfo && coinIds.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleCoin(c)}
                  className='coin-btn'
                >
                  <img src={c.img} />
                  <p>{c.name}</p>
                </button>
              ))}
              {cryptoInfo && (
                <div style={{ marginTop: '12px' }}>
                  <p>Сумма: <span className='copiable'
                    onClick={() => { navigator.clipboard.writeText(cryptoInfo.amount) }}
                  >{cryptoInfo.amount}
                    <img src={copy} />
                  </span> {cryptoInfo.coin}</p>
                  <p>Адрес: <span className='copiable'
                    onClick={() => { navigator.clipboard.writeText(cryptoInfo.address) }}
                  >{cryptoInfo.address}
                    <img src={copy} />
                  </span></p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}