import { Solar } from 'lunar-javascript';

const btn = document.getElementById('btn');
const out = document.getElementById('out');

const ELEMENT_OF_GAN = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};
const ELEMENT_OF_ZHI = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

function clamp(x) {
  return Math.max(0, Math.min(100, Math.round(x)));
}

function countElements(pillars) {
  const cnt = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of pillars) {
    const gan = p.charAt(0);
    const zhi = p.charAt(1);
    cnt[ELEMENT_OF_GAN[gan]]++;
    cnt[ELEMENT_OF_ZHI[zhi]]++;
  }
  return cnt; // 8个计数（4干+4支）
}

// 一个“可解释且稳定”的映射：你后面可以继续加十神/合冲/用神
function scoreFromElements(cnt) {
  const arr = Object.values(cnt);
  const max = Math.max(...arr),
    min = Math.min(...arr);
  const balance = 1 - (max - min) / 8; // 0~1，越平衡越高

  // 健康：平衡度主导
  const health = clamp(55 + balance * 45);

  // 学术：水(木)偏强通常更利学习/思维（保守映射）
  const academic = clamp(55 + (cnt.水 * 6 + cnt.木 * 5 - cnt.火 * 2));

  // 财运：金(土)偏强更利“资源/落地/积累”（保守映射）
  const wealth = clamp(55 + (cnt.金 * 6 + cnt.土 * 5 - cnt.水 * 2));

  // 姻缘：平衡度 + 火(木)一点点（表达/生发），避免过度绝对化
  const love = clamp(55 + balance * 25 + cnt.火 * 3 + cnt.木 * 2 - cnt.金 * 1);

  return { love, academic, wealth, health, balance };
}

function advice(k, v) {
  if (k === 'love')
    return v >= 80
      ? '关系推进窗口期：把需求说清、边界定清。'
      : v >= 65
      ? '关系可稳：减少猜测，增加确认。'
      : '先稳住节奏与情绪，再谈推进。';
  if (k === 'academic')
    return v >= 80
      ? '适合冲刺产出：优先交付可提交成果。'
      : v >= 65
      ? '稳步提升：薄弱点清单化复盘。'
      : '先建立稳定学习节奏，别多线开坑。';
  if (k === 'wealth')
    return v >= 80
      ? '偏向积累/扩张：仍要设风险上限。'
      : v >= 65
      ? '稳健为主：现金流与预算优先。'
      : '收缩期：控支出、避免高风险决策。';
  if (k === 'health')
    return v >= 80
      ? '状态可维持：规律作息+轻运动。'
      : v >= 65
      ? '优先睡眠与压力管理。'
      : '先补休息，减少熬夜与高压安排。';
  return '';
}

function renderScores(s) {
  const items = [
    ['姻缘', 'love'],
    ['学术前途', 'academic'],
    ['财运', 'wealth'],
    ['健康', 'health'],
  ];
  return `<div class="grid">${items
    .map(([cn, k]) => {
      const v = s[k];
      return `<div class="kpi"><b>${cn}</b><div class="score">${v}</div><div class="bar"><div style="width:${v}%"></div></div><div class="muted" style="margin-top:8px;">${advice(
        k,
        v
      )}</div></div>`;
    })
    .join('')}</div>`;
}

btn.addEventListener('click', () => {
  const dtVal = document.getElementById('dt').value;
  if (!dtVal) return;

  const sex = document.getElementById('sex').value;

  // datetime-local -> Date（本地时区）
  const dt = new Date(dtVal);

  const solar = Solar.fromDate(dt);
  const lunar = solar.getLunar();
  const eight = lunar.getEightChar(); // 关键：真实四柱（含节气月柱处理）

  const y = eight.getYear();
  const m = eight.getMonth();
  const d = eight.getDay();
  const h = eight.getTime();

  const pillars = [y, m, d, h];
  const cnt = countElements(pillars);
  const scores = scoreFromElements(cnt);

  out.style.display = 'block';
  out.innerHTML = `
    <div><b>四柱：</b>年柱 ${y} ｜ 月柱 ${m} ｜ 日柱 ${d} ｜ 时柱 ${h}</div>
    <div class="mono" style="margin-top:8px;">（本地时区）${dt.toString()}</div>
    <div class="hr"></div>
    <div><b>五行统计（4干+4支）</b></div>
    <div class="muted">木 ${cnt.木} ｜ 火 ${cnt.火} ｜ 土 ${cnt.土} ｜ 金 ${
    cnt.金
  } ｜ 水 ${cnt.水}</div>
    <div class="muted" style="margin-top:6px;">平衡度：${scores.balance.toFixed(
      2
    )}</div>
    <div class="hr"></div>
    <div><b>四项结果</b></div>
    ${renderScores(scores)}
    <div class="hr"></div>
    <div class="muted">提示：这里的四项评分是基于五行结构的保守映射（可复现、可解释）。你要更“命理派”的版本（十神/合冲/用神/大运流年），下一步再加。</div>
  `;
});
