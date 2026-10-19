// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.

// 13단계: 기기 status → 화면 문구. 공식 과제 안내(13단계)의 표현을 그대로 씁니다.
const DEVICE_STATUS_TEXT = {
  compliant: '보안 기준 충족',
  noncompliant: '보안 기준 미충족',
  unknown: '확인 불가',
};
// 13단계: 세션 status → 화면 문구.
const SESSION_STATUS_TEXT = {
  active: '활성',
  expired: '만료',
  revoked: '철회됨',
  unknown: '확인 불가',
};
// 13단계: 자원의 mode(연결 종류) → 함께 보여 줄 안내. connected는 별도 안내 없음.
const MODE_NOTE_TEXT = {
  demo: '예제 자료',
  disconnected: '연결 없음',
};

function identityText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

// me.mode가 connected가 아니면(demo/disconnected/그 밖의 값=확인 불가) 안내 한 줄을 추가한다.
// loading·error 상태에서도 이 안내는 함께 보인다(공식 안내 37번 줄).
function identityModeNote(mode) {
  if (mode === 'connected') return null;
  const text = Object.hasOwn(MODE_NOTE_TEXT, mode) ? MODE_NOTE_TEXT[mode] : '확인 불가';
  return identityText('p', text, 'identity-mode');
}

function identityField(dl, label, value) {
  dl.append(identityText('dt', label), identityText('dd', value));
}

// 13단계 구현: student/extension.mjs → renderIdentity.
// 입력은 { me, devices, sessions }이지만, 13단계 공식 과제 안내는 me(현재 사용자·기기 1개·세션 1개)만으로
// 화면을 채우도록 정하고 있어 devices·sessions는 이번 단계에서는 읽지 않는다(이후 단계에서 쓸 입력).
function renderIdentity(input) {
  const me = input && typeof input === 'object' ? input.me : undefined;
  const root = document.createElement('div');
  root.className = 'identity-panel';

  if (!me || typeof me !== 'object' || typeof me.status !== 'string') {
    root.append(identityText('p', '확인 불가: 로그인 정보를 전달받지 못했습니다.', 'identity-status identity-status-error'));
    return root;
  }

  const modeNote = identityModeNote(me.mode);
  if (modeNote) root.append(modeNote);

  if (me.status === 'loading') {
    root.append(identityText('p', '불러오는 중', 'identity-status identity-status-loading'));
    return root;
  }

  if (me.status === 'error') {
    const message = me.error && typeof me.error.message === 'string' && me.error.message.trim() ? me.error.message : '서버에 연결하지 못했습니다.';
    // 이전 사용자·기기·세션 값은 절대 남기지 않는다: 아래에 이 문단 하나만 반환한다.
    root.append(identityText('p', `연결 실패: ${message}`, 'identity-status identity-status-error'));
    return root;
  }

  if (me.status === 'ok' && me.data && typeof me.data === 'object') {
    const { user, device, session } = me.data;
    const dl = document.createElement('dl');
    dl.className = 'identity-fields';
    identityField(dl, '사용자', typeof user?.label === 'string' && user.label ? user.label : '확인 불가');
    const deviceStatusText = Object.hasOwn(DEVICE_STATUS_TEXT, device?.status) ? DEVICE_STATUS_TEXT[device.status] : '확인 불가';
    const deviceLabel = typeof device?.label === 'string' && device.label ? device.label : '확인 불가';
    identityField(dl, '기기', `${deviceLabel} — ${deviceStatusText}`);
    const sessionStatusText = Object.hasOwn(SESSION_STATUS_TEXT, session?.status) ? SESSION_STATUS_TEXT[session.status] : '확인 불가';
    identityField(dl, '세션', sessionStatusText);
    root.append(dl);
    return root;
  }

  // 계약에 없는 status 값: 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다.
  root.append(identityText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'identity-status'));
  return root;
}

export function createStudentView() {
  return {
    renderIdentity,
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
