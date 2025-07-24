import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import lottie from 'lottie-web';
import translations from './lang';
import mapData from './map';

const LOTTIE_URL = process.env.PUBLIC_URL + '/duck.json';

// Detect language code
function getCountryCode() {
  if (
    window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code
  ) {
    const lang = window.Telegram.WebApp.initDataUnsafe.user.language_code;
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('en')) return 'en';
  }
  const nav = navigator.language || navigator.userLanguage;
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('en')) return 'en';
  return 'en';
}

// Fetch Telegram profile if available
function getProfileFromTelegram() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (user) {
    return {
      name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
      username: user.username ? '@' + user.username : '',
      photo: user.photo_url,
    };
  }
  return null;
}

function App() {
  const [step, setStep] = useState(0); // 0=welcome,1=country,2=city,3=district,4=metro,5=profile
  const [selected, setSelected] = useState({
    country: null,
    city: null,
    district: null,
    metro: null,
  });
  const [lang] = useState(getCountryCode());
  const [profile, setProfile] = useState(null);
  const lottieRef = useRef(null);

  // Lottie animation on welcome
  useEffect(() => {
    if (step === 0 && lottieRef.current) {
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
  }, [step]);

  // Load Telegram profile on final step
  useEffect(() => {
    if (step === 5 && !profile) {
      const tg = getProfileFromTelegram();
      if (tg) setProfile(tg);
    }
  }, [step, profile]);

  const t = translations[lang] || translations.en;

  // Helper to build list entries per step
  let entries = [];
  if (step === 1) {
    entries = mapData.map(country => ({
      label: country.country,
      value: country,
    }));
  } else if (step === 2) {
    entries = selected.country?.cities.map(city => ({
      label: city.name,
      value: city,
    })) || [];
  } else if (step === 3) {
    entries = selected.city?.districts.map(dist => ({
      label: dist.name,
      value: dist,
    })) || [];
  } else if (step === 4) {
    entries = selected.district?.metro.map(name => ({
      label: name,
      value: name,
    })) || [];
  }

  // Render wizard list pages
  if (step > 0 && step < 5) {
    const currentKey = ['country', 'city', 'district', 'metro'][step - 1];
    const headerMap = {
      1: 'Выберите страну',
      2: 'Выберите город',
      3: 'Выберите район',
      4: 'Выберите станцию метро',
    };
    const headerText = headerMap[step];
    return (
      <>
        <div className="wizard-header">
          <button className="back-arrow" onClick={() => setStep(step - 1)}>
            &larr;
          </button>
          <h2 className="wizard-title">{headerText}</h2>
        </div>
        <div className="select-page">
          {entries.map(entry => (
            <button
              key={entry.label}
              className={`ios-btn mt ${selected[currentKey] === entry.value ? 'selected-list' : ''}`}
              onClick={() => {
                const next = { ...selected, [currentKey]: entry.value };
                // Clear deeper selections
                if (currentKey === 'country') {
                  next.city = next.district = next.metro = null;
                }
                if (currentKey === 'city') {
                  next.district = next.metro = null;
                }
                if (currentKey === 'district') {
                  next.metro = null;
                }
                setSelected(next);
              }}
            >
              {entry.label}
            </button>
          ))}
          {selected[currentKey] && (
            <button className="welcome-btn fix" onClick={() => setStep(step + 1)}>
              Далее
            </button>
          )}
        </div>
      </>
    );
  }

  // Render profile page after wizard complete
  if (step === 5) {
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
          <button className="ios-btn">{t.btn1}</button>
          <button className="ios-btn">{t.btn2}</button>
          <button className="ios-btn">{t.btn3}</button>
          <button className="ios-btn">{t.btn4}</button>
          <button className="ios-btn">{t.btn5}</button>
          <button className="ios-btn">{t.btn6}</button>
        </div>
      </div>
    );
  }

  // Welcome page
  return (
    <div className="welcome-container">
      <div ref={lottieRef} className="welcome-sticker" style={{ overflow: 'hidden' }} />
      <h1 className="welcome-title">{t.welcome}</h1>
      <p className="welcome-desc">{t.description}</p>
      <button
        className="welcome-btn"
        onClick={() => {
          localStorage.setItem('welcome_shown', '1');
          setStep(1);
        }}
      >
        {t.start}
      </button>
    </div>
  );
}

export default App;
