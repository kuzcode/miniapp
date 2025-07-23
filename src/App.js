import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import lottie from 'lottie-web';
import translations from './lang';

const LOTTIE_URL = process.env.PUBLIC_URL + '/duck.json';

function getCountryCode() {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.language_code) {
    const lang = window.Telegram.WebApp.initDataUnsafe.user.language_code;
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('en')) return 'en';
    return 'en';
  }
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
  const [showProfile, setShowProfile] = useState(() => {
    return localStorage.getItem('welcome_shown') === '1';
  });
  const [lang, setLang] = useState(getCountryCode());
  const [profile, setProfile] = useState(null);
  const [debug, setDebug] = useState(null);
  const lottieRef = useRef(null);

  useEffect(() => {
    if (!showProfile && lottieRef.current) {
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
  }, [showProfile]);

  useEffect(() => {
    if (showProfile && !profile) {
      const tgProfile = getProfileFromTelegram();
      setProfile(tgProfile);
      // Для отладки сохраняем весь initDataUnsafe
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
        setDebug(window.Telegram.WebApp.initDataUnsafe);
      } else {
        setDebug('window.Telegram или WebApp не определены');
      }
    }
  }, [showProfile, profile]);

  const t = translations[lang] || translations.en;

  if (showProfile) {
    const name = profile?.name || t.profile_name;
    const username = profile?.username || t.profile_username;
    const photo = profile?.photo || 'https://i.pravatar.cc/180?img=3';
    return (
      <div className="welcome-container">
        <div className="profile-avatar">
          <img src={photo} alt="avatar" />
        </div>
        <h2 className="profile-name">{name}</h2>
        <div className="profile-username">{username}</div>
        {!profile && (
          <div style={{marginTop: 24, color: '#c00', fontSize: 14, maxWidth: 340, wordBreak: 'break-all'}}>
            <b>Профиль Telegram не найден!</b><br/>
            Скорее всего, мини-апп открыт не через Telegram или Telegram не передал данные пользователя.<br/>
            <br/>
            <b>initDataUnsafe:</b>
            <pre style={{fontSize: 12, background: '#f8f8f8', padding: 8, borderRadius: 8, overflowX: 'auto'}}>{typeof debug === 'string' ? debug : JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div ref={lottieRef} className="welcome-sticker" style={{overflow: 'hidden'}}></div>
      <h1 className="welcome-title">{t.welcome}</h1>
      <p className="welcome-desc">{t.description}</p>
      <button className="welcome-btn" onClick={() => {
        localStorage.setItem('welcome_shown', '1');
        setShowProfile(true);
      }}>{t.start}</button>
    </div>
  );
}

export default App;
