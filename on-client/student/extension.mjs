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

function renderAiConnection(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const status = safeInput.status;
  const root = document.createElement('div');
  root.className = 'ai-connection-panel';

  if (status === 'idle') {
    root.append(aiConnectionText('p', 'AI 연결 점검 전', 'ai-connection-state ai-connection-idle'));
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
    root.append(aiConnectionText('p', '이 점검은 연결만 확인했습니다. 사건 설명은 아직 실행하지 않았습니다.', 'ai-connection-note'));
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

// 18단계에서 근거·규칙·제안까지 넓어질 기초 버전. 지금은 사건 ID와 요약만 표시한다.
function renderExplanation(input) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const event = safeInput.event && typeof safeInput.event === 'object' ? safeInput.event : null;
  const explanation = safeInput.explanation && typeof safeInput.explanation === 'object' ? safeInput.explanation : {};
  const root = document.createElement('div');
  root.className = 'explanation-panel';

  if (explanation.status === 'ok') {
    if (!event || typeof event.id !== 'string' || !event.id) {
      // event 없이 ok만 오는 것은 계약 밖이므로 성공처럼 보이지 않게 확인 불가로 남긴다.
      root.append(explanationText('p', '확인 불가: 사건 정보를 확인할 수 없습니다.', 'explanation-state explanation-error'));
      return root;
    }
    const data = explanation.data && typeof explanation.data === 'object' ? explanation.data : {};
    // 공식 요구사항: explanation.status가 ok일 때만 data-student-explanation-event에 event.id를 붙인다.
    root.dataset.studentExplanationEvent = event.id;
    root.append(
      explanationText('p', `사건 ID: ${event.id}`, 'explanation-event-id'),
      explanationText('p', typeof data.summary === 'string' && data.summary ? data.summary : '확인 불가: 설명 요약을 확인할 수 없습니다.', 'explanation-summary'),
    );
    return root;
  }

  if (explanation.status === 'error') {
    const error = explanation.error && typeof explanation.error === 'object' ? explanation.error : {};
    const code = typeof error.code === 'string' && error.code ? error.code : '확인불가';
    const message = typeof error.message === 'string' && error.message ? error.message : '오류 내용을 확인할 수 없습니다.';
    // 실패 화면에는 data-student-explanation-event를 붙이지 않는다.
    root.append(
      explanationText('p', `AI 설명 확인 불가 (${code})`, 'explanation-state explanation-error'),
      explanationText('p', message, 'explanation-error-message'),
      explanationText('p', '기록은 그대로 유지됩니다.', 'explanation-note'),
    );
    return root;
  }

  if (explanation.status === 'loading') {
    root.append(explanationText('p', 'AI 설명을 기다리는 중', 'explanation-state explanation-loading'));
    return root;
  }

  root.append(explanationText('p', '아직 선택한 사건의 AI 설명이 없습니다.', 'explanation-state explanation-idle'));
  return root;
}

export function createStudentView() {
  return {
    renderIdentity,
    renderDecision,
    renderEvents,
    renderStatus,
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection,
    renderExplanation,
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
