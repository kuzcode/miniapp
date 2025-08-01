import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import lottie from 'lottie-web';
import translations from './lang';
import mapData from './map';
import hat from './hat.jpeg'

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

  // load profile from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);
  const lottieRef = useRef(null);

  useEffect(() => {
    // if bot.py passed user info via query params, use it
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get('user_id');
    const firstNameParam = params.get('first_name');
    const lastNameParam = params.get('last_name');
    const usernameParam = params.get('username');
    if (userIdParam) {
      const profileObj = {
        id: userIdParam,
        name: `${firstNameParam || ''} ${lastNameParam || ''}`.trim(),
        username: usernameParam,
      };
      setProfile(profileObj);
      localStorage.setItem('profile', JSON.stringify(profileObj));
      return;
    }
    // fallback to Telegram WebApp user data
    if (window.TelegramWebApp) {
      const tg = window.TelegramWebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        const profileObj = {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          username: user.username
        };
        setProfile(profileObj);
        localStorage.setItem('profile', JSON.stringify(profileObj));
      }
    }
  }, []);

  // Load step and selected from localStorage
  useEffect(() => {
    const savedSelected = localStorage.getItem('selectedLocation');
    const welcomeShown = localStorage.getItem('welcome_shown');
    if (savedSelected) {
      setSelected(JSON.parse(savedSelected));
      setStep(5);
    } else if (welcomeShown) {
      setStep(1);
    }
  }, []);

  // Save selected to localStorage when profile step reached
  useEffect(() => {
    if (step === 5) {
      localStorage.setItem('selectedLocation', JSON.stringify(selected));
    }
  }, [step, selected]);

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

  const t = translations[lang] || translations.en;

  // Helper to build list entries per step
  let entries = [];
  if (step === 1) {
    entries = mapData.map(country => ({
      label: country.country,
      value: country,
    }));
  } else if (step === 2) {
    entries = selected.country?.cities?.map(city => ({
      label: city.name,
      value: city,
    })) || [];
  } else if (step === 3) {
    entries = selected.city?.districts?.map(dist => ({
      label: dist.name,
      value: dist,
    })) || [];
  } else if (step === 4) {
    entries = selected.district?.metro?.map(name => ({
      label: name,
      value: name,
    })) || [];
  }

  // Auto-skip steps if no entries available
  useEffect(() => {
    if (step >= 2 && step <= 4) {
      let list = [];
      if (step === 2) list = selected.country?.cities || [];
      if (step === 3) list = selected.city?.districts || [];
      if (step === 4) list = selected.district?.metro || [];
      if (list.length === 0) {
        setStep(5);
      }
    }
  }, [step, selected]);

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
              // corrected onClick below without diff residue
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
    const username = profile ? `@${profile.username}` : t.profile_username;
    return (
      <div className="profile-page">
        <div className='title'>
          <h1>Incognito</h1>
          <img src={hat} />
        </div>
        {profile && (
          <div className="profile-header">
            <div className="profile-info">
              <h2 className="profile-name compact">{name}</h2>
              <div className="profile-username compact">{username}</div>
            </div>
          </div>
        )}
        <div className="profile-username compact" onClick={() => { setStep(1) }}>
          📍 {selected.city?.name}, {selected.metro ? selected.metro : selected?.district?.name}
        </div>
        <div className="profile-actions">
          {[t.btn1, t.btn2].map((label, i) => (
            <button
              key={i}
              className="ios-btn"
              onClick={() => window.location.href = `/action/${i}?label=${encodeURIComponent(label)}`}
            >
              {label}
            </button>
          ))}
          <p className='description tc'>Наш магазин постоянно расширяется. Ожидайте пополнение новых категорий и товаров в них.<br/><br/>Incognito.</p>
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
