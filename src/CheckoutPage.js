import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import copy from './copy.png'
import lottie from 'lottie-web';

const coinIds = [{
  name: 'Bitcoin',
  id: 'bitcoin',
  bg: 'F7931A',
  ad: 'bc1qf20rayujmzyhanw2tf4yf8nhcg7nsxx0tyd6zx'
},
{
  name: 'Ethereum',
  id: 'ethereum',
  bg: '627eea',
  ad: '0x64b0562Ef1E62F22F7448300dA561213E8b13170'
},
{
  name: 'USDT trc20',
  id: 'tether',
  bg: '26a17b',
  ad: 'TDkYnm1V6R1HzWHc6LVkubKFp1LeFp9rtU'
},
{
  name: 'USDT erc20',
  id: 'tether',
  bg: '26a17b',
  ad: '0x64b0562Ef1E62F22F7448300dA561213E8b13170'
},
{
  name: 'Monero',
  id: 'monero',
  bg: 'ff6501',
  ad: '46bHjcVyQbYR2ArqzfcUuAUDJgQaMRTC1K8Hdc9bEdgqAx1BTTZY467X6AJNXc5sztgh54WzR5T8pUF9y3oVAMZsERFFnmZ'
},
{
  name: 'TON',
  id: 'the-open-network',
  bg: '0088cc',
  ad: 'UQCg3cIKsdAlnWhXVFcv-s1tuka-7FiCZsZef1OqOr2Y2VT9'
},
];

const LOTTIE_URL = process.env.PUBLIC_URL + '/think.json';

export default function CheckoutPage() {
  const lottieRef = useRef(null);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { product, variants } = state || {};
  const [selected, setSelected] = useState(null);
  const [payment, setPayment] = useState('crypto');
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
      // Используем API CoinGecko
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${c.id}&vs_currencies=rub`);
      const data = await res.json();
      const rate = parseFloat(data[c.id].rub);
      const amount = (selected.price * 1.01 / rate).toFixed(6);
      setCryptoInfo({ coin: c.name, amount, address: c.ad });
    } catch (err) {
      console.error('Ошибка загрузки курса:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lottieRef.current) {
      let anim;
      fetch(LOTTIE_URL)
        .then(res => res.json())
        .then(data => {
          anim = lottie.loadAnimation({
            container: lottieRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: data,
          });
        });
      return () => anim?.destroy();
    }
  }, [cryptoInfo]);

  return (
    <div className="checkout-page">
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
          {!cryptoInfo && (
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
          )}

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
            <>
            {!cryptoInfo && (
            <h3>Способ оплаты</h3>
            )}
              <div className="crypto-form" style={{ marginTop: '16px' }}>
                {!cryptoInfo && coinIds.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleCoin(c)}
                    className='coin-btn'
                    style={
                      {
                        backgroundColor: `#${c.bg}`
                      }
                    }
                  >
                    <p>{c.name}</p>
                  </button>
                ))}
                {cryptoInfo && (
                  <div style={{ marginTop: '12px' }}>
                    <div ref={lottieRef} className="welcome-sticker" />
                    <p>Ниже указаны данные для перевода криптовалюты. Отправьте ровно указанное количество на этот адрес и ожидайте. Транзакция будет принята до двух часов (обычно 10 минут), после чего вы получите координаты места с кладом.</p>
                    <p>Сумма: <span className='copiable'
                      onClick={() => { navigator.clipboard.writeText(cryptoInfo.amount); }}
                    >{cryptoInfo.amount}
                      <img src={copy} />
                    </span> {cryptoInfo.coin}</p>
                    <p>Адрес: <span className='copiable'
                      onClick={() => { navigator.clipboard.writeText(cryptoInfo.address); }}
                    >{cryptoInfo.address}
                      <img src={copy} />
                    </span></p>
                  </div>
                )}
              </div></>
          )}
        </div>
      )}
    </div>
  );
}