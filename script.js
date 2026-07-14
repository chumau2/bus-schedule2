// Firebase 설정 (프로젝트 키값 적용)
const firebaseConfig = {
  apiKey: "AIzaSyDgKi46rw82_fICQO02CbUk4e2FGMP3IeE",
  authDomain: "chma-422a0.firebaseapp.com",
  databaseURL: "https://chma-422a0-default-rtdb.firebaseio.com",
  projectId: "chma-422a0",
  storageBucket: "chma-422a0.firebasestorage.app",
  messagingSenderId: "892005342672",
  appId: "1:892005342672:web:84e1a91af343b034f2edd5"
};

// Firebase 초기화 및 Realtime Database 연결
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 초기 노선 데이터 정의 (한국어 / 영어 다국어 지원)
const defaultRoutes = [
  {
    id: "r1",
    terminal: { ko: "음성터미널", en: "Eumseong Terminal" },
    dest: { ko: "동서울", en: "East Seoul" },
    via: { ko: "금왕, 일죽 경유", en: "via Geumwang, Iljuk" },
    times: [
      { time: "06:30", modified: false },
      { time: "08:10", modified: false },
      { time: "10:00", modified: false },
      { time: "12:30", modified: false },
      { time: "14:50", modified: false },
      { time: "17:10", modified: false },
      { time: "19:30", modified: false }
    ]
  },
  {
    id: "r2",
    terminal: { ko: "음성터미널", en: "Eumseong Terminal" },
    dest: { ko: "청주", en: "Cheongju" },
    via: { ko: "증평, 북청주 경유", en: "via Jeungpyeong, N.Cheongju" },
    times: [
      { time: "07:00", modified: false },
      { time: "08:40", modified: false },
      { time: "10:30", modified: false },
      { time: "13:10", modified: false },
      { time: "15:40", modified: false },
      { time: "18:20", modified: false }
    ]
  },
  {
    id: "r3",
    terminal: { ko: "금왕터미널", en: "Geumwang Terminal" },
    dest: { ko: "동서울", en: "East Seoul" },
    via: { ko: "일죽, 하이패스 직행", en: "via Iljuk, Direct" },
    times: [
      { time: "06:50", modified: false },
      { time: "08:30", modified: false },
      { time: "10:20", modified: false },
      { time: "12:50", modified: false },
      { time: "15:10", modified: false },
      { time: "17:30", modified: false },
      { time: "19:50", modified: false }
    ]
  },
  {
    id: "r4",
    terminal: { ko: "금왕터미널", en: "Geumwang Terminal" },
    dest: { ko: "충주", en: "Chungju" },
    via: { ko: "주덕 경유", en: "via Judeok" },
    times: [
      { time: "07:20", modified: false },
      { time: "09:10", modified: false },
      { time: "11:40", modified: false },
      { time: "14:00", modified: false },
      { time: "16:30", modified: false },
      { time: "19:00", modified: false }
    ]
  }
];

// 다국어 번역 데이터
const i18n = {
  ko: {
    siteTitle: "시외버스 시간표 안내",
    siteSub: "음성터미널 · 금왕터미널 직행 노선",
    adminLogin: "관리자 로그인",
    searchPh: "터미널명 또는 행선지 검색 (예: 동서울, 청주, 금왕)",
    search: "검색",
    adminMode: "관리자 모드",
    logout: "로그아웃",
    surveyTitle: "시간표 만족도 및 의견 제출",
    surveyDesc: "시간표 정보의 정확도나 개선점 의견을 자유롭게 남겨주세요.",
    surveyPh: "의견을 적어주세요 (선택사항)",
    submitSurvey: "의견 제출하기",
    loginTitle: "관리자 로그인",
    loginHint: "비밀번호를 입력하세요 (기본: admin1234)",
    cancel: "취소",
    login: "로그인",
    loginErr: "비밀번호가 올바르지 않습니다.",
    noResults: "검색 결과가 없습니다.",
    addTime: "+ 시간 추가",
    modified: "변경됨",
    toastSurveySubmitted: "의견이 정상적으로 제출되었습니다.",
    toastAdminSuccess: "관리자로 로그인되었습니다.",
    toastLoggedOut: "로그아웃되었습니다."
  },
  en: {
    siteTitle: "Intercity Bus Timetable",
    siteSub: "Eumseong · Geumwang Terminal Direct Routes",
    adminLogin: "Admin Login",
    searchPh: "Search terminal or destination...",
    search: "Search",
    adminMode: "Admin Mode",
    logout: "Logout",
    surveyTitle: "Feedback & Survey",
    surveyDesc: "Please share your thoughts on timetable accuracy or suggestions.",
    surveyPh: "Leave a comment (optional)",
    submitSurvey: "Submit Feedback",
    loginTitle: "Admin Login",
    loginHint: "Enter password (default: admin1234)",
    cancel: "Cancel",
    login: "Login",
    loginErr: "Incorrect password.",
    noResults: "No routes found.",
    addTime: "+ Add Time",
    modified: "Modified",
    toastSurveySubmitted: "Thank you for your feedback!",
    toastAdminSuccess: "Logged in as Admin.",
    toastLoggedOut: "Logged out."
  }
};

let currentLang = 'ko';
let isAdmin = false;
let selectedStar = 5;

// LocalStorage 노선 데이터 초기화
let routes = JSON.parse(localStorage.getItem('bus_routes')) || defaultRoutes;
let surveys = [];

// Toast 메세지 표시
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// 언어 적용
function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) el.innerText = i18n[currentLang][key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (i18n[currentLang][key]) el.placeholder = i18n[currentLang][key];
  });
  document.getElementById('langToggle').innerText = currentLang === 'ko' ? 'ENG' : 'KOR';
}

// 시간표 화면 렌더링
function renderRoutes(query = '') {
  const container = document.getElementById('routeList');
  container.innerHTML = '';

  const q = query.toLowerCase();

  const filtered = routes.filter(r => {
    const termKo = typeof r.terminal === 'object' ? r.terminal.ko : r.terminal;
    const termEn = typeof r.terminal === 'object' ? r.terminal.en : '';
    const destKo = typeof r.dest === 'object' ? r.dest.ko : r.dest;
    const destEn = typeof r.dest === 'object' ? r.dest.en : '';
    const viaKo = typeof r.via === 'object' ? r.via.ko : r.via;
    const viaEn = typeof r.via === 'object' ? r.via.en : '';

    return termKo.toLowerCase().includes(q) || termEn.toLowerCase().includes(q) ||
           destKo.toLowerCase().includes(q) || destEn.toLowerCase().includes(q) ||
           viaKo.toLowerCase().includes(q) || viaEn.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty">${i18n[currentLang].noResults}</div>`;
    return;
  }

  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'route-card';

    const terminalText = typeof r.terminal === 'object' ? (r.terminal[currentLang] || r.terminal.ko) : r.terminal;
    const destText = typeof r.dest === 'object' ? (r.dest[currentLang] || r.dest.ko) : r.dest;
    const viaText = typeof r.via === 'object' ? (r.via[currentLang] || r.via.ko) : r.via;

    let timesHtml = r.times.map((t, idx) => `
      <div class="time-chip ${t.modified ? 'modified' : ''} ${isAdmin ? 'admin' : ''}">
        <span class="t">${t.time}</span>
        ${t.modified ? '<span class="mod-dot" title="변경됨"></span>' : ''}
        ${isAdmin ? `
          <div class="chip-actions">
            <button class="chip-icon-btn" onclick="editTime('${r.id}', ${idx})">✎</button>
            <button class="chip-icon-btn" onclick="deleteTime('${r.id}', ${idx})">✕</button>
          </div>
        ` : ''}
      </div>
    `).join('');

    if (isAdmin) {
      timesHtml += `<button class="add-time-chip" onclick="addTime('${r.id}')">${i18n[currentLang].addTime}</button>`;
    }

    card.innerHTML = `
      <div class="route-head">
        <div class="route-num">${terminalText}</div>
        <div class="route-name">
          ➔ ${destText}
          <span class="stops">${viaText}</span>
        </div>
      </div>
      <div class="time-board">${timesHtml}</div>
    `;

    container.appendChild(card);
  });
}

// Firebase DB에서 의견 실시간으로 불러와 화면에 출력
function listenSurveys() {
  db.ref('surveys').limitToLast(30).on('value', (snapshot) => {
    const data = snapshot.val();
    surveys = [];
    if (data) {
      Object.keys(data).forEach(key => {
        surveys.unshift(data[key]); // 최신 등록 의견이 맨 위로
      });
    }
    renderSurveys();
  });
}

// 설문 목록 렌더링
function renderSurveys() {
  const container = document.getElementById('surveyList');
  if (surveys.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '<h3>최근 작성된 의견</h3>' + surveys.map(s => `
    <div class="survey-item">
      <div class="si-top">
        <span class="si-stars">${'★'.repeat(s.star)}${'☆'.repeat(5 - s.star)}</span>
        <span class="si-date">${s.date}</span>
      </div>
      ${s.comment ? `<div class="si-comment">${escapeHtml(s.comment)}</div>` : '<div class="si-nocomment">의견 내용 없음</div>'}
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 시간 관리 (추가/수정/삭제)
window.addTime = function(routeId) {
  const newTime = prompt("추가할 시간을 입력하세요 (예: 14:20):");
  if (!newTime) return;
  const route = routes.find(r => r.id === routeId);
  if (route) {
    route.times.push({ time: newTime, modified: true });
    route.times.sort((a,b) => a.time.localeCompare(b.time));
    saveAndRender();
  }
};

window.editTime = function(routeId, index) {
  const route = routes.find(r => r.id === routeId);
  if (!route) return;
  const newTime = prompt("수정할 시간을 입력하세요:", route.times[index].time);
  if (newTime) {
    route.times[index].time = newTime;
    route.times[index].modified = true;
    route.times.sort((a,b) => a.time.localeCompare(b.time));
    saveAndRender();
  }
};

window.deleteTime = function(routeId, index) {
  if (!confirm("이 시간을 삭제하시겠습니까?")) return;
  const route = routes.find(r => r.id === routeId);
  if (route) {
    route.times.splice(index, 1);
    saveAndRender();
  }
};

function saveAndRender() {
  localStorage.setItem('bus_routes', JSON.stringify(routes));
  renderRoutes(document.getElementById('searchInput').value.trim());
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  if (routes.length > 0 && typeof routes[0].terminal === 'string') {
    localStorage.removeItem('bus_routes');
    routes = defaultRoutes;
  }

  // 검색 기능
  document.getElementById('searchBtn').addEventListener('click', () => {
    renderRoutes(document.getElementById('searchInput').value.trim());
  });
  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') renderRoutes(e.target.value.trim());
  });

  // 언어 변경
  document.getElementById('langToggle').addEventListener('click', () => {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    applyLanguage();
    renderRoutes(document.getElementById('searchInput').value.trim());
  });

  // 관리자 모달 제어
  const modal = document.getElementById('loginModal');
  document.getElementById('adminBtn').addEventListener('click', () => modal.classList.add('show'));
  document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.remove('show'));

  // 로그인 처리
  document.getElementById('doLoginBtn').addEventListener('click', () => {
    const pw = document.getElementById('adminPwInput').value;
    if (pw === 'admin1234') {
      isAdmin = true;
      modal.classList.remove('show');
      document.getElementById('adminStrip').style.display = 'flex';
      document.getElementById('adminBtn').style.display = 'none';
      document.getElementById('adminPwInput').value = '';
      document.getElementById('loginErr').style.display = 'none';
      showToast(i18n[currentLang].toastAdminSuccess);
      renderRoutes();
    } else {
      document.getElementById('loginErr').style.display = 'block';
    }
  });

  // 로그아웃
  document.getElementById('logoutBtn').addEventListener('click', () => {
    isAdmin = false;
    document.getElementById('adminStrip').style.display = 'none';
    document.getElementById('adminBtn').style.display = 'block';
    showToast(i18n[currentLang].toastLoggedOut);
    renderRoutes();
  });

  // 별점 평가
  const stars = document.querySelectorAll('#starGroup .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedStar = parseInt(star.getAttribute('data-val'));
      stars.forEach((s, idx) => {
        if (idx < selectedStar) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });

  // 설문 제출 (Firebase DB에 실시간 저장)
  document.getElementById('submitSurveyBtn').addEventListener('click', () => {
    const comment = document.getElementById('surveyComment').value.trim();
    const newSurvey = {
      star: selectedStar,
      comment: comment,
      date: new Date().toLocaleDateString()
    };

    db.ref('surveys').push(newSurvey, (error) => {
      if (!error) {
        document.getElementById('surveyComment').value = '';
        showToast(i18n[currentLang].toastSurveySubmitted);
      } else {
        alert("제출 실패: " + error.message);
      }
    });
  });

  // 초기 실행
  applyLanguage();
  renderRoutes();
  listenSurveys(); // 실시간 의견 수신 시작
});
