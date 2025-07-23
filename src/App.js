import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import lottie from 'lottie-web';
import translations from './lang';
import countries from './countries';

const LOTTIE_URL = process.env.PUBLIC_URL + '/duck.json';

function getCountryCode() {
  // Пробуем получить страну из Telegram Mini App, если есть
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.language_code) {
    const lang = window.Telegram.WebApp.initDataUnsafe.user.language_code;
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('en')) return 'en';
    return 'en';
  }
  // Если не в Telegram, пробуем по браузеру
  const navLang = navigator.language || navigator.userLanguage;
  if (navLang.startsWith('ru')) return 'ru';
  if (navLang.startsWith('en')) return 'en';
  return 'en';
}

function getProfileFromTelegram() {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    return {
      name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
      username: user.username ? '@' + user.username : '',
      photo: user.photo_url || undefined,
    };
  }
  return null;
}

function App() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'country' | 'profile'
  const [lang, setLang] = useState(getCountryCode());
  const [profile, setProfile] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null); // страна не определяется автоматически
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [search, setSearch] = useState('');
  const lottieRef = useRef(null);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // useEffect для определения страны по IP удалён

  useEffect(() => {
    if (screen === 'welcome' && lottieRef.current) {
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
      return () => {
        if (anim) anim.destroy();
      };
    }
  }, [screen]);

  useEffect(() => {
    // Если профиль ещё не получен, пробуем взять из Telegram Mini App
    if (screen === 'profile' && !profile) {
      const tgProfile = getProfileFromTelegram();
      if (tgProfile) setProfile(tgProfile);
    }
  }, [screen, profile]);

  useEffect(() => {
    if (screen === 'country' && !selectedCountry) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const found = countries.find(c => c.code === data.country_code);
          if (found) setSelectedCountry(found);
        })
        .catch(() => {});
    }
  }, [screen, selectedCountry]);

  const t = translations[lang] || translations.en;

  // --- ЭКРАНЫ ---
  if (screen === 'profile') {
    const name = profile?.name || t.profile_name;
    const username = profile?.username || t.profile_username;
    const photo = profile?.photo || 'https://i.pravatar.cc/180?img=3';
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar compact">
            <img src={photo} alt="avatar" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name compact">{name}</h2>
            <div className="profile-username compact">{username}</div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="ios-btn">{t.action1 || 'Кнопка 1'}</button>
          <button className="ios-btn">{t.action2 || 'Кнопка 2'}</button>
          <button className="ios-btn">{t.action3 || 'Кнопка 3'}</button>
        </div>
      </div>
    );
  }

  if (screen === 'country') {
    const handleCountryClick = () => {
      setShowCountryModal(true);
    };
    const handleCountrySelect = (country) => {
      setSelectedCountry(country);
      setShowCountryModal(false);
      setSearch('');
    };
    const handleModalClose = () => {
      setShowCountryModal(false);
      setSearch('');
    };
    return (
      <div className="country-select-page fade-in">
        <h1 className="welcome-title">Выберите страну</h1>
        <div className="country-select-placeholder" onClick={handleCountryClick} style={{cursor:'pointer'}}>
          {selectedCountry ? (
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:24}}>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : 'Страна'}
        </div>
        <button className="welcome-btn" style={{background: '#1976d2', color: '#fff'}}>Дальше</button>
        {showCountryModal && (
          <div className="modal-overlay" onClick={handleModalClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
              <input
                className="modal-search"
                type="text"
                placeholder="Поиск страны"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <div className="modal-list">
                {filteredCountries.map(c => (
                  <div
                    key={c.code}
                    className="modal-country-item"
                    onClick={() => handleCountrySelect(c)}
                  >
                    <span style={{fontSize:22, marginRight:10}}>{c.flag}</span>
                    {c.name}
                  </div>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="modal-country-item" style={{color:'#bbb'}}>Ничего не найдено</div>
                )}
              </div>
              <button className="modal-close-btn" onClick={handleModalClose}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ПРИВЕТСТВЕННЫЙ ЭКРАН ---
  return (
    <div className="welcome-container fade-in">
      <div ref={lottieRef} className="welcome-sticker" style={{overflow: 'hidden'}}></div>
      <h1 className="welcome-title">{t.welcome}</h1>
      <p className="welcome-desc">{t.description}</p>
      <button className="welcome-btn" onClick={() => {
        setScreen('country');
      }}>{t.start}</button>
    </div>
  );
}

export default App;
