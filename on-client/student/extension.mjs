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

// 14단계: decision → 화면 문구(한글 뜻). 공식 과제 안내(14단계)의 표현을 그대로 씁니다.
const DECISION_TEXT = {
  allow: '허용',
  deny: '거부',
  challenge: '추가 확인 필요',
  unknown: '확인 불가',
};

function decisionText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function decisionField(dl, label, value) {
  dl.append(decisionText('dt', label), decisionText('dd', value));
}

// 15단계: 기록 kind → 화면 문구. 공식 과제 안내(15단계) 예시(access=접속, xdr=XDR 경보)를 그대로 씁니다.
const EVENT_KIND_TEXT = {
  access: '접속',
  xdr: 'XDR 경보',
};
// 15단계: state.access → 화면 문구. session·device는 13단계와 계약이 같아 위 상수를 그대로 재사용합니다.
const EVENT_ACCESS_TEXT = {
  allowed: '허용됨',
  denied: '거부됨',
  unknown: '확인 불가',
};

function eventsText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

// 상세 화면의 세 상태(state.access/session/device) 공통 표시: "한국어 설명(원래 값)".
// 목록에 없는 값은 unknown으로 다룬다(13·14단계와 같은 규칙).
function eventStateText(map, value) {
  const known = Object.hasOwn(map, value);
  const label = known ? map[value] : '확인 불가';
  const raw = known ? value : 'unknown';
  return `${label}(${raw})`;
}

function eventAppText(appId) {
  return typeof appId === 'string' && appId ? appId : '앱을 확인할 수 없음';
}

// at(ISO 시각 등 원래 값)을 한국 시각으로 읽을 수 있게 바꾸되, 해석할 수 없으면 원래 값을 그대로 쓴다.
function eventTimeText(at) {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return typeof at === 'string' && at ? at : '확인 불가';
  return `${date.toLocaleString('ko-KR')} (${at})`;
}

// 선택한 기록 하나의 상세(evidence·rules·state)를 detail 컨테이너에 다시 그린다.
// 호출될 때마다 이전 내용을 전부 지우고 새로 그리므로, 다른 기록을 고르면 옛 상세가 남지 않는다.
function renderEventDetail(container, event) {
  container.dataset.studentEventDetail = event.id;

  const fields = document.createElement('dl');
  fields.className = 'event-detail-fields';
  fields.append(
    eventsText('dt', '사건 ID'), eventsText('dd', event.id),
    eventsText('dt', '업무 앱'), eventsText('dd', eventAppText(event.appId)),
  );

  const evidenceTitle = eventsText('h5', '근거(evidence)', 'event-detail-subtitle');
  const evidenceList = document.createElement('ul');
  evidenceList.className = 'event-evidence-list';
  const evidence = Array.isArray(event.evidence) ? event.evidence : [];
  if (evidence.length === 0) {
    evidenceList.append(eventsText('li', '근거 정보 없음'));
  } else {
    for (const item of evidence) {
      evidenceList.append(eventsText('li', `${item && item.id ? item.id : '확인 불가'} — ${item && typeof item.text === 'string' ? item.text : ''}`));
    }
  }

  const rulesTitle = eventsText('h5', '규칙(rules)', 'event-detail-subtitle');
  const rulesList = document.createElement('ul');
  rulesList.className = 'event-rules-list';
  const rules = Array.isArray(event.rules) ? event.rules : [];
  if (rules.length === 0) {
    rulesList.append(eventsText('li', '규칙 정보 없음'));
  } else {
    for (const item of rules) {
      rulesList.append(eventsText('li', `${item && item.id ? item.id : '확인 불가'} — ${item && typeof item.text === 'string' ? item.text : ''}`));
    }
  }

  const state = event.state && typeof event.state === 'object' ? event.state : {};
  const stateDl = document.createElement('dl');
  stateDl.className = 'event-detail-state';
  stateDl.append(
    eventsText('dt', '접속(access)'), eventsText('dd', eventStateText(EVENT_ACCESS_TEXT, state.access)),
    eventsText('dt', '세션(session)'), eventsText('dd', eventStateText(SESSION_STATUS_TEXT, state.session)),
    eventsText('dt', '기기(device)'), eventsText('dd', eventStateText(DEVICE_STATUS_TEXT, state.device)),
  );

  const nodes = [fields, evidenceTitle, evidenceList, rulesTitle, rulesList, stateDl];

  // 16단계: 실제 목록의 supportedActions가 있을 때만 "<action> 미지원" 비활성 버튼을 둔다.
  // 15·16단계 자동 확인이 연결되지 않은 조치를 넘겨 줄 수 있어 이 상세 화면에 둔다(요청은 보내지 않음).
  const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
  if (supportedActions.length > 0) {
    nodes.push(eventsText('h5', '조치(action)', 'event-detail-subtitle'));
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'event-unsupported-actions';
    for (const action of supportedActions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = true;
      button.className = 'event-unsupported-action';
      button.textContent = `${action} 미지원`;
      actionsWrap.append(button);
    }
    actionsWrap.append(eventsText('p', '조치 실행 연결은 준비 중입니다. 이 버튼은 요청을 보내지 않습니다.', 'event-detail-note'));
    nodes.push(actionsWrap);
  }

  container.replaceChildren(...nodes);
}

// 15단계 구현: student/extension.mjs → renderEvents. 13·14단계 함수는 그대로 둡니다.
// 입력은 { status, mode, data?, error? }. data는 기록 배열이며, 필터·상세는 서버에 다시 묻지 않고
// 이 배열 안에서만(DOM 조작으로) 처리한다.
function renderEvents(input) {
  const status = input && typeof input === 'object' ? input.status : undefined;
  const root = document.createElement('div');
  root.className = 'events-panel';

  if (status === 'loading') {
    root.append(eventsText('p', '불러오는 중', 'events-status events-status-loading'));
    return root;
  }

  if (status === 'error') {
    const error = input.error;
    const message = error && typeof error.message === 'string' && error.message.trim() ? error.message : '서버에 연결하지 못했습니다.';
    // 빈 목록과 다르게, "불러오지 못했다"는 것을 분명히 한다.
    root.append(eventsText('p', `기록을 불러오지 못했습니다: ${message}`, 'events-status events-status-error'));
    return root;
  }

  if (status === 'ok' && Array.isArray(input.data)) {
    // 원본 배열은 건드리지 않고 복사해서 정렬한다.
    const events = input.data.slice().sort((a, b) => new Date(b && b.at).getTime() - new Date(a && a.at).getTime());

    if (events.length === 0) {
      root.append(eventsText('p', '표시할 기록이 없습니다', 'events-status events-status-empty'));
      return root;
    }

    const detail = document.createElement('div');
    detail.className = 'event-detail';
    detail.append(eventsText('p', '목록에서 기록을 선택하면 상세가 여기에 표시됩니다.', 'event-detail-placeholder'));

    const list = document.createElement('ul');
    list.className = 'events-list';

    const rows = events.map((event) => {
      const li = document.createElement('li');
      li.className = 'event-row';
      li.dataset.studentEventId = event.id;
      li.dataset.kind = event.kind;
      li.dataset.appId = typeof event.appId === 'string' ? event.appId : '';
      li.dataset.access = event.state && typeof event.state.access === 'string' ? event.state.access : '';

      const kindLabel = Object.hasOwn(EVENT_KIND_TEXT, event.kind) ? EVENT_KIND_TEXT[event.kind] : event.kind;
      li.append(
        eventsText('span', event.id, 'event-id'),
        eventsText('span', eventTimeText(event.at), 'event-time'),
        eventsText('span', kindLabel, 'event-kind'),
        eventsText('span', eventAppText(event.appId), 'event-app'),
        eventsText('span', typeof event.summary === 'string' ? event.summary : '', 'event-summary'),
      );

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'event-detail-button';
      button.textContent = `${event.id} 상세`;
      button.addEventListener('click', () => renderEventDetail(detail, event));
      li.append(button);

      return li;
    });

    for (const row of rows) list.append(row);

    // 필터 셀렉트 3개: 값은 받은 원래 kind·appId·state.access 값으로 채우고, 배열 안에서만 걸러낸다.
    const filterBar = document.createElement('div');
    filterBar.className = 'events-filters';

    const makeFilter = (labelText, rawValues, toOptionText) => {
      const label = document.createElement('label');
      label.className = 'events-filter';
      label.append(eventsText('span', labelText));
      const select = document.createElement('select');
      const allOption = eventsText('option', '전체', '');
      allOption.value = 'all';
      select.append(allOption);
      for (const value of rawValues) {
        const option = eventsText('option', toOptionText(value), '');
        option.value = value;
        select.append(option);
      }
      label.append(select);
      filterBar.append(label);
      // 기본값은 항상 "전체"(all)여야 필터를 건드리기 전에 모든 행이 보인다.
      select.value = 'all';
      return select;
    };

    const kindValues = [...new Set(rows.map((row) => row.dataset.kind))];
    const appValues = [...new Set(rows.map((row) => row.dataset.appId))];
    const accessValues = [...new Set(rows.map((row) => row.dataset.access))];

    const kindSelect = makeFilter('기록 종류', kindValues, (v) => (Object.hasOwn(EVENT_KIND_TEXT, v) ? `${EVENT_KIND_TEXT[v]}(${v})` : v));
    const appSelect = makeFilter('업무 앱', appValues, (v) => (v ? v : '앱을 확인할 수 없음'));
    const accessSelect = makeFilter('접속 상태', accessValues, (v) => eventStateText(EVENT_ACCESS_TEXT, v));

    const applyFilters = () => {
      const kindValue = kindSelect.value;
      const appValue = appSelect.value;
      const accessValue = accessSelect.value;
      for (const row of rows) {
        const matches = (kindValue === 'all' || row.dataset.kind === kindValue)
          && (appValue === 'all' || row.dataset.appId === appValue)
          && (accessValue === 'all' || row.dataset.access === accessValue);
        row.hidden = !matches;
      }
    };
    kindSelect.addEventListener('change', applyFilters);
    appSelect.addEventListener('change', applyFilters);
    accessSelect.addEventListener('change', applyFilters);

    root.append(filterBar, list, detail);
    return root;
  }

  // 계약에 없는 status 값이거나 ok인데 data가 배열이 아님(예: CONTRACT_MISMATCH 등 깨진 자료):
  // 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다. 이전 목록은 남기지 않는다.
  root.append(eventsText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'events-status'));
  return root;
}

function statusText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

// error.code에 TIMEOUT이 들어 있으면 시간 초과임을 드러내고, 그 외는 일반 실패 문구를 쓴다.
// 다시 시도는 자동으로 하지 않고 위쪽 "다시 불러오기" 버튼을 직접 누르라고 안내한다(공식 예시 문장).
// 한글 받침 유무에 맞는 "을/를"을 고른다(마지막 글자가 한글 음절이 아니면 "를"로 둔다).
function withEulReul(word) {
  const last = word.charCodeAt(word.length - 1);
  if (last >= 0xac00 && last <= 0xd7a3) return (last - 0xac00) % 28 === 0 ? '를' : '을';
  return '를';
}

function statusErrorText(resourceLabel, error) {
  const message = error && typeof error.message === 'string' && error.message.trim() ? error.message : '서버에 연결하지 못했습니다.';
  const isTimeout = error && typeof error.code === 'string' && error.code.includes('TIMEOUT');
  const headline = isTimeout ? `${resourceLabel} 조회 시간 초과` : `${resourceLabel}${withEulReul(resourceLabel)} 불러오지 못했습니다`;
  return `${headline}: ${message} · 다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.`;
}

// 기기 목록: loading/ok(목록 또는 빈 목록 문구)/error를 구분해 섹션 하나로 그린다.
function renderDevicesSection(devices) {
  const section = document.createElement('div');
  section.className = 'status-devices';
  section.append(statusText('h4', '기기', 'status-heading'));

  const resource = devices && typeof devices === 'object' ? devices : {};
  if (resource.status === 'loading') {
    section.append(statusText('p', '불러오는 중', 'status-line status-line-loading'));
  } else if (resource.status === 'error') {
    section.append(statusText('p', statusErrorText('기기 목록', resource.error), 'status-line status-line-error'));
  } else if (resource.status === 'ok' && Array.isArray(resource.data)) {
    if (resource.data.length === 0) {
      section.append(statusText('p', '등록된 기기가 없음', 'status-line status-line-empty'));
    } else {
      const list = document.createElement('ul');
      list.className = 'status-device-list';
      for (const device of resource.data) {
        const label = typeof device?.label === 'string' && device.label ? device.label : (typeof device?.id === 'string' ? device.id : '확인 불가');
        list.append(statusText('li', `${label} — ${eventStateText(DEVICE_STATUS_TEXT, device?.status)}`));
      }
      section.append(list);
    }
  } else {
    section.append(statusText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'status-line'));
  }
  return section;
}

// 세션: 지금 검증된 연결 1개만 온다(과거 세션 전체 목록 아님)는 안내를 항상 함께 둔다.
function renderSessionsSection(sessions) {
  const section = document.createElement('div');
  section.className = 'status-sessions';
  section.append(statusText('h4', '세션', 'status-heading'));
  section.append(statusText('p', '지금 검증된 연결 1개만 보여줍니다. 지난 세션 전체 목록이 아닙니다.', 'status-note'));

  const resource = sessions && typeof sessions === 'object' ? sessions : {};
  if (resource.status === 'loading') {
    section.append(statusText('p', '불러오는 중', 'status-line status-line-loading'));
  } else if (resource.status === 'error') {
    section.append(statusText('p', statusErrorText('세션', resource.error), 'status-line status-line-error'));
  } else if (resource.status === 'ok' && Array.isArray(resource.data)) {
    if (resource.data.length === 0) {
      section.append(statusText('p', '현재 연결 없음', 'status-line status-line-empty'));
    } else {
      const list = document.createElement('ul');
      list.className = 'status-session-list';
      for (const session of resource.data) {
        const id = typeof session?.id === 'string' && session.id ? session.id : '확인 불가';
        list.append(statusText('li', `${id} — ${eventStateText(SESSION_STATUS_TEXT, session?.status)}`));
      }
      section.append(list);
    }
  } else {
    section.append(statusText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'status-line'));
  }
  return section;
}

// 알림: 자료(resource)·안전한 code·message를 항목마다 적고, 비어 있으면 "주의할 알림이 없습니다".
function renderNotificationsSection(notifications) {
  const section = document.createElement('div');
  section.className = 'status-notifications';
  section.append(statusText('h4', '알림', 'status-heading'));

  const items = Array.isArray(notifications) ? notifications : [];
  if (items.length === 0) {
    section.append(statusText('p', '주의할 알림이 없습니다', 'status-line status-line-empty'));
  } else {
    const list = document.createElement('ul');
    list.className = 'status-notification-list';
    for (const item of items) {
      const resource = typeof item?.resource === 'string' && item.resource ? item.resource : '확인 불가';
      const code = typeof item?.code === 'string' && item.code ? item.code : '확인 불가';
      const message = typeof item?.message === 'string' && item.message ? item.message : '';
      list.append(statusText('li', `[${resource}] ${code} — ${message}`));
    }
    section.append(list);
  }
  return section;
}

// 진단 정보: 제공 화면이 조회해 넘겨준 값만 쓰고(/api/diagnostics 직접 호출 없음), 안전한 6개 필드만 보여준다.
// "도움정보 복사" 버튼은 사용자가 누를 때만 그 안전한 값을 클립보드로 복사한다(자동 전송 없음).
function renderDiagnosticsSection(diagnostics) {
  const section = document.createElement('div');
  section.className = 'status-diagnostics';
  section.append(statusText('h4', '도움정보', 'status-heading'));

  const resource = diagnostics && typeof diagnostics === 'object' ? diagnostics : {};
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'status-diagnostics-copy';
  copyButton.textContent = '도움정보 복사';
  copyButton.disabled = true;

  const copyStatus = statusText('p', '', 'status-diagnostics-copy-status');

  if (resource.status === 'idle') {
    // 진단 정보는 제공 화면의 "도움정보 불러오기" 버튼을 눌러야 조회된다(자동 조회 아님). 아직 안 누른 상태.
    section.append(statusText('p', '아직 불러오지 않음: 위 "도움정보 불러오기" 버튼을 눌러 조회하세요.', 'status-line status-line-empty'));
  } else if (resource.status === 'loading') {
    section.append(statusText('p', '불러오는 중', 'status-line status-line-loading'));
  } else if (resource.status === 'error') {
    section.append(statusText('p', statusErrorText('도움정보', resource.error), 'status-line status-line-error'));
  } else if (resource.status === 'ok' && resource.data && typeof resource.data === 'object') {
    const data = resource.data;
    const engine = data.engine && typeof data.engine === 'object' ? data.engine : {};
    // 공식 요구사항: requestId·component·version·checkedAt·engine.mode·engine.code만 보여준다(그 외 필드·ai 토큰류는 쓰지 않음).
    const safe = {
      requestId: typeof data.requestId === 'string' ? data.requestId : '확인 불가',
      component: typeof data.component === 'string' ? data.component : '확인 불가',
      version: typeof data.version === 'string' ? data.version : '확인 불가',
      checkedAt: typeof data.checkedAt === 'string' ? data.checkedAt : '확인 불가',
      engineMode: typeof engine.mode === 'string' ? engine.mode : '확인 불가',
      engineCode: typeof engine.code === 'string' ? engine.code : '확인 불가',
    };
    const dl = document.createElement('dl');
    dl.className = 'status-diagnostics-fields';
    dl.append(
      statusText('dt', 'requestId'), statusText('dd', safe.requestId),
      statusText('dt', 'component'), statusText('dd', safe.component),
      statusText('dt', 'version'), statusText('dd', safe.version),
      statusText('dt', 'checkedAt'), statusText('dd', safe.checkedAt),
      statusText('dt', 'engine.mode'), statusText('dd', safe.engineMode),
      statusText('dt', 'engine.code'), statusText('dd', safe.engineCode),
    );
    section.append(dl);
    copyButton.disabled = false;
    copyButton.addEventListener('click', async () => {
      const text = JSON.stringify(safe, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        copyStatus.textContent = '도움정보를 클립보드에 복사했습니다.';
      } catch {
        copyStatus.textContent = '복사하지 못했습니다. 위 내용을 직접 선택해 복사하세요.';
      }
    });
  } else {
    section.append(statusText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'status-line'));
  }

  // 공식 요구사항(diagnostics_redaction): 이 정보가 도움 요청에 쓰도록 복사하는 것이라는 용도 안내.
  const copyPurpose = statusText('p', '문제 해결을 위해 담당자에게 도움을 요청할 때 복사하는 정보입니다.', 'status-diagnostics-copy-purpose');
  section.append(copyPurpose, copyButton, copyStatus);
  return section;
}

// 16단계 구현: student/extension.mjs → renderStatus. 앞 단계 함수는 그대로 둡니다.
// 입력은 { devices, sessions, notifications, diagnostics, mode }. devices·sessions·diagnostics는
// { status, mode, data?, error? }. mode(전체 연결 모드)는 이 단계 요구사항(상태별 표시, 필수 확인 항목)에
// 없어 화면에 쓰지 않는다.
function renderStatus(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const root = document.createElement('div');
  root.className = 'status-panel';
  root.append(
    renderDevicesSection(safeInput.devices),
    renderSessionsSection(safeInput.sessions),
    renderNotificationsSection(safeInput.notifications),
    renderDiagnosticsSection(safeInput.diagnostics),
  );
  return root;
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
    // 공식 요구사항: 한글 설명 옆에 서버가 준 원래 status 코드도 함께 표시한다.
    const rawDeviceStatus = typeof device?.status === 'string' && device.status ? device.status : '확인 불가';
    identityField(dl, '기기', `${deviceLabel} — ${deviceStatusText} (status: ${rawDeviceStatus})`);
    const sessionStatusText = Object.hasOwn(SESSION_STATUS_TEXT, session?.status) ? SESSION_STATUS_TEXT[session.status] : '확인 불가';
    const rawSessionStatus = typeof session?.status === 'string' && session.status ? session.status : '확인 불가';
    identityField(dl, '세션', `${sessionStatusText} (status: ${rawSessionStatus})`);
    root.append(dl);
    return root;
  }

  // 계약에 없는 status 값: 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다.
  root.append(identityText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'identity-status'));
  return root;
}

// 14단계 구현: student/extension.mjs → renderDecision.
// 입력은 { status, mode, data?, error?, appId }. mode·appId는 이 단계 공식 요구사항(상태별 표시 표,
// 필수 확인 항목)에 없어 화면에 쓰지 않는다(안내에 없는 기능을 추가하지 않기 위함).
function renderDecision(input) {
  const status = input && typeof input === 'object' ? input.status : undefined;
  const root = document.createElement('div');
  root.className = 'decision-panel';

  if (status === 'idle') {
    root.append(decisionText('p', '앱을 골라 접속을 요청하세요', 'decision-status decision-status-idle'));
    return root;
  }

  if (status === 'loading') {
    root.append(decisionText('p', '판정 확인 중', 'decision-status decision-status-loading'));
    return root;
  }

  if (status === 'error') {
    const error = input.error;
    const message = error && typeof error.message === 'string' && error.message.trim() ? error.message : '서버에 연결하지 못했습니다.';
    // 요청 실패는 거부 판정이 아님을 분명히 구분해서 보여준다.
    root.append(decisionText('p', `요청 실패: ${message}`, 'decision-status decision-status-error'));
    root.append(decisionText('p', '요청 실패는 접근 거부 판정이 아닙니다.', 'decision-note'));
    return root;
  }

  if (status === 'ok' && input.data && typeof input.data === 'object') {
    const { decision, reason, checkedAt } = input.data;
    const known = Object.hasOwn(DECISION_TEXT, decision);
    const decisionLabel = known ? DECISION_TEXT[decision] : '확인 불가';
    // 공식 요구사항(unknown-not-allow): 허용된 네 값(allow/deny/challenge/unknown)인지 먼저 확인하고,
    // 그 목록에 없는 값은 받은 문자열을 그대로 보여주지 않고 표시 코드를 unknown으로 정규화한다.
    const rawDecision = known ? decision : 'unknown';
    const decisionClass = known ? `decision-${decision}` : 'decision-unknown';

    root.append(decisionText('p', `${decisionLabel} (${rawDecision})`, `decision-result ${decisionClass}`));

    if (!known || decision === 'unknown') {
      // unknown·계약 밖 값이 허용처럼 보이지 않도록 "허용되지 않음"을 명시한다.
      root.append(decisionText('p', '허용되지 않음: 판정을 확인할 수 없습니다.', 'decision-note decision-note-unknown'));
    } else if (decision === 'challenge') {
      root.append(decisionText('p', '추가 인증이 필요합니다. 이 화면이 인증 절차를 대신 수행하지 않습니다.', 'decision-note'));
    }

    const dl = document.createElement('dl');
    dl.className = 'decision-fields';
    decisionField(dl, '판정 이유', typeof reason === 'string' && reason ? reason : '사유 정보 없음');
    decisionField(dl, '판정 시각', typeof checkedAt === 'string' && checkedAt ? checkedAt : '확인 불가');
    root.append(dl);
    return root;
  }

  // 계약에 없는 status 값: 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다.
  root.append(decisionText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'decision-status'));
  return root;
}

// 17단계: AI 연결 점검(renderAiConnection)과 사건 설명(renderExplanation 기초)을 분리해서 표시한다.
// "연결이 됐다"는 것과 "사건 설명이 실행됐다"는 것은 서로 다른 사실이므로 절대 섞어서 보여주지 않는다.
const AI_AUDIENCE_TEXT = {
  test: '시험 연결 점검(test) · 실제 게이트 수용 아님',
  verified: '앱 권한 확인 후 점검(verified)',
};

// 공식 과제의 오류 구분표(권한 준비 중·인증·접근 제한·사용량/한도·이용 시간·요청 제한/시간 초과/네트워크·취소·모델 없음)를
// 서버가 준 안전한 code 에 매핑한다. 원문 오류나 열쇠는 절대 보여주지 않고, 여기 적힌 안내문만 보여준다.
const AI_ERROR_GUIDE = {
  ON_AI_PROVISIONING_PENDING: '권한 준비 중: 담당자에게 계정 연결과 앱 권한 확인을 요청하세요.',
  WB_CLCO_AUTH_REQUIRED: '인증 실패: 계정 연결을 다시 확인하세요. 계속되면 담당자에게 확인을 요청하세요.',
  WB_CLCO_ACCESS_BLOCKED: '접근 제한: 계정 연결을 다시 확인하세요. 계속되면 담당자에게 확인을 요청하세요.',
  ON_AI_AUTHORIZATION_CHANGED: '접근 제한: 다시 점검하기 전에 담당자에게 현재 권한을 확인하세요.',
  WB_CLCO_COHORT_BUDGET_EXHAUSTED: '반 사용량 소진: 담당자에게 확인을 요청하세요.',
  WB_CLCO_LIMIT_REACHED: '이용 한도 도달: 담당자에게 확인을 요청하세요.',
  WB_CLCO_SESSION_CLOSED: '이용 시간 아님: 이용 시간을 확인하세요.',
  WB_CLCO_RATE_LIMITED: '요청 제한: 잠시 뒤 직접 다시 점검하세요.',
  WB_CLCO_TIMEOUT: '시간 초과: 잠시 뒤 직접 다시 점검하세요.',
  REQUEST_TIMEOUT: '시간 초과: 잠시 뒤 직접 다시 점검하세요.',
  ENGINE_TIMEOUT: '시간 초과: 잠시 뒤 직접 다시 점검하세요.',
  TIMEOUT: '시간 초과: 잠시 뒤 직접 다시 점검하세요.',
  CANCELLED: '취소됨: 이전 결과는 현재 결과가 아닙니다. 다시 점검하려면 버튼을 직접 누르세요.',
  WB_CLCO_CANCELLED: '취소됨: 이전 결과는 현재 결과가 아닙니다. 다시 점검하려면 버튼을 직접 누르세요.',
  REQUEST_CANCELLED: '취소됨: 이전 결과는 현재 결과가 아닙니다. 다시 점검하려면 버튼을 직접 누르세요.',
  MODEL_NOT_CONFIGURED: '쓸 수 있는 모델 없음: 담당자에게 모델 허용 설정 확인을 요청하세요.',
  ON_AI_MODEL_LIST_EMPTY: '쓸 수 있는 모델 없음: 담당자에게 모델 허용 설정 확인을 요청하세요.',
  // 공식 요구사항(ai_timeout_cancel): 제공 app.js의 AI_MESSAGES에는 네트워크 전용 코드가 따로 없고,
  // 네트워크 단절을 포함해 연결·응답을 확인할 수 없는 모든 경우가 이 코드로 안전하게 정규화되어 온다.
  // 그래서 "요청 제한·시간 초과·네트워크" 안내를 이 코드에 매칭하고, 계약에 없는 다른 미래 코드까지
  // 임의로 네트워크 문제라고 단정하지는 않는다(그런 코드는 AI_ERROR_GUIDE_DEFAULT로 남는다).
  AI_REQUEST_UNVERIFIED: '연결 확인 불가(네트워크·응답 포함): 잠시 뒤 직접 다시 점검하세요. 계속되면 담당자에게 확인을 요청하세요.',
};
// 위 표에 없는 code(계약 밖 값 포함)는 추측하지 않고 이 기본 안내로만 보여준다.
const AI_ERROR_GUIDE_DEFAULT = '확인 불가: 담당자에게 확인을 요청하세요.';

function aiConnectionText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function aiConnectionField(dl, label, value) {
  dl.append(aiConnectionText('dt', label), aiConnectionText('dd', value));
}

// 공식 요구사항(ai_manual_recovery): "자동으로 다시 점검하지 않는다"는 사실과 "재점검은 사람이 버튼을
// 직접 눌러야 한다"는 안내를 취소 상태뿐 아니라 idle·성공·일반 오류 화면에도 공통으로 보여준다.
const AI_MANUAL_RECHECK_NOTE = '자동으로 다시 점검하지 않습니다. 필요하면 "현재 API 연결 점검" 버튼을 직접 누르세요.';

function renderAiConnection(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const status = safeInput.status;
  const root = document.createElement('div');
  root.className = 'ai-connection-panel';

  if (status === 'idle') {
    root.append(
      aiConnectionText('p', 'AI 연결 점검 전', 'ai-connection-state ai-connection-idle'),
      aiConnectionText('p', AI_MANUAL_RECHECK_NOTE, 'ai-connection-manual-note'),
    );
    return root;
  }

  if (status === 'loading') {
    root.append(aiConnectionText('p', 'AI 연결 점검 중', 'ai-connection-state ai-connection-loading'));
    return root;
  }

  if (status === 'error') {
    // 공식 요구사항(ai_auth_error/ai_limits/ai_timeout_cancel 등): 안전한 code·message를 그대로 글자로 보여주고,
    // code를 계약 밖 값까지 포함해 분류해서 안내한다. 열쇠·원문 오류 문자열은 쓰지 않는다.
    const error = safeInput.error && typeof safeInput.error === 'object' ? safeInput.error : {};
    const code = typeof error.code === 'string' && error.code ? error.code : '확인불가';
    const message = typeof error.message === 'string' && error.message ? error.message : '오류 내용을 확인할 수 없습니다.';
    const guide = Object.hasOwn(AI_ERROR_GUIDE, code) ? AI_ERROR_GUIDE[code] : AI_ERROR_GUIDE_DEFAULT;
    root.append(
      aiConnectionText('p', `AI 연결 점검 실패 (${code})`, 'ai-connection-state ai-connection-error'),
      aiConnectionText('p', message, 'ai-connection-error-message'),
      aiConnectionText('p', guide, 'ai-connection-error-guide'),
      aiConnectionText('p', AI_MANUAL_RECHECK_NOTE, 'ai-connection-manual-note'),
    );
    return root;
  }

  if (status === 'ok') {
    const data = safeInput.data && typeof safeInput.data === 'object' ? safeInput.data : {};
    const audience = Object.hasOwn(AI_AUDIENCE_TEXT, data.audienceAuthorization) ? data.audienceAuthorization : null;
    if (!audience) {
      // 계약 밖 audienceAuthorization 값: 연결된 것처럼 보이면 안 되므로 확인 불가로만 보여준다.
      root.append(aiConnectionText('p', '확인 불가: 연결 점검 응답 형식을 확인할 수 없습니다.', 'ai-connection-state ai-connection-error'));
      return root;
    }
    const modelCount = Number.isInteger(data.modelCount) ? String(data.modelCount) : '확인 불가';
    const checkedAt = typeof safeInput.checkedAt === 'string' && safeInput.checkedAt ? safeInput.checkedAt : '확인 불가';

    root.append(aiConnectionText('p', AI_AUDIENCE_TEXT[audience], 'ai-connection-state ai-connection-ok'));
    const dl = document.createElement('dl');
    dl.className = 'ai-connection-fields';
    aiConnectionField(dl, '응답 모델 수', modelCount);
    aiConnectionField(dl, '점검 시각', checkedAt);
    root.append(dl);
    // 공식 요구사항: 모델 목록 응답만으로 사건 설명까지 된 것처럼 보이면 안 된다.
    root.append(
      aiConnectionText('p', '이 점검은 연결만 확인했습니다. 사건 설명은 아직 실행하지 않았습니다.', 'ai-connection-note'),
      aiConnectionText('p', AI_MANUAL_RECHECK_NOTE, 'ai-connection-manual-note'),
    );
    return root;
  }

  // 계약에 없는 status 값: 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다.
  root.append(aiConnectionText('p', '확인 불가: 응답 상태를 확인할 수 없습니다.', 'ai-connection-state ai-connection-error'));
  return root;
}

function explanationText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

const EXPLANATION_STATE_LABEL = { access: '접속', session: '세션', device: '기기' };

// data.evidenceIds가 현재 event.evidence와 맞는지, 이미 실행됐다고 답한 설명은 아닌지 확인한다.
// 맞지 않으면 근거를 지어내지 않고 실패로 처리하기 위해 사유 문자열을 돌려준다(문제없으면 null).
function rejectExplanationData(data, event) {
  const evidenceIds = Array.isArray(data.evidenceIds) ? data.evidenceIds : [];
  if (evidenceIds.length === 0) return '근거 ID가 없습니다.';
  const evidenceMap = new Map((Array.isArray(event.evidence) ? event.evidence : []).map((e) => [e.id, e.text]));
  for (const id of evidenceIds) {
    if (!evidenceMap.has(id)) return '근거가 현재 기록과 맞지 않습니다.';
  }
  if (data.executed === true) return 'AI가 이미 실행했다고 답한 설명은 쓸 수 없습니다.';
  return null;
}

function explanationEvidenceList(data, event) {
  const evidenceMap = new Map((Array.isArray(event.evidence) ? event.evidence : []).map((e) => [e.id, e.text]));
  const list = document.createElement('ul');
  list.className = 'explanation-evidence-list';
  for (const id of data.evidenceIds) {
    list.append(explanationText('li', `${id} — ${evidenceMap.get(id)}`));
  }
  return list;
}

function explanationRulesList(event) {
  const rules = Array.isArray(event.rules) ? event.rules : [];
  const list = document.createElement('ul');
  list.className = 'explanation-rules-list';
  if (rules.length === 0) {
    list.append(explanationText('li', '규칙 없음'));
    return list;
  }
  for (const rule of rules) {
    list.append(explanationText('li', `${rule.id} — ${rule.text}`));
  }
  return list;
}

function explanationUnknownStateList(event) {
  const state = event.state && typeof event.state === 'object' ? event.state : {};
  const unknownKeys = Object.keys(EXPLANATION_STATE_LABEL).filter((key) => state[key] === 'unknown');
  const list = document.createElement('ul');
  list.className = 'explanation-unknown-list';
  if (unknownKeys.length === 0) {
    list.append(explanationText('li', '없음'));
    return list;
  }
  for (const key of unknownKeys) {
    list.append(explanationText('li', `${EXPLANATION_STATE_LABEL[key]}: 확인 불가(unknown)`));
  }
  return list;
}

function explanationProposalsBlock(data, event) {
  const proposals = Array.isArray(data.proposals) ? data.proposals : [];
  const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
  if (proposals.length === 0) {
    const reason = supportedActions.length === 0
      ? '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).'
      : 'AI가 제안한 조치가 없습니다.';
    return explanationText('p', reason, 'explanation-proposals-empty');
  }
  const list = document.createElement('ul');
  list.className = 'explanation-proposals-list';
  for (const proposal of proposals) {
    const action = typeof proposal.action === 'string' && proposal.action ? proposal.action : '확인불가';
    const reason = typeof proposal.reason === 'string' && proposal.reason ? proposal.reason : '이유를 확인할 수 없습니다.';
    list.append(explanationText('li', `${action} — ${reason} (사람 확인이 필요하며 실행되지 않았습니다)`));
  }
  return list;
}

// 18단계: AI 설명을 선택한 사건의 근거·규칙·현재 상태와 함께 보여준다. 근거가 없으면 지어내지 않는다.
function renderExplanation(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const event = safeInput.event && typeof safeInput.event === 'object' ? safeInput.event : null;
  const explanation = safeInput.explanation && typeof safeInput.explanation === 'object' ? safeInput.explanation : {};
  const root = document.createElement('div');
  root.className = 'explanation-panel';

  // event가 null이어도 error는 먼저 보여준다. 실패 화면에는 data-student-explanation-event를 붙이지 않는다.
  if (explanation.status === 'error') {
    const error = explanation.error && typeof explanation.error === 'object' ? explanation.error : {};
    const code = typeof error.code === 'string' && error.code ? error.code : '확인불가';
    const message = typeof error.message === 'string' && error.message ? error.message : '오류 내용을 확인할 수 없습니다.';
    root.append(
      explanationText('p', `AI 설명 실패 (${code}): ${message}`, 'explanation-state explanation-error'),
      explanationText('p', '기록은 그대로입니다.', 'explanation-note'),
    );
    return root;
  }

  if (!event) {
    root.append(explanationText('p', '보안 기록에서 기록을 먼저 고르세요.', 'explanation-state explanation-idle'));
    return root;
  }

  if (explanation.status === 'loading') {
    root.append(explanationText('p', '설명 요청 중', 'explanation-state explanation-loading'));
    return root;
  }

  if (explanation.status === 'ok') {
    const data = explanation.data && typeof explanation.data === 'object' ? explanation.data : {};
    const rejection = rejectExplanationData(data, event);
    if (rejection) {
      // 근거가 맞지 않거나 이미 실행됐다고 답한 설명은 성공으로 보여주지 않는다. data-student-explanation-event도 붙이지 않는다.
      root.append(
        explanationText('p', `AI 설명을 표시할 수 없습니다: ${rejection}`, 'explanation-state explanation-error'),
        explanationText('p', '기록은 그대로입니다.', 'explanation-note'),
      );
      return root;
    }
    // 공식 요구사항: 근거·규칙·상태까지 검사를 통과한 성공 설명에만 data-student-explanation-event를 붙인다.
    root.dataset.studentExplanationEvent = event.id;
    root.append(
      explanationText('h4', 'AI 설명(참고용)', 'explanation-title'),
      explanationText('p', `사건 ID: ${event.id}`, 'explanation-event-id'),
      explanationText('p', typeof data.summary === 'string' && data.summary ? data.summary : '확인 불가: 설명 요약을 확인할 수 없습니다.', 'explanation-summary'),
      explanationText('h5', '인용한 근거', 'explanation-subtitle'),
      explanationEvidenceList(data, event),
      explanationText('h5', '규칙', 'explanation-subtitle'),
      explanationRulesList(event),
      explanationText('h5', '확인 불가 상태', 'explanation-subtitle'),
      explanationUnknownStateList(event),
      explanationText('h5', '제안된 조치', 'explanation-subtitle'),
      explanationProposalsBlock(data, event),
    );
    return root;
  }

  // 계약에 없는 상태 조합(예: event는 있는데 아직 idle)은 추측해서 새 화면을 만들지 않고 안전하게만 보여준다.
  root.append(explanationText('p', '아직 이 기록에 대한 AI 설명을 요청하지 않았습니다.', 'explanation-state explanation-idle'));
  return root;
}

function actionText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

// 현재 사건·근거 ID·조치·실제 대상·요청/영수증 ID를 "있는 것만" 글자로 나열한다. 없으면 null.
function actionIdentifiersList(input) {
  const items = [];
  const event = input.event && typeof input.event === 'object' ? input.event : null;
  if (event && typeof event.id === 'string' && event.id) items.push(`사건 ID: ${event.id}`);
  if (event && Array.isArray(event.evidence) && event.evidence.length > 0) {
    const ids = event.evidence.map((e) => e && e.id).filter((id) => typeof id === 'string' && id);
    if (ids.length > 0) items.push(`근거 ID: ${ids.join(', ')}`);
  }
  if (typeof input.actionId === 'string' && input.actionId) items.push(`조치: ${input.actionId}`);
  const target = input.target && typeof input.target === 'object' ? input.target : null;
  if (target && typeof target.id === 'string' && target.id) {
    items.push(`실제 대상: ${target.id}${Number.isSafeInteger(target.generation) ? ` · 세대 ${target.generation}` : ''}`);
  }
  const receipt = input.receipt && typeof input.receipt === 'object' ? input.receipt : null;
  if (receipt) {
    if (typeof receipt.requestId === 'string' && receipt.requestId) items.push(`요청 ID: ${receipt.requestId}`);
    if (typeof receipt.receiptId === 'string' && receipt.receiptId) items.push(`영수증 ID: ${receipt.receiptId}`);
    if (Number.isSafeInteger(receipt.version)) items.push(`버전: ${receipt.version}`);
  }
  if (items.length === 0) return null;
  const list = document.createElement('ul');
  list.className = 'action-identifiers-list';
  for (const text of items) list.append(actionText('li', text));
  return list;
}

// 19단계: AI 제안·사람 확인·서버 접수(ACK)·실제 효과 확인을 구분해서 보여준다. ACK는 효과가 아니고,
// succeeded도 observation.effectApplied===true일 때만 효과 확인으로 인정한다. 조치 버튼은 만들지 않는다.
function renderAction(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const status = typeof safeInput.status === 'string' ? safeInput.status : null;
  const root = document.createElement('div');
  root.className = 'action-panel';

  // "성공적으로 그린" 바깥 요소에 현재 사건·요청 ID를 붙인다(있을 때만, 상태와 무관하게 공식 계약대로).
  const event = safeInput.event && typeof safeInput.event === 'object' ? safeInput.event : null;
  if (event && typeof event.id === 'string' && event.id) root.dataset.studentActionEvent = event.id;
  const receipt = safeInput.receipt && typeof safeInput.receipt === 'object' ? safeInput.receipt : null;
  if (receipt && typeof receipt.requestId === 'string' && receipt.requestId) root.dataset.studentActionRequest = receipt.requestId;

  const identifiers = actionIdentifiersList(safeInput);
  function finish(stateText, stateClass, extraNodes) {
    root.append(actionText('p', stateText, `action-state ${stateClass}`));
    if (identifiers) root.append(identifiers);
    if (Array.isArray(extraNodes)) for (const node of extraNodes) if (node) root.append(node);
    return root;
  }

  if (status === 'error') {
    const error = safeInput.error && typeof safeInput.error === 'object' ? safeInput.error : {};
    const code = typeof error.code === 'string' && error.code ? error.code : '확인불가';
    const message = typeof error.message === 'string' && error.message ? error.message : '오류 내용을 확인할 수 없습니다.';
    return finish(`요청이 처리되지 않았습니다 (${code}): ${message}`, 'action-error');
  }

  if (status === 'idle') {
    return finish('아직 미실행', 'action-idle');
  }

  if (status === 'loading') {
    return finish('조치 준비 또는 결과 조회 중(loading) · 아직 결과가 아닙니다.', 'action-loading');
  }

  if (status === 'prepared') {
    const expiryText = typeof safeInput.confirmationExpiresAt === 'string' && safeInput.confirmationExpiresAt
      ? `사람 확인 기한: ${safeInput.confirmationExpiresAt}`
      : '사람 확인 기한을 확인할 수 없습니다.';
    return finish('준비됨 · 미실행(prepared)', 'action-prepared', [
      actionText('p', expiryText, 'action-expiry'),
      actionText('p', '진행하려면 화면의 "대상과 조치를 확인했으며 집행합니다" 버튼을, 그만두려면 "조치 화면 취소" 버튼을 쓰세요.', 'action-note'),
    ]);
  }

  if (status === 'executing') {
    return finish('서버에 전달 중(executing) · 결과가 아직 확인되지 않았습니다.', 'action-executing');
  }

  if (status === 'pending') {
    return finish('서버 접수·처리 중(pending) · 서버가 받았다는 것(ACK)은 효과가 아닙니다.', 'action-pending', [
      actionText('p', '결과를 확인하려면 "연동 시스템 결과만 재조회" 버튼을 쓰세요.', 'action-note'),
    ]);
  }

  if (status === 'succeeded') {
    const observation = safeInput.observation && typeof safeInput.observation === 'object' ? safeInput.observation : null;
    if (observation && observation.effectApplied === true && typeof observation.observedAt === 'string' && observation.observedAt) {
      const receiptId = receipt && typeof receipt.receiptId === 'string' && receipt.receiptId ? receipt.receiptId : null;
      return finish('효과 확인(succeeded)', 'action-succeeded', [
        actionText('p', `관측 시각: ${observation.observedAt}`, 'action-observed-at'),
        actionText('p', 'effectApplied: true', 'action-effect-applied'),
        receiptId ? actionText('p', `영수증 ID: ${receiptId}`, 'action-receipt-id') : null,
      ]);
    }
    // 서버 상태가 succeeded여도 effectApplied가 true가 아니면 성공으로 보여주지 않고 결과 불명으로 처리한다.
    return finish('결과 불명(unknown) · 효과 없음으로도 성공으로도 판단하지 마세요. 결과를 다시 조회하세요.', 'action-unknown', [
      actionText('p', '"연동 시스템 결과만 재조회" 버튼으로 결과를 다시 확인하세요.', 'action-note'),
    ]);
  }

  if (status === 'denied' || status === 'failed') {
    const label = status === 'denied' ? '연동 시스템이 거절했습니다(denied)' : '연동 시스템 처리가 실패했습니다(failed)';
    const message = typeof safeInput.message === 'string' && safeInput.message ? safeInput.message : '사유를 확인할 수 없습니다.';
    return finish(`${label}: ${message}`, 'action-denied-failed');
  }

  if (status === 'unknown') {
    return finish('결과 불명(unknown) · 효과 없음으로도 성공으로도 판단하지 마세요. 결과를 다시 조회하세요.', 'action-unknown', [
      actionText('p', '"연동 시스템 결과만 재조회" 버튼으로 결과를 다시 확인하세요.', 'action-note'),
    ]);
  }

  if (status === 'expired') {
    return finish('사람 확인 기한이 지났습니다(expired) · 이번 준비로는 집행할 수 없습니다. 다시 준비하세요.', 'action-expired', [
      actionText('p', '"조치 화면 취소" 버튼으로 정리한 뒤, AI 제안에서 조치를 다시 준비하세요.', 'action-note'),
    ]);
  }

  // 계약에 없는 status 값: 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다.
  return finish('확인 불가: 조치 상태를 확인할 수 없습니다.', 'action-error');
}

function vulnText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

const SCAN_STATUS_TEXT = {
  complete: '모두 조회(complete)',
  partial: '일부 조회 실패(partial)',
  not_checked: '아직 조회 안 함(not_checked)',
  not_configured: '조회 준비 미완료(not_configured)',
  unverifiable: 'lock 파일 확인 불가(unverifiable)',
};

const PACKAGE_STATUS_TEXT = {
  known_vulnerabilities: '알려진 취약점 있음(known_vulnerabilities)',
  none_found: '알려진 취약점 없음(none_found)',
};

// 패키지 한 줄: 받은 name·version·status·source·checkedAt과, 있으면 취약점 id·modified를 그대로 보여준다.
// 조회 실패를 "취약점 없음"으로 보이게 하지 않는다.
function vulnPackageRow(pkg) {
  const row = document.createElement('li');
  row.className = 'vulnerability-package';
  row.dataset.studentPackageName = pkg.name;
  row.dataset.studentPackageVersion = pkg.version;
  const vulnerabilities = Array.isArray(pkg.vulnerabilities) ? pkg.vulnerabilities : [];
  let statusLabel;
  if (pkg.status === 'unverifiable') {
    // unverifiable인데 이미 받은 취약점이 있으면 지우지 않고, 일부만 확인됐고 전체 조회는 확인 불가라는 걸 알린다.
    statusLabel = vulnerabilities.length > 0
      ? '일부 확인 · 전체 조회 확인 불가(unverifiable)'
      : '조회 확인 불가(unverifiable)';
  } else {
    statusLabel = PACKAGE_STATUS_TEXT[pkg.status] || `확인 불가(${pkg.status})`;
  }
  row.append(
    vulnText('p', `${pkg.name}@${pkg.version} — ${statusLabel}`, 'vulnerability-package-head'),
    vulnText('p', `출처: ${typeof pkg.source === 'string' && pkg.source ? pkg.source : '확인 불가'} · 확인 시각: ${typeof pkg.checkedAt === 'string' && pkg.checkedAt ? pkg.checkedAt : '확인 불가'}`, 'vulnerability-package-meta'),
  );
  if (vulnerabilities.length > 0) {
    const list = document.createElement('ul');
    list.className = 'vulnerability-findings-list';
    for (const finding of vulnerabilities) {
      if (finding && typeof finding.id === 'string' && finding.id) {
        list.append(vulnText('li', `${finding.id} — 수정 시각 ${typeof finding.modified === 'string' && finding.modified ? finding.modified : '확인 불가'}`));
      }
    }
    row.append(list);
  }
  return row;
}

// 20단계: 설치된 정확한 패키지 버전과 OSV 취약점 조회 결과를, 출처·확인 시각·실패·미조회를 구분해서 보여준다.
function renderVulnerabilities(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const status = typeof safeInput.status === 'string' ? safeInput.status : null;
  const root = document.createElement('div');
  root.className = 'vulnerabilities-panel';

  if (status === 'idle') {
    root.append(vulnText('p', '조회 전', 'vulnerabilities-state vulnerabilities-idle'));
    return root;
  }

  if (status === 'loading') {
    // 조회 중에는 이전 표를 현재 결과처럼 남기지 않는다(함수가 매번 입력만으로 새로 그림).
    root.append(vulnText('p', '조회 중', 'vulnerabilities-state vulnerabilities-loading'));
    return root;
  }

  if (status === 'error') {
    const error = safeInput.error && typeof safeInput.error === 'object' ? safeInput.error : {};
    const code = typeof error.code === 'string' && error.code ? error.code : '확인불가';
    const message = typeof error.message === 'string' && error.message ? error.message : '오류 내용을 확인할 수 없습니다.';
    // 오류일 때도 이전 표를 남기지 않는다.
    root.append(
      vulnText('p', `조회 실패 (${code}): ${message}`, 'vulnerabilities-state vulnerabilities-error'),
      vulnText('p', '이전 결과는 현재 조회 결과가 아닙니다.', 'vulnerabilities-note'),
    );
    return root;
  }

  if (status === 'ok') {
    const data = safeInput.data && typeof safeInput.data === 'object' ? safeInput.data : null;
    if (!data || typeof data.status !== 'string') {
      root.append(vulnText('p', '확인 불가: 조회 결과 형식을 확인할 수 없습니다.', 'vulnerabilities-state vulnerabilities-error'));
      return root;
    }
    const scanLabel = SCAN_STATUS_TEXT[data.status] || `확인 불가(${data.status})`;
    root.append(vulnText('p', scanLabel, 'vulnerabilities-state vulnerabilities-ok'));
    // 전달된 경우에만 lockfileVersion·lockfileHash·checkedAt을 보여준다(설정·확인 불가일 때는 없을 수 있음).
    if (data.lockfileVersion !== undefined && data.lockfileVersion !== null) {
      root.append(vulnText('p', `잠금 파일 버전: ${data.lockfileVersion}`, 'vulnerabilities-lockfile'));
    }
    if (typeof data.lockfileHash === 'string' && data.lockfileHash) {
      root.append(vulnText('p', `잠금 파일 해시: ${data.lockfileHash}`, 'vulnerabilities-lockfile'));
    }
    if (typeof data.checkedAt === 'string' && data.checkedAt) {
      root.append(vulnText('p', `조회 시각: ${data.checkedAt}`, 'vulnerabilities-checked-at'));
    }
    const packages = Array.isArray(data.packages) ? data.packages : [];
    if (packages.length === 0) {
      root.append(vulnText('p', '표시할 설치 패키지가 없습니다.', 'vulnerabilities-empty'));
    } else {
      const list = document.createElement('ul');
      list.className = 'vulnerabilities-package-list';
      for (const pkg of packages) {
        if (pkg && typeof pkg === 'object' && typeof pkg.name === 'string' && pkg.name && typeof pkg.version === 'string' && pkg.version) {
          list.append(vulnPackageRow(pkg));
        }
      }
      root.append(list);
    }
    return root;
  }

  // 계약에 없는 status 값: 추측해서 새 상태를 만들지 않고 확인 불가로만 보여준다.
  root.append(vulnText('p', '확인 불가: 조회 상태를 확인할 수 없습니다.', 'vulnerabilities-state vulnerabilities-error'));
  return root;
}

// 2일차(마지막 총공세) 구현: 내 PC 점검. 앞 단계 함수는 그대로 두고 renderStatus 아래에 구역 하나를 덧붙인다.
// - 측정은 제공된 /api/pc/status 조회를 그대로 쓴다(CPU·메모리·디스크를 다시 측정하지 않는다). 내가 더한 것은 "최근 조회 비교" 한 가지다.
// - 「내 PC 점검」은 CPU 사용률·메모리 사용량·디스크 남은 공간 세 가지만 다룬다.
// - 3일차(연결·기록): 바로 아래 「연결과 기록 (읽기만 함)」 구역이 같은 조회 결과에서 네트워크·방화벽·Windows 경고·오류 건수를 읽기만 해서 보여 준다.
//   방화벽·보안 설정은 읽기만 하고 바꾸지 않는다. 못 읽은 항목은 '확인 불가'와 이유로 쓴다. SDP 연결 상태는 PC 조회 결과와 따로 보여 준다.
// - 제공 앱이 넘겨 주는 api.get('/api/pc/status')만 쓴다(직접 fetch·새 주소·저장소 사용 없음).
// - 사용자가 버튼을 누를 때만 한 번 읽는다. 그리기나 onChange에서 읽지 않고 자동으로 되풀이하지 않는다.
// - 값이 없거나 못 읽은 항목은 0이나 정상이 아니라 "확인 불가"와 이유로 보여 준다. 안전·정상 판정은 하지 않는다.
// - 최근 조회 기록은 이 화면의 메모리에만 두며 새로고침하면 사라진다(브라우저 저장소를 쓰지 않는다).
const PC_PATH = '/api/pc/status';
const PC_SCHEMA = 'aleph.on.pc-status.v1';
const PC_MAX_AGE_MS = 60000;
const PC_HISTORY_LIMIT = 5;
const PC_ITEM_LABELS = ['CPU 사용률', '메모리 사용량', '디스크 남은 공간'];
const PC_REASON_TEXT = {
  permission_denied: '권한 부족',
  query_failed: '조회 실패',
  timeout: '시간 초과',
  unsupported: '이 PC에서는 지원하지 않음',
  cancelled: '취소됨',
  invalid_response: '응답 형식을 확인할 수 없음',
  invalid_sample: '측정값을 확인할 수 없음',
};

function pcText(tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function pcIsNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function pcIsCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

// 서버가 준 단위는 바이트다. Windows가 쓰는 1024 기준(GiB)으로 계산하고 화면에도 그렇게 적는다.
function pcGb(bytes) {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function pcKst(iso) {
  const ms = typeof iso === 'string' ? Date.parse(iso) : NaN;
  return Number.isFinite(ms) ? `${new Date(ms).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (한국 시간)` : '시각 확인 불가';
}

// 한 항목을 읽는다. 읽을 수 있으면 { ok: true, text, value }, 아니면 { ok: false, text: '확인 불가 (이유)' }.
function pcUnknown(metric) {
  const reason = metric && typeof metric.reason === 'string' ? (PC_REASON_TEXT[metric.reason] || metric.reason) : '응답에 값이 없음';
  return { ok: false, text: `확인 불가 (${reason})`, value: null };
}

function pcReadCpu(metric) {
  if (metric && metric.state === 'ok' && pcIsNumber(metric.usagePercent) && metric.usagePercent <= 100) {
    return { ok: true, text: `${metric.usagePercent.toFixed(1)}% 사용 (200ms 표본 1회)`, value: metric.usagePercent };
  }
  return pcUnknown(metric);
}

function pcReadMemory(metric) {
  if (metric && metric.state === 'ok' && pcIsNumber(metric.usedBytes) && pcIsNumber(metric.totalBytes) && metric.totalBytes > 0 && metric.usedBytes <= metric.totalBytes) {
    const percent = (metric.usedBytes / metric.totalBytes) * 100;
    return { ok: true, text: `${pcGb(metric.usedBytes)} / ${pcGb(metric.totalBytes)} 사용 (${percent.toFixed(1)}%)`, value: percent };
  }
  return pcUnknown(metric);
}

function pcReadDisk(metric) {
  if (metric && metric.state === 'ok' && pcIsNumber(metric.freeBytes) && pcIsNumber(metric.totalBytes) && metric.totalBytes > 0 && metric.freeBytes <= metric.totalBytes) {
    return { ok: true, text: `${pcGb(metric.freeBytes)} 여유 / ${pcGb(metric.totalBytes)} (앱이 있는 드라이브)`, value: metric.freeBytes };
  }
  return pcUnknown(metric);
}

function pcReadNetwork(metric) {
  if (metric && metric.state === 'ok' && pcIsCount(metric.interfaceCount) && pcIsCount(metric.ipv4Count)) {
    const none = metric.interfaceCount === 0 ? ' · 확인된 외부 인터페이스가 없음' : '';
    return { ok: true, text: `외부 네트워크 인터페이스 ${metric.interfaceCount}개 · IPv4 구성 ${metric.ipv4Count}개${none} (이 PC의 로컬 구성 요약이며 인터넷 접속·유선/무선 여부는 확인하지 않음)`, value: null };
  }
  return pcUnknown(metric);
}

function pcReadFirewall(metric) {
  const profiles = metric && metric.state === 'ok' && Array.isArray(metric.profiles) ? metric.profiles : null;
  if (profiles && profiles.length === 3 && profiles.every((p) => p && typeof p.name === 'string' && typeof p.enabled === 'boolean')) {
    const off = profiles.filter((p) => !p.enabled).map((p) => p.name);
    const head = off.length ? `꺼진 프로필: ${off.join(', ')}` : 'Domain·Private·Public 모두 켜짐';
    return { ok: true, text: `${head} (읽기만 함 · 설정을 바꾸지 않음 · 안전 판정이 아님)`, value: null };
  }
  return pcUnknown(metric);
}

function pcReadEvents(metric) {
  if (metric && metric.state === 'ok' && pcIsCount(metric.warningCount) && pcIsCount(metric.errorCount) && typeof metric.truncated === 'boolean') {
    const partial = metric.truncated ? ' · 최대 5,000건까지만 집계한 일부 결과' : '';
    return { ok: true, text: `최근 24시간 System·Application 경고 ${metric.warningCount}건 · 오류 ${metric.errorCount}건${partial} (침해·공격 탐지 결과가 아님)`, value: null };
  }
  return pcUnknown(metric);
}

// SDP 서버 연결 상태는 PC 조회와 별개다. 서버가 알려 준 모드(input.mode)만 근거로 쓰고, 알 수 없으면 확인 불가로 둔다.
function pcSdpState(mode) {
  if (mode === 'disconnected') return { text: 'SDP 미연결', note: '서버가 연결 어댑터 없이 실행 중이라고 알려 줌(mode=disconnected). 위 PC 조회 결과와는 별개입니다.' };
  if (mode === 'demo') return { text: 'SDP 미연결 (예제 데이터를 보는 중)', note: '서버가 예제(demo) 모드라고 알려 줌. 실제 SDP 서버에 연결된 것이 아닙니다.' };
  if (mode === 'connected') return { text: 'SDP 연결 모드로 응답함', note: '서버가 연결 모드(mode=connected)라고 알려 준 것이며, 이 화면이 실제 연결 성공을 확인한 것은 아닙니다.' };
  return { text: '확인 불가 (서버 연결 모드를 알 수 없음)', note: '기본 조회가 아직 끝나지 않았거나 응답이 서로 달라 연결 여부를 판단하지 않았습니다. 미연결로 단정하지 않습니다.' };
}

const PC_STATUS_WORD = { idle: '아직 조회하지 않음', loading: '조회 중', failed: '조회 실패', unsupported: '지원 없음', stale: '오래됨', unverifiable: '응답 형식 확인 불가' };

// 조회 결과를 상태 하나로 나눈다. 응답이 와도 모양이 맞지 않으면 확인 불가로 둔다.
function pcClassify(result, now) {
  if (!result || result.ok !== true) {
    const error = result && result.error && typeof result.error === 'object' ? result.error : {};
    const code = typeof error.code === 'string' ? error.code : 'UNKNOWN_ERROR';
    if (code === 'NOT_ALLOWED') return { status: 'unsupported' };
    return { status: 'failed', code, message: typeof error.message === 'string' ? error.message : '' };
  }
  const data = result.data;
  const measured = data && typeof data.measuredAt === 'string' ? Date.parse(data.measuredAt) : NaN;
  if (!data || data.schema !== PC_SCHEMA || data.source !== 'local-pc' || !Number.isFinite(measured) || !data.metrics || typeof data.metrics !== 'object') {
    return { status: 'unverifiable' };
  }
  if (Math.abs(now - measured) > PC_MAX_AGE_MS) return { status: 'stale', measuredAt: data.measuredAt };
  const m = data.metrics;
  const items = [pcReadCpu(m.cpu), pcReadMemory(m.memory), pcReadDisk(m.disk)];
  const links = [pcReadNetwork(m.network), pcReadFirewall(m.firewall), pcReadEvents(m.events)];
  return { status: 'ok', measuredAt: data.measuredAt, items, links };
}

function pcSigned(value, unit) {
  // 화면에 보이는 소수 첫째 자리 기준으로 0이면 부호 없이 ±0.0으로 쓴다(-0.0 같은 표시를 막는다).
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : '±';
  return `${sign}${Math.abs(rounded).toFixed(1)}${unit}`;
}

// 직전 조회와 비교한다. 둘 중 하나라도 값이 없으면 숫자를 만들지 않고 비교 불가로 쓴다.
function pcCompareText(previous, latest) {
  const parts = [];
  const cpu = previous.items[0].value !== null && latest.items[0].value !== null ? pcSigned(latest.items[0].value - previous.items[0].value, '%p') : '비교 불가';
  const memory = previous.items[1].value !== null && latest.items[1].value !== null ? pcSigned(latest.items[1].value - previous.items[1].value, '%p') : '비교 불가';
  const disk = previous.items[2].value !== null && latest.items[2].value !== null ? pcSigned((latest.items[2].value - previous.items[2].value) / 1024 ** 3, ' GB') : '비교 불가';
  parts.push(`CPU ${cpu}`, `메모리 사용률 ${memory}`, `디스크 여유 ${disk}`);
  return `직전 조회와 비교: ${parts.join(' · ')}`;
}

function pcHistoryRowText(entry) {
  const cpu = entry.items[0].ok ? `${entry.items[0].value.toFixed(1)}%` : '확인 불가';
  const memory = entry.items[1].ok ? `${entry.items[1].value.toFixed(1)}%` : '확인 불가';
  const disk = entry.items[2].ok ? pcGb(entry.items[2].value) : '확인 불가';
  return `${pcKst(entry.measuredAt)} · CPU ${cpu} · 메모리 사용률 ${memory} · 디스크 여유 ${disk}`;
}

// 4일차(화면 다듬기): 「내 PC 점검」을 「학생 상태·알림 표시」의 맨 위로 올리고 핵심 3가지(① 내 PC 상태 ② 최근 기록 ③ 변화)를 먼저 보여 준다.
// 제공 CSS는 고치지 않는다. 제공 스타일에 이미 있는 이름(btn, state, state-loading, state-empty, state-error, kv, plain-list, muted)과 제목 태그(h3)만 쓴다.
const PC_BAR_WIDTH = 20;

// 구역 사이를 가르는 장식 선(제공 스타일의 기본 hr).
function pcDivider() {
  const line = document.createElement('hr');
  line.setAttribute('aria-hidden', 'true');
  return line;
}

function pcClock(iso) {
  const ms = typeof iso === 'string' ? Date.parse(iso) : NaN;
  return Number.isFinite(ms) ? new Date(ms).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' }) : '시각 확인 불가';
}

// 0~100 사이 값을 글자 막대로 그린다. 값이 없으면 막대를 만들지 않는다(호출하는 쪽에서 '확인 불가'로 쓴다).
function pcBar(percent) {
  const filled = Math.max(0, Math.min(PC_BAR_WIDTH, Math.round((percent / 100) * PC_BAR_WIDTH)));
  return '█'.repeat(filled) + '░'.repeat(PC_BAR_WIDTH - filled);
}

function pcBarRow(entry) {
  const cpu = entry.items[0].ok ? `CPU ${pcBar(entry.items[0].value)} ${entry.items[0].value.toFixed(1)}%` : 'CPU 확인 불가';
  const memory = entry.items[1].ok ? `메모리 ${pcBar(entry.items[1].value)} ${entry.items[1].value.toFixed(1)}%` : '메모리 확인 불가';
  const disk = entry.items[2].ok ? `디스크 여유 ${pcGb(entry.items[2].value)}` : '디스크 확인 불가';
  return `${pcClock(entry.measuredAt)} · ${cpu} · ${memory} · ${disk}`;
}

// 조회가 안 됐을 때 "무엇이 안 됐는지"와 "다음에 할 일"을 정한다. 원인을 모르면 모른다고 쓴다.
function pcFailureGuide(pc) {
  if (pc.status === 'unsupported') {
    return {
      title: '이 앱 판에서는 학생 코드의 PC 조회를 쓸 수 없습니다',
      what: '서버가 학생 코드의 PC 조회(NOT_ALLOWED)를 허용하지 않았습니다. 이번에 읽은 값은 없습니다.',
      steps: ['앱 폴더의 package.json에서 version이 0.2.21인지 확인합니다.', '위쪽 제공 카드 「내 PC 상태」의 「내 PC 확인」은 따로 쓸 수 있습니다.', '버전을 맞춘 뒤 「다시 조회」를 누릅니다.'],
    };
  }
  if (pc.status === 'unverifiable') {
    return {
      title: '응답은 왔지만 형식을 확인하지 못했습니다',
      what: '서버가 준 응답이 약속한 모양(aleph.on.pc-status.v1)과 달라서 값을 보여 주지 않습니다. 정상으로 간주하지 않았습니다.',
      steps: ['「다시 조회」를 한 번 더 누릅니다.', '같은 결과가 반복되면 앱 서버 창에 오류가 찍혔는지 확인합니다.', '앱 폴더가 0.2.21인지 package.json으로 확인합니다.'],
    };
  }
  if (pc.status === 'stale') {
    return {
      title: '측정 시각이 너무 오래된 값입니다',
      what: `응답의 측정 시각(${pcKst(pc.measuredAt)})이 60초보다 오래되어 현재 값으로 쓰지 않습니다.`,
      steps: ['「다시 조회」를 눌러 새로 읽습니다.', '계속 오래됨으로 나오면 PC의 시계와 앱 서버 창 상태를 확인합니다.'],
    };
  }
  const code = typeof pc.code === 'string' ? pc.code : 'UNKNOWN_ERROR';
  const detail = `(${code}${pc.message ? ` · ${pc.message}` : ''})`;
  if (code === 'NETWORK_ERROR' || code === 'CLIENT_ERROR') {
    return {
      title: '앱 서버에 연결하지 못했습니다',
      what: `이 화면이 앱 서버에서 PC 값을 받아 오지 못했습니다 ${detail}. 7개 항목(CPU·메모리·디스크·네트워크·방화벽·Windows 경고·오류) 모두 이번에는 읽지 못했습니다.`,
      steps: ['앱을 켠 CMD 창이 아직 열려 있는지 확인합니다.', '꺼져 있으면 on-client 폴더에서 npm start를 다시 실행합니다.', '켜진 것을 확인한 뒤 이 화면에서 「다시 조회」를 누릅니다.'],
    };
  }
  if (code === 'TIMEOUT') {
    return {
      title: '서버가 제때 응답하지 않았습니다',
      what: `PC 값을 요청했지만 정해진 시간 안에 응답이 오지 않았습니다 ${detail}. 이번에 읽은 값은 없습니다.`,
      steps: ['앱을 켠 CMD 창이 멈춰 있지 않은지 확인합니다.', '잠시 뒤 「다시 조회」를 한 번 누릅니다.', '계속 같으면 앱을 껐다가 on-client 폴더에서 npm start로 다시 켭니다.'],
    };
  }
  if (code === 'INVALID_RESPONSE') {
    return {
      title: '서버 응답을 읽을 수 없었습니다',
      what: `서버가 보낸 내용이 약속한 형식이 아니어서 값을 읽지 못했습니다 ${detail}. 정상으로 간주하지 않았습니다.`,
      steps: ['「다시 조회」를 한 번 더 누릅니다.', '같은 결과가 반복되면 앱을 켠 CMD 창에 오류가 찍혔는지 확인합니다.', '앱 폴더가 0.2.21인지 package.json으로 확인합니다.'],
    };
  }
  return {
    title: 'PC 값을 불러오지 못했습니다',
    what: `서버가 오류로 응답했거나 원인을 알 수 없습니다 ${detail}. 이번에 읽은 값은 없습니다.`,
    steps: ['앱을 켠 CMD 창에 오류 메시지가 찍혔는지 확인합니다.', '「다시 조회」를 한 번 더 누릅니다.', '같은 오류가 반복되면 위 코드를 적어 두고 앱을 껐다가 npm start로 다시 켭니다.'],
  };
}

function pcErrorScreen(pc, hasHistory) {
  const guide = pcFailureGuide(pc);
  const box = document.createElement('div');
  box.className = 'state state-error status-pc-error';
  box.setAttribute('role', 'alert');
  box.append(pcText('strong', guide.title));
  box.append(pcText('p', `무엇이 안 됐나: ${guide.what}`));
  box.append(pcText('p', hasHistory ? '아래 최근 기록은 이전에 성공한 조회입니다. 이번 값이 아닙니다.' : '아직 성공한 조회가 없어서 아래 기록은 비어 있습니다.'));
  box.append(pcText('p', '다음에 할 일:'));
  const steps = document.createElement('ol');
  guide.steps.forEach((step) => steps.append(pcText('li', step)));
  box.append(steps);
  return box;
}

// 버튼과 조회 상태 한 줄(또는 오류 화면)을 만든다. 읽는 동안에는 버튼을 잠시 막고 기다리는 중임을 보여 준다.
function pcStatusArea(pc, onProbe, history) {
  const area = document.createElement('div');
  area.className = 'status-pc-check-area';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn status-pc-check-button';
  button.dataset.pcProbe = '1';
  button.textContent = pc.status === 'loading' ? '읽는 중…' : pc.status === 'idle' ? 'PC 값 조회' : '다시 조회';
  button.disabled = pc.status === 'loading';
  button.addEventListener('click', onProbe);
  area.append(button);

  if (pc.status === 'idle') {
    area.append(pcText('p', '아직 조회하지 않음: 「PC 값 조회」 버튼을 눌러 주세요.', 'state state-empty'));
  } else if (pc.status === 'loading') {
    const wait = pcText('p', '읽는 중입니다. 잠시 기다려 주세요. 끝나면 아래 값이 바뀝니다.', 'state state-loading');
    wait.setAttribute('role', 'status');
    area.append(wait);
  } else if (pc.status === 'ok') {
    const measured = pc.items.filter((item) => item.ok).length;
    const unknown = pc.items.length - measured;
    const done = pcText('p', `조회 성공: 잰 시각 ${pcKst(pc.measuredAt)} · 항목 ${pc.items.length}개 중 실측 ${measured}개${unknown ? ` · 확인 불가 ${unknown}개` : ''}`, 'state state-empty');
    done.setAttribute('role', 'status');
    area.append(done);
  } else {
    area.append(pcErrorScreen(pc, history.length > 0));
  }
  return area;
}

function renderPcCheckSection(pc, history, onProbe) {
  const section = document.createElement('div');
  section.className = 'status-pc-check';
  section.setAttribute('aria-busy', pc.status === 'loading' ? 'true' : 'false');
  section.append(pcText('h3', '내 PC 점검 (내 코드로 조회) · 핵심 3가지'));
  section.append(pcText('p', '버튼을 누를 때만 이 PC의 값을 한 번 읽습니다. 자동으로 다시 읽지 않으며, 읽은 값은 AI나 외부 서버로 보내지 않습니다. 정상·안전을 판정하지 않고 읽은 값만 보여 줍니다.', 'muted'));
  section.append(pcStatusArea(pc, onProbe, history));

  // ① 내 PC 상태: 제공 카드 「내 PC 상태」가 이미 CPU·메모리·디스크를 보여 주므로 값을 다시 그리지 않고 가리키기만 한다.
  section.append(pcDivider(), pcText('h3', '① 내 PC 상태'));
  section.append(pcText('p', 'CPU·메모리·디스크의 현재 값은 위쪽 제공 카드 「내 PC 상태」에서 봅니다. 이 구역은 같은 값을 다시 만들지 않고, 아래에서 값이 어떻게 변했는지만 보여 줍니다.', 'muted'));

  // ② 최근 기록
  section.append(pcDivider(), pcText('h3', `② 최근 기록 (최근 조회 최대 ${PC_HISTORY_LIMIT}번)`));
  if (!history.length) {
    section.append(pcText('p', '아직 성공한 조회가 없습니다.', 'state state-empty'));
  } else {
    const list = document.createElement('ul');
    list.className = 'plain-list status-pc-check-history';
    history.forEach((entry) => list.append(pcText('li', pcHistoryRowText(entry))));
    section.append(list);
    section.append(pcText('p', history.length > 1 ? pcCompareText(history[history.length - 2], history[history.length - 1]) : '직전 조회가 없어 비교할 수 없습니다.'));
  }
  const events = pc.status === 'ok' ? pc.links[2].text : '확인 불가 (이번 조회에서 읽은 값이 없음)';
  section.append(pcText('p', `Windows 경고·오류: ${events}`));
  section.append(pcText('p', '「보안 기록」 탭의 기록은 제공 화면 그대로이며 여기서 바꾸지 않았습니다.', 'muted'));

  // ③ 변화
  section.append(pcDivider(), pcText('h3', '③ 변화 (내가 조회한 순서)'));
  if (!history.length) {
    section.append(pcText('p', '조회를 2번 이상 하면 값이 어떻게 변했는지 막대로 비교할 수 있습니다.', 'state state-empty'));
  } else {
    const bars = document.createElement('ul');
    bars.className = 'plain-list status-pc-check-bars';
    history.forEach((entry) => bars.append(pcText('li', pcBarRow(entry))));
    section.append(bars);
    if (history.length === 1) section.append(pcText('p', '지금은 조회가 1번뿐이라 변화는 아직 볼 수 없습니다.', 'muted'));
  }
  section.append(pcText('p', `막대는 사용률 0~100%를 ${PC_BAR_WIDTH}칸으로 줄여 그린 것이고(█ 사용, ░ 남음), 내가 조회 버튼을 누른 시점의 값입니다. 일정한 간격의 그래프가 아니며, 새로고침하면 사라집니다. 크기는 1024 기준(Windows와 같은 방식)입니다.`, 'muted'));
  return section;
}

const PC_LINK_LABELS = ['네트워크 연결', '방화벽 설정', 'Windows 경고·오류'];

function renderPcLinkSection(pc, mode) {
  const section = document.createElement('div');
  section.className = 'status-pc-links';
  section.append(pcText('h4', '연결과 기록 (읽기만 함)', 'status-heading'));
  section.append(pcText('p', '위 「PC 값 조회」와 같은 조회 결과에서 읽기만 합니다. 방화벽·보안 설정은 바꾸지 않습니다. 못 읽은 항목은 0이나 정상이 아니라 확인 불가로 보여 줍니다. 내 PC 조회 결과와 SDP 연결 상태는 따로 표시합니다.', 'status-line status-line-empty'));

  const dl = document.createElement('dl');
  dl.className = 'status-pc-links-fields';
  if (pc.status === 'ok') {
    pc.links.forEach((item, index) => {
      dl.append(pcText('dt', PC_LINK_LABELS[index]), pcText('dd', item.text));
    });
  } else {
    const why = PC_STATUS_WORD[pc.status] || '값 없음';
    PC_LINK_LABELS.forEach((label) => {
      dl.append(pcText('dt', label), pcText('dd', `확인 불가 (${why}: 이번 조회에서 읽은 값이 없음)`));
    });
  }
  const sdp = pcSdpState(mode);
  dl.append(pcText('dt', 'SDP 서버'), pcText('dd', sdp.text));
  section.append(dl);

  if (pc.status === 'ok') {
    const measured = pc.links.filter((item) => item.ok).length;
    const unknown = pc.links.length - measured;
    section.append(pcText('p', `내 PC 조회: ${pcKst(pc.measuredAt)} · 연결·기록 항목 ${pc.links.length}개 중 실측 ${measured}개${unknown ? ` · 확인 불가 ${unknown}개` : ''}`, 'status-line'));
  }
  section.append(pcText('p', `SDP 서버 상태: ${sdp.note}`, 'status-line status-line-empty'));
  section.append(pcText('p', 'Windows 경고·오류 건수는 침해나 공격을 탐지한 결과가 아니며, 이 앱은 공격이나 침투를 흉내 내는 시험을 하지 않습니다.', 'status-line status-line-empty'));
  return section;
}

export function createStudentView({ api, onChange } = {}) {
  // 내 PC 점검 상태는 화면을 다시 그려도 남도록 여기(함수 밖)에 둔다.
  let pc = { status: 'idle' };
  const pcHistory = [];
  let pcGeneration = 0;
  const notify = () => { if (typeof onChange === 'function') onChange(); };

  async function probePc() {
    if (pc.status === 'loading') return;
    if (!api || typeof api.get !== 'function') {
      pc = { status: 'unsupported' };
      notify();
      return;
    }
    const own = ++pcGeneration;
    pc = { status: 'loading' };
    notify();
    let result;
    try {
      result = await api.get(PC_PATH);
    } catch {
      result = { ok: false, error: { code: 'CLIENT_ERROR', message: '' } };
    }
    if (own !== pcGeneration) return;
    pc = pcClassify(result, Date.now());
    if (pc.status === 'ok') {
      pcHistory.push({ measuredAt: pc.measuredAt, items: pc.items });
      while (pcHistory.length > PC_HISTORY_LIMIT) pcHistory.shift();
    }
    notify();
    // 다시 그리면서 버튼이 새로 만들어져 초점이 사라졌으면 되돌린다. 사용자가 다른 곳으로 옮겼다면 건드리지 않는다.
    if (typeof document !== 'undefined' && document.activeElement === document.body) {
      const next = document.querySelector('[data-pc-probe="1"]');
      if (next) next.focus();
    }
  }

  return {
    renderIdentity,
    renderDecision,
    renderEvents,
    renderStatus(input) {
      const root = renderStatus(input);
      // 4일차: 핵심 3가지가 먼저 보이도록 내 PC 점검과 연결·기록을 맨 위에 둔다(기존 기기·세션·알림은 그 아래).
      root.prepend(renderPcCheckSection(pc, pcHistory, probePc), renderPcLinkSection(pc, input && typeof input === 'object' ? input.mode : undefined));
      return root;
    },
    renderVulnerabilities,
    renderAiConnection,
    renderExplanation,
    renderAction,
  };
}
