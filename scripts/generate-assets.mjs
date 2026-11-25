#!/usr/bin/env node
/**
 * Generate Apple 2026 Mac Studio (M5 Max) "Wall-to-Wall Power" profile assets for peryixing-lab.
 * Outputs:
 *   - assets/hero-banner.png (2400x880 2x Retina Wall-to-Wall brushed aluminum Hero + avatar + violet contour wave)
 *   - assets/card-*.png (7 bespoke 2400x760 2x Retina Wall-to-Wall monochrome aluminum project cards)
 * Optional env:
 *   - PREVIEW_DIR=/path/to/dir  Also render full GitHub preview PNGs for inspection.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const AVATAR_PATH = path.join(ASSETS_DIR, 'avatar.jpg');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

fs.mkdirSync(ASSETS_DIR, { recursive: true });

if (!fs.existsSync(CHROME_PATH)) {
  throw new Error(`Google Chrome not found at ${CHROME_PATH}`);
}
if (!fs.existsSync(AVATAR_PATH)) {
  throw new Error(`Avatar JPEG not found at ${AVATAR_PATH}`);
}

const FONT_SANS = `"AppleSFVar", -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", sans-serif`;
const FONT_MONO = `"SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

/**
 * 1. Build Hero Banner HTML (1200x440 -> 2x Retina 2400x880 PNG)
 *    - Exact user text: "PERYIXING LAB.", "Built to", "Create."
 *    - Top interlocking row: 204x204 machined titanium avatar square flush beside "PERYIXING LAB." + "Built to"
 *    - Bottom wall-to-wall row: massive "Create" + glowing lavender square period over 26-line sweeping violet wave
 */
function buildHeroBannerHtml() {
  const wavePaths = [];
  const lineCount = 26;
  for (let i = 0; i < lineCount; i++) {
    const t = i / (lineCount - 1);
    const x0 = 140 + t * 175;
    const y0 = 458;
    const cx1 = 560 + t * 120;
    const cy1 = 448 - (1 - t) * 18;
    const cx2 = 910 + t * 95;
    const cy2 = 340 + t * 92;
    const xEnd = 1222;
    const yEnd = 228 + t * 214;

    const strokeOpacity = (0.24 + 0.56 * Math.sin(t * Math.PI * 0.88 + 0.15)).toFixed(3);
    const strokeColor = t < 0.35 ? '#DDD6FE' : t < 0.72 ? '#A78BFA' : '#7C3AED';
    wavePaths.push(
      `<path d="M ${x0.toFixed(1)} ${y0} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${xEnd} ${yEnd.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="1.1"/>`
    );
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "AppleSFVar";
    src: url("file:///System/Library/Fonts/SFNS.ttf") format("truetype");
    font-weight: 1 1000;
    font-stretch: 30% 150%;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1200px;
    height: 440px;
    overflow: hidden;
    background: transparent;
    font-family: ${FONT_SANS};
    -webkit-font-smoothing: antialiased;
  }
  .hero {
    position: relative;
    width: 1200px;
    height: 440px;
    border-radius: 22px;
    overflow: hidden;
    background: #000000;
    padding: 24px 34px 22px 34px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.20),
      inset 0 -1px 0 rgba(167,139,250,0.14),
      inset 0 0 0 1px rgba(255,255,255,0.11);
  }
  .wave-layer {
    position: absolute;
    inset: 0;
    width: 1200px;
    height: 440px;
    z-index: 1;
    pointer-events: none;
  }
  .noise-overlay {
    position: absolute;
    inset: 0;
    width: 1200px;
    height: 440px;
    opacity: 0.045;
    pointer-events: none;
    z-index: 5;
    mix-blend-mode: overlay;
  }

  /* Top Interlocking Mac Studio Hardware-Beside-Type Row */
  .top-row {
    position: relative;
    z-index: 2;
    height: 204px;
    display: flex;
    align-items: stretch;
    gap: 24px;
  }
  .avatar-bezel {
    position: relative;
    width: 204px;
    height: 204px;
    flex-shrink: 0;
    border-radius: 24px;
    padding: 8px;
    background: linear-gradient(145deg, #3A3F4B 0%, #171A22 46%, #0D0F14 78%, #2C303A 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.38),
      inset 0 -1px 0 rgba(255,255,255,0.08),
      0 12px 32px rgba(0,0,0,0.75);
  }
  .avatar-window {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 17px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.22);
  }
  .avatar-window img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .avatar-vignette {
    position: absolute;
    inset: 0;
    border-radius: 17px;
    background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.20) 100%);
    pointer-events: none;
  }

  .top-type {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .hero-kicker {
    font-family: ${FONT_SANS};
    font-size: 92px;
    line-height: 0.94;
    padding: 4px 2px 10px 2px;
    margin-top: -6px;
    letter-spacing: -0.02em;
    font-variation-settings: 'wght' 980, 'wdth' 82, 'opsz' 96;
    white-space: nowrap;
    background: linear-gradient(95deg, #FFFFFF 0%, #E2E5EC 52%, #8A909D 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 18px rgba(255,255,255,0.16));
  }
  .hero-built {
    font-family: ${FONT_SANS};
    font-size: 132px;
    line-height: 0.94;
    padding: 4px 2px 12px 2px;
    margin-bottom: -16px;
    letter-spacing: -0.03em;
    font-variation-settings: 'wght' 980, 'wdth' 138, 'opsz' 96;
    white-space: nowrap;
    background: linear-gradient(180deg, #FFFFFF 0%, #F4F5F7 54%, #B6BCC7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 26px rgba(255,255,255,0.22));
  }

  /* Bottom Wall-to-Wall Monumental Row */
  .bottom-row {
    position: relative;
    z-index: 2;
    height: 174px;
    display: flex;
    align-items: flex-end;
  }
  .hero-create {
    font-family: ${FONT_SANS};
    font-size: 192px;
    line-height: 0.94;
    padding: 6px 4px 16px 4px;
    margin-bottom: -18px;
    letter-spacing: -0.03em;
    font-variation-settings: 'wght' 980, 'wdth' 144, 'opsz' 96;
    white-space: nowrap;
    background: linear-gradient(112deg, #FFFFFF 0%, #ECEEF3 32%, #A6ACB8 64%, #E6E9F0 90%, #989EA9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 28px rgba(255,255,255,0.22));
  }
  .lavender-square {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    margin-left: 14px;
    margin-bottom: 4px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #EDE9FE 0%, #A78BFA 52%, #7C3AED 100%);
    box-shadow: 0 0 28px rgba(167,139,250,0.72), 0 0 8px rgba(221,214,254,0.65);
  }
</style>
</head>
<body>
  <div class="hero">
    <svg class="wave-layer" viewBox="0 0 1200 440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="waveGlow" cx="80%" cy="86%" r="54%">
          <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.50"/>
          <stop offset="44%" stop-color="#5B21B6" stop-opacity="0.28"/>
          <stop offset="78%" stop-color="#2E1065" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="930" cy="368" rx="470" ry="225" fill="url(#waveGlow)"/>
      ${wavePaths.join('\n      ')}
    </svg>

    <svg class="noise-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="grainHero">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="1200" height="440" filter="url(#grainHero)"/>
    </svg>

    <div class="top-row">
      <div class="avatar-bezel">
        <div class="avatar-window">
          <img src="file://${AVATAR_PATH}" alt="peryixing-lab avatar" />
          <div class="avatar-vignette"></div>
        </div>
      </div>
      <div class="top-type">
        <div class="hero-kicker">PERYIXING LAB.</div>
        <div class="hero-built">Built to</div>
      </div>
    </div>

    <div class="bottom-row">
      <div class="hero-create">Create</div>
      <div class="lavender-square"></div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 2. Build 7 Wall-to-Wall Monochrome Aluminum Project Cards (1200x380 -> 2x Retina 2400x760 PNG)
 */
const CARDS = [
  {
    filename: 'card-lexinote.png',
    heroHtml: `
      <div class="layout-kicker-giant">
        <div class="kicker-row">
          <div class="kicker-text" style="font-size: 34px; font-variation-settings: 'wght' 860, 'wdth' 86, 'opsz' 96;">LOCAL-FIRST MARKDOWN · HARMONYOS &amp; MACOS</div>
          <div class="alu-pill">知萤 · v2.0</div>
        </div>
        <div class="giant-word metal-bright" style="font-size: 316px; font-variation-settings: 'wght' 980, 'wdth' 50, 'opsz' 96; letter-spacing: -0.012em; margin: -24px 0 -20px 0;">LEXINOTE</div>
      </div>
    `,
    footerLeft: '双原生分支 ArkTS + SwiftUI · 本地 Markdown 知识库 · Harness 智能体插件宿主',
    footerTags: ['2 PLATFORMS', 'HARNESS v1.6'],
  },
  {
    filename: 'card-lexiglow.png',
    heroHtml: `
      <div class="layout-split-80">
        <div class="split-left metal-bright" style="font-size: 356px; font-variation-settings: 'wght' 980, 'wdth' 44, 'opsz' 96; letter-spacing: -0.018em; margin: -18px 0 -22px 0;">26K</div>
        <div class="split-right">
          <div class="split-top metal-bright" style="font-size: 184px; font-variation-settings: 'wght' 980, 'wdth' 50, 'opsz' 96; letter-spacing: -0.01em; margin: -14px 0 -10px 0;">LEXIGLOW</div>
          <div class="split-bottom metal-dim" style="font-size: 152px; font-variation-settings: 'wght' 920, 'wdth' 46, 'opsz' 96; letter-spacing: -0.008em; margin: -12px 0 -14px 0;">OFFLINE SRS</div>
        </div>
      </div>
    `,
    footerLeft: '26,071 词条五大离线词库 · 间隔重复算法 · 深浅双模 FormKit 桌面卡片',
    footerTags: ['词萤', '5 DICTS', 'API 26'],
  },
  {
    filename: 'card-lexiclash.png',
    heroHtml: `
      <div class="layout-studio-wall">
        <div class="studio-top-row">
          <div class="mac-chassis-badge">
            <div class="chassis-grille"></div>
            <div class="chassis-front">
              <span class="chassis-ports"><i></i><i></i><i class="slot"></i></span>
              <span class="chassis-label">ARKUI ⇄ C++ N-API ⇄ GO MIHOMO</span>
              <span class="chassis-led"></span>
            </div>
          </div>
          <div class="studio-lockup">
            <div class="lockup-wide metal-bright" style="font-size: 32px; font-variation-settings: 'wght' 920, 'wdth' 126, 'opsz' 96; letter-spacing: 0.04em;">HARMONYOS 7</div>
            <div class="lockup-tall metal-mid" style="font-size: 70px; font-variation-settings: 'wght' 960, 'wdth' 74, 'opsz' 96; letter-spacing: -0.015em;">NATIVE PROXY</div>
          </div>
        </div>
        <div class="giant-word metal-mid" style="font-size: 248px; font-variation-settings: 'wght' 980, 'wdth' 62, 'opsz' 96; letter-spacing: -0.012em; margin: -18px 0 -18px 0;">LEXICLASH</div>
      </div>
    `,
    footerLeft: '由 OHClash 迭代演进 · C++ N-API 桥接 ClashMeta (mihomo) 内核 · 链式代理与测速',
    footerTags: ['9 ★', 'GPL-3.0'],
  },
  {
    filename: 'card-lumikit.png',
    heroHtml: `
      <div class="layout-two-tier">
        <div class="giant-word metal-sweep" style="font-size: 210px; font-variation-settings: 'wght' 980, 'wdth' 132, 'opsz' 96; letter-spacing: -0.01em; margin: -18px 0 -14px 0;">LUMIKIT</div>
        <div class="giant-word metal-sweep-rev" style="font-size: 150px; font-variation-settings: 'wght' 950, 'wdth' 52, 'opsz' 96; letter-spacing: -0.008em; margin: -12px 0 -14px 0;">LOCAL WORKBENCH</div>
      </div>
    `,
    footerLeft: '材料包交付 · OCR · 表格分析 · 双向原生联动 LexiNote 知萤 & LexiGlow 词萤',
    footerTags: ['集萤 · v1.3', 'PHONE · TABLET · 2IN1'],
  },
  {
    filename: 'card-harmonyos-dev-skill.png',
    heroHtml: `
      <div class="layout-two-tier">
        <div class="giant-word metal-bright" style="font-size: 204px; font-variation-settings: 'wght' 980, 'wdth' 68, 'opsz' 96; letter-spacing: -0.01em; margin: -16px 0 -14px 0;">HARMONYOS</div>
        <div class="giant-word metal-sweep" style="font-size: 154px; font-variation-settings: 'wght' 960, 'wdth' 44, 'opsz' 96; letter-spacing: -0.006em; margin: -12px 0 -14px 0;">DEVELOPMENT SKILL</div>
      </div>
    `,
    footerLeft: '28 篇 OpenHarmony 离线文档 · ArkTS 规范 · 设计稿转代码 · DevEco / HDC · 崩溃分诊',
    footerTags: ['11 ★', '28 DOCS', 'DFX'],
  },
  {
    filename: 'card-immersive-light-skill.png',
    heroHtml: `
      <div class="layout-kicker-giant">
        <div class="kicker-row">
          <div class="kicker-text" style="font-size: 31px; font-variation-settings: 'wght' 860, 'wdth' 84, 'opsz' 96;">API 23 HDSMATERIAL · API 26 UIMATERIAL · 18-RULE AUDIT</div>
          <div class="alu-pill">9 ★</div>
        </div>
        <div class="giant-word metal-bright" style="font-size: 180px; font-variation-settings: 'wght' 980, 'wdth' 54, 'opsz' 96; letter-spacing: -0.01em; margin: -14px 0 -12px 0;">IMMERSIVE LIGHT</div>
        <div class="giant-word metal-sweep" style="font-size: 122px; font-variation-settings: 'wght' 940, 'wdth' 45, 'opsz' 96; letter-spacing: -0.005em; margin: -10px 0 -12px 0;">EFFECT DEVELOPMENT SKILL</div>
      </div>
    `,
    footerLeft: '鸿蒙沉浸光感与液态玻璃 Agent Skill · 双体系精准分流 · 安全区避让与 18 条反模式审计',
    footerTags: ['API 23–26', '18 RULES'],
  },
  {
    filename: 'card-kelivo-arkts.png',
    heroHtml: `
      <div class="layout-kicker-giant">
        <div class="kicker-row">
          <div class="kicker-text" style="font-size: 28px; font-variation-settings: 'wght' 860, 'wdth' 86, 'opsz' 96;">HARMONYOS NEXT API 26 · UPSTREAM KELIVO 4.7K ★</div>
          <div class="alu-pill alu-pill-purple">BRANCH</div>
        </div>
        <div class="giant-word metal-sweep" style="font-size: 126px; font-variation-settings: 'wght' 940, 'wdth' 86, 'opsz' 96; letter-spacing: -0.008em; margin: -10px 0 -10px 0;">KELIVO-OHOS</div>
        <div class="giant-word" style="font-size: 146px; font-variation-settings: 'wght' 980, 'wdth' 76, 'opsz' 96; letter-spacing: -0.008em; margin: -10px 0 -14px 0;">
          <span class="clip-span metal-bright">KELIVO-</span><span class="clip-span metal-lavender">ARKTS</span>
        </div>
      </div>
    `,
    footerLeft: '99 个 .ets 纯原生重构 · 多协议 LLM / ChatGPT 订阅 · MCP · 26 引擎搜索 · 沙箱 · 8 标签浏览器',
    footerTags: ['99 .ETS', 'MCP'],
  },
];

function buildCardHtml(card) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "AppleSFVar";
    src: url("file:///System/Library/Fonts/SFNS.ttf") format("truetype");
    font-weight: 1 1000;
    font-stretch: 30% 150%;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1200px;
    height: 380px;
    overflow: hidden;
    background: transparent;
    font-family: ${FONT_SANS};
    -webkit-font-smoothing: antialiased;
  }
  .card {
    position: relative;
    width: 1200px;
    height: 380px;
    border-radius: 22px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #000000;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      inset 0 -1px 0 rgba(255,255,255,0.06),
      inset 0 0 0 1px rgba(255,255,255,0.11);
  }
  .noise-overlay {
    position: absolute;
    inset: 0;
    width: 1200px;
    height: 380px;
    opacity: 0.045;
    pointer-events: none;
    z-index: 5;
    mix-blend-mode: overlay;
  }
  .hero-stage {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: 14px 26px 12px 26px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Metallic Aluminum Typography Treatments */
  .metal-bright {
    background: linear-gradient(180deg, #FFFFFF 0%, #F4F5F7 52%, #B8BDC7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 24px rgba(255,255,255,0.22));
  }
  .metal-mid {
    background: linear-gradient(105deg, #F8FAFC 0%, #D4D7DF 48%, #9095A0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 16px rgba(255,255,255,0.12));
  }
  .metal-dim {
    background: linear-gradient(180deg, #E2E5EC 0%, #8E939E 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .metal-sweep {
    background: linear-gradient(115deg, #FFFFFF 0%, #E4E7EE 28%, #989DA8 66%, #CED3DC 88%, #7E838F 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 16px rgba(255,255,255,0.14));
  }
  .metal-sweep-rev {
    background: linear-gradient(100deg, #989DA8 0%, #E6E8EE 38%, #FFFFFF 64%, #9CA2AE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 14px rgba(255,255,255,0.12));
  }
  .metal-lavender {
    background: linear-gradient(180deg, #FFFFFF 0%, #DDD6FE 46%, #A78BFA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 26px rgba(167,139,250,0.34));
  }

  .giant-word {
    font-family: ${FONT_SANS};
    line-height: 0.92;
    padding: 4px 2px 12px 2px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .clip-span {
    display: inline-block;
    padding: 4px 2px 12px 2px;
  }

  .layout-kicker-giant {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .kicker-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .kicker-text {
    font-family: ${FONT_SANS};
    line-height: 0.96;
    padding: 2px 2px 4px 2px;
    text-transform: uppercase;
    white-space: nowrap;
    background: linear-gradient(90deg, #FFFFFF 0%, #D4D7DF 58%, #636771 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .layout-split-80 {
    flex: 1;
    display: flex;
    align-items: stretch;
    gap: 24px;
  }
  .split-left {
    line-height: 0.92;
    padding: 4px 2px 12px 2px;
    white-space: nowrap;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .split-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .split-top {
    line-height: 0.92;
    padding: 4px 2px 10px 2px;
    white-space: nowrap;
  }
  .split-bottom {
    line-height: 0.92;
    padding: 4px 2px 12px 2px;
    white-space: nowrap;
  }

  .layout-studio-wall {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .studio-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .mac-chassis-badge {
    width: 520px;
    height: 84px;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(90deg, #6E727A 0%, #D4D7DE 18%, #F4F5F8 50%, #D0D4DC 82%, #686C74 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.65),
      inset 0 -2px 4px rgba(0,0,0,0.45),
      0 8px 24px rgba(0,0,0,0.7);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px 14px 10px 14px;
    flex-shrink: 0;
  }
  .chassis-grille {
    height: 36px;
    border-radius: 4px;
    background-image: radial-gradient(rgba(18,20,24,0.85) 1.3px, transparent 1.3px);
    background-size: 6px 6px;
    opacity: 0.68;
  }
  .chassis-front {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .chassis-ports {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .chassis-ports i {
    display: inline-block;
    width: 4px;
    height: 11px;
    border-radius: 2px;
    background: #14161A;
  }
  .chassis-ports i.slot {
    width: 24px;
    height: 3.5px;
  }
  .chassis-label {
    font-family: ${FONT_MONO};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #1A1D24;
  }
  .chassis-led {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 6px #FFFFFF;
  }
  .studio-lockup {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    line-height: 0.96;
  }
  .lockup-wide { white-space: nowrap; padding: 2px 2px 4px 2px; }
  .lockup-tall { white-space: nowrap; padding: 2px 2px 6px 2px; margin-top: -4px; }

  .layout-two-tier {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .tier-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .alu-pill {
    font-family: ${FONT_MONO};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #E4E4E7;
    padding: 6px 13px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.20);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .alu-pill-lg {
    margin-top: 8px;
    font-size: 12px;
    padding: 7px 15px;
  }
  .alu-pill-purple {
    color: #DDD6FE;
    background: rgba(167,139,250,0.14);
    border: 1px solid rgba(167,139,250,0.45);
  }

  .spec-strip {
    position: relative;
    z-index: 2;
    height: 46px;
    padding: 0 26px;
    border-top: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.025);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .spec-desc {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #B4B9C4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spec-tags {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .spec-tag {
    font-family: ${FONT_MONO};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #E4E4E7;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.13);
    white-space: nowrap;
  }
</style>
</head>
<body>
  <div class="card">
    <svg class="noise-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="1200" height="380" filter="url(#grain)"/>
    </svg>
    <div class="hero-stage">
      ${card.heroHtml}
    </div>
    <div class="spec-strip">
      <div class="spec-desc">${card.footerLeft}</div>
      <div class="spec-tags">
        ${card.footerTags.map((t) => `<span class="spec-tag">${t}</span>`).join('')}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function renderChromeScreenshot(htmlPath, pngPath, width, height) {
  execFileSync(
    CHROME_PATH,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=2',
      `--window-size=${width},${height}`,
      '--default-background-color=00000000',
      '--virtual-time-budget=1200',
      `--screenshot=${pngPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'pipe' }
  );
}

function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'peryixing-m5max-'));
  try {
    const heroHtmlPath = path.join(tmpDir, 'hero-banner.html');
    const heroPath = path.join(ASSETS_DIR, 'hero-banner.png');
    fs.writeFileSync(heroHtmlPath, buildHeroBannerHtml(), 'utf8');
    renderChromeScreenshot(heroHtmlPath, heroPath, 1200, 440);
    console.log(`Generated ${path.relative(ROOT_DIR, heroPath)}`);

    for (const card of CARDS) {
      const htmlPath = path.join(tmpDir, `${card.filename}.html`);
      const outPath = path.join(ASSETS_DIR, card.filename);
      fs.writeFileSync(htmlPath, buildCardHtml(card), 'utf8');
      renderChromeScreenshot(htmlPath, outPath, 1200, 380);
      console.log(`Generated ${path.relative(ROOT_DIR, outPath)}`);
    }

    const previewDir = process.env.PREVIEW_DIR;
    if (previewDir) {
      fs.mkdirSync(previewDir, { recursive: true });
      fs.copyFileSync(heroPath, path.join(previewDir, 'hero-banner-preview.png'));

      const ghPreviewHtml = path.join(tmpDir, 'github-profile-preview.html');
      const ghPreviewPng = path.join(previewDir, 'github-profile-preview.png');
      const cardDataList = [
        {
          section: '原生应用 / Native Applications',
          items: [
            { img: 'card-lexinote.png', zh: '知萤 LexiNote：本地优先的 Markdown 笔记与知识整理应用，按平台分支独立维护 HarmonyOS（ArkTS / ArkUI）与 Apple Silicon macOS（SwiftUI / AppKit）工程，并内置 Harness 智能体插件宿主。', en: 'Local-first Markdown note-taking and knowledge organization app maintaining dedicated native HarmonyOS (ArkTS) and Apple Silicon macOS (SwiftUI) branches with an experimental Harness agent plugin host.', badges: ['STARS | 2', 'PLATFORM | HARMONYOS + MACOS', 'LEXINOTE | 了解项目'] },
            { img: 'card-lexiglow.png', zh: '词萤 LexiGlow：面向中国英语学习者的 HarmonyOS（API 26）原生单词记忆应用，以间隔重复算法为核心驱动，内置五大离线词书（26,071 词条）与深浅双模桌面卡片。', en: 'Native HarmonyOS (API 26) English vocabulary memorization app powered by spaced repetition, featuring 5 built-in offline dictionaries (26,071 entries) and light/dark FormKit home-screen widgets.', badges: ['STARS | 1', 'DICT | 26,071 ENTRIES', 'LEXIGLOW | 了解项目'] },
            { img: 'card-lexiclash.png', zh: 'LexiClash：由 OHClash 迭代演进的 HarmonyOS 7 原生代理客户端，使用 ArkTS / ArkUI 构建交互，通过 C++ / N-API 桥接 Go / mihomo 内核，支持订阅配置、延迟测速与链式代理。', en: 'HarmonyOS 7+ native proxy client evolved from OHClash, pairing an ArkTS / ArkUI interface with a Go / mihomo core through a C++ N-API native bridge.', badges: ['STARS | 9', 'STACK | ARKUI + N-API + GO', 'LEXICLASH | 了解项目'] },
            { img: 'card-lumikit.png', zh: '集萤 LumiKit：HarmonyOS 原生、本地优先的个人工具工作台，集材料包批量交付、OCR 识别、物品档案、表单与表格分析于一身，并与知萤、词萤实现原生生态联动。', en: 'HarmonyOS native, local-first personal workbench uniting material-pack delivery, OCR, item registries, forms, and table analytics, natively linked with LexiNote and LexiGlow.', badges: ['RELEASE | v1.3.0', 'ECOSYSTEM | 知萤 · 词萤联动', 'LUMIKIT | 了解项目'] },
          ],
        },
        {
          section: '智能体技能 / Agent Skills',
          items: [
            { img: 'card-harmonyos-dev-skill.png', zh: 'HarmonyOS-Development-Skill：一站式鸿蒙 NEXT 全链路开发 Agent 技能包，内置 28 篇 OpenHarmony 离线文档检索、ArkTS / ArkUI 规范、设计稿转代码、DevEco / HDC 工具链与崩溃日志分诊。', en: 'All-in-one HarmonyOS NEXT Agent Skill integrating 28 offline OpenHarmony docs, ArkTS/ArkUI coding rules, design-to-code workflows, DevEco/HDC toolchains, and FaultLog crash triage.', badges: ['STARS | 11', 'KNOWLEDGE | 28 OFFLINE DOCS', 'SKILL | 了解项目'] },
            { img: 'card-immersive-light-skill.png', zh: 'Immersive-Light-Effect-Development-Skill：HarmonyOS 沉浸光感与液态玻璃开发技能包，精确分流 API 23 hdsMaterial 与 API 26 uiMaterial 双体系，涵盖安全区避让与 18 条反模式静态审计。', en: 'HarmonyOS Immersive Light & Liquid Glass Agent Skill covering dual API 23 hdsMaterial / API 26 uiMaterial systems, SafeArea avoidance, and an 18-rule static audit script.', badges: ['STARS | 9', 'AUDIT | 18 RULES · API 23-26', 'SKILL | 了解项目'] },
          ],
        },
        {
          section: '开源重构分支 / Open-Source Native Port',
          items: [
            { img: 'card-kelivo-arkts.png', zh: 'kelivo-ohos（kelivo-ArkTS 分支）：基于 HarmonyOS NEXT（API 26）Stage 模型与纯粹 ArkTS / ArkUI 原生重构的多模型 AI 对话与 Agent 自动化工作台，全面对齐上游 Kelivo 协议生态，支持 MCP、沙箱工作区、26 种搜索引擎与 8 标签 ArkWeb 浏览器。', en: 'HarmonyOS NEXT (API 26) native ArkTS rewrite on the kelivo-ArkTS branch of kelivo-ohos, aligning with upstream Kelivo protocols alongside MCP, sandbox workspaces, 26 search adapters, and an 8-tab ArkWeb browser.', badges: ['BRANCH | kelivo-ArkTS', 'UPSTREAM KELIVO | 4.7K', 'KELIVO-ARKTS | 查看分支'] },
          ],
        },
      ];

      const sectionsHtml = cardDataList.map((sec) => `
        <h2>${sec.section}</h2>
        ${sec.items.map((it) => `
          <div class="proj">
            <img class="card-img" src="file://${path.join(ASSETS_DIR, it.img)}" />
            <p class="cap">${it.zh}<br/>${it.en}</p>
            <div class="badges">${it.badges.map((b, idx) => {
              const [k, v] = b.split(' | ');
              const bg = idx === 0 ? '#52525B' : idx === 1 ? '#7C3AED' : '#27272A';
              return `<span class="badge"><span class="bk">${k}</span><span class="bv" style="background:${bg}">${v}</span></span>`;
            }).join('')}</div>
          </div>
        `).join('')}
      `).join('');

      fs.writeFileSync(
        ghPreviewHtml,
        `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
          body { margin: 0; padding: 24px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; color: #1f2328; width: 944px; box-sizing: border-box; }
          .box { border: 1px solid #d0d7de; border-radius: 6px; padding: 24px 28px 18px 28px; width: 896px; box-sizing: border-box; background: #ffffff; }
          .crumb { font-family: ${FONT_MONO}; font-size: 12px; color: #656d76; margin-bottom: 14px; }
          .hero-img { width: 100%; border-radius: 14px; display: block; margin-bottom: 16px; }
          .intro { font-size: 14.5px; line-height: 1.6; margin: 0 0 14px 0; }
          .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
          .badge { display: inline-flex; font-family: ${FONT_MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; border-radius: 3px; overflow: hidden; }
          .bk { background: #000000; color: #E4E4E7; padding: 6px 9px; }
          .bv { color: #FFFFFF; padding: 6px 9px; }
          h2 { font-size: 20px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #d8dee4; margin: 22px 0 16px 0; }
          .card-img { width: 100%; display: block; margin-bottom: 10px; }
          .cap { font-size: 13.5px; line-height: 1.55; color: #1f2328; margin: 0 0 10px 0; }
          .proj { margin-bottom: 20px; }
        </style></head><body>
          <div class="box">
            <div class="crumb">peryixing-lab / README.md</div>
            <img class="hero-img" src="file://${heroPath}" />
            <p class="intro">HarmonyOS NEXT 与 macOS 原生开发者，AI Agent 技能工程实践者。专注端侧原生架构、本地优先软件与鸿蒙沉浸交互体验。<br/>HarmonyOS NEXT &amp; macOS native developer and AI-agent tooling builder. Crafting local-first apps, native architectures, and immersive experiences.</p>
            <div class="badges">
              <span class="badge"><span class="bk">HARMONYOS NEXT</span><span class="bv" style="background:#3F3F46">ARKTS / ARKUI</span></span>
              <span class="badge"><span class="bk">PINNED PROJECTS</span><span class="bv" style="background:#52525B">6 REPOS</span></span>
              <span class="badge"><span class="bk">NATIVE AI PORT</span><span class="bv" style="background:#7C3AED">KELIVO-ARKTS</span></span>
              <span class="badge"><span class="bk">APPLE SILICON</span><span class="bv" style="background:#27272A">SWIFTUI</span></span>
            </div>
            ${sectionsHtml}
          </div>
        </body></html>`,
        'utf8'
      );
      renderChromeScreenshot(ghPreviewHtml, ghPreviewPng, 944, 3680);
      console.log(`Generated preview renders in ${previewDir}`);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
