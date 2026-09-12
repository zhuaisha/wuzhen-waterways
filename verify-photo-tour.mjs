import { execFileSync } from 'node:child_process';
import { writeFileSync, openSync, closeSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fitImage, boundView, zoomAt } from './src/lib/photoView.js';

const cli = 'C:/Users/zhuaisha/AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe';
const out = 'D:/English work/outputs';
const checks = [];
const run = (...args) => {
  const logPath = `${out}/browser-command.json`;
  const fd = openSync(logPath, 'w');
  try { execFileSync(cli, ['--session', 'wuzhen-check', '--json', ...args], { stdio: ['ignore', fd, 'inherit'], timeout: 45000, windowsHide: true }); }
  finally { closeSync(fd); }
  const raw = readFileSync(logPath, 'utf8');
  const data = JSON.parse(raw.trim());
  if (!data.success) throw new Error(JSON.stringify(data));
  return data.data;
};
const evaluate = (code) => run('eval', code).result;
const check = (name, condition, details = '') => { assert.ok(condition, `${name}: ${JSON.stringify(details)}`); checks.push({ name, pass: true, details }); console.log(`PASS ${name}`); };
const settled = (test) => evaluate(`new Promise((resolve,reject)=>{let start=performance.now();function step(){if(${test})resolve(true);else if(performance.now()-start>10000)reject(new Error('Condition timeout: ${test.replaceAll("'", '')}'));else requestAnimationFrame(step)}step()})`);

try {
  assert.deepEqual(fitImage(2000, 1000, 1000, 800), { width: 1000, height: 500 });
  assert.deepEqual(boundView({ scale: 8, x: 9999, y: -9999 }, { width: 1000, height: 500 }, { width: 1000, height: 800 }), { scale: 4, x: 1500, y: -600 });
  assert.deepEqual(zoomAt({ scale: 1, x: 0, y: 0 }, 2, { x: 100, y: 0 }, { width: 1000, height: 500 }, { width: 1000, height: 800 }), { scale: 2, x: -100, y: 0 });
  check('Fit, pan boundaries and cursor-anchored zoom unit tests', true);
  run('open', 'http://127.0.0.1:5174');
  run('set', 'viewport', '1440', '960');
  run('set', 'media', 'light', 'reduced-motion');
  run('snapshot', '-i');
  settled('document.querySelector(".photo-hero__background img")?.complete');
  check('Hero image and foreground render', evaluate('document.querySelector(".photo-hero__background img").naturalWidth > 0 && document.querySelector(".photo-hero h1").textContent.includes("WUZHEN")'));
  check('Exactly three photo stories, no WebGL canvases', evaluate('document.querySelectorAll(".photo-story").length===3 && document.querySelectorAll("canvas").length===0'));
  check('Desktop has no horizontal overflow', evaluate('document.documentElement.scrollWidth <= innerWidth'));
  run('screenshot', `${out}/wuzhen-desktop.png`);
  run('click', '.tour-button--primary');
  settled('document.querySelector(".photo-viewer__image")?.naturalWidth > 0');
  check('Native dialog fills viewport and locks page', evaluate('document.querySelector("dialog").open && document.body.style.position === "fixed" && Math.abs(document.querySelector("dialog").getBoundingClientRect().height-innerHeight)<2'));
  check('Close button receives focus', evaluate('document.activeElement.getAttribute("aria-label") === "关闭图片浏览"'));
  run('press', 'Shift+Tab');
  check('Focus remains in modal', evaluate('document.querySelector("dialog").contains(document.activeElement)'));
  run('click', '[aria-label="放大图片"]');
  check('Zoom button increases scale', evaluate('document.querySelector(".photo-viewer__zoom").textContent === "125%"'));
  run('press', '+');
  check('Keyboard zoom works', evaluate('parseInt(document.querySelector(".photo-viewer__zoom").textContent)>125'));
  const rect = evaluate('(()=>{const r=document.querySelector(".photo-viewer__stage").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()');
  const before = evaluate('document.querySelector(".photo-viewer__image").style.transform');
  run('mouse', 'move', String(rect.x), String(rect.y));
  run('mouse', 'down');
  run('mouse', 'move', String(rect.x + 100), String(rect.y + 35));
  run('mouse', 'up');
  check('Mouse drag pans enlarged photograph', evaluate('document.querySelector(".photo-viewer__image").style.transform') !== before);
  evaluate('(()=>{const stage=document.querySelector(".photo-viewer__stage");const r=stage.getBoundingClientRect();stage.dispatchEvent(new WheelEvent("wheel", {deltaY:-200,clientX:r.x+r.width/2,clientY:r.y+r.height/2,bubbles:true,cancelable:true}));})()');
  settled('parseInt(document.querySelector(".photo-viewer__zoom").textContent)>156');
  check('Wheel event handler zooms at image coordinates', evaluate('parseInt(document.querySelector(".photo-viewer__zoom").textContent)>156'));
  run('press', '0');
  check('Reset restores fitted image', evaluate('document.querySelector(".photo-viewer__zoom").textContent === "100%"'));
  run('click', '[aria-label="下一张"]');
  settled('document.querySelector(".photo-viewer__image")?.naturalWidth>0 && document.querySelector("#viewer-title").textContent.includes("Waterways")');
  check('Next photograph and source attribution', evaluate('document.querySelector(".photo-viewer__credit").textContent.includes("Immanuel Giel")'));
  run('find', 'text', '系统全屏', 'click');
  check('System fullscreen or explicit fallback', evaluate('!!document.fullscreenElement || !![...document.querySelectorAll("[role=status]")].find(x=>x.textContent.includes("全屏"))'));
  if (evaluate('!!document.fullscreenElement')) run('find', 'text', '退出系统全屏', 'click');
  run('screenshot', `${out}/wuzhen-viewer.png`);
  run('press', 'Escape');
  check('Escape closes modal, restores focus and scroll', evaluate('!document.querySelector("dialog") && document.body.style.position!=="fixed" && document.activeElement.classList.contains("tour-button--primary") && Math.abs(scrollY)<2'));
  run('scrollintoview', '#story-bridge');
  settled('Math.abs(document.querySelector("#story-bridge").getBoundingClientRect().top)<200');
  run('screenshot', `${out}/wuzhen-story.png`);
  run('scrollintoview', '#story-bridge .photo-story__copy button');
  const previousScroll = evaluate('scrollY');
  run('click', '#story-bridge .photo-story__copy button');
  settled('document.querySelector(".photo-viewer__image")?.naturalWidth>0');
  const lockedScroll = evaluate('-parseFloat(document.body.style.top)');
  run('click', '[aria-label="关闭图片浏览"]');
  const restoredScroll = evaluate('scrollY');
  check('Opening from chapter restores reading position', Math.abs(restoredScroll - lockedScroll) < 3, {previousScroll,lockedScroll,restoredScroll});
  run('set', 'viewport', '390', '844');
  evaluate('scrollTo({top:0,behavior:"instant"})');
  check('Mobile has no horizontal overflow', evaluate('document.documentElement.scrollWidth<=innerWidth'));
  run('screenshot', `${out}/wuzhen-mobile.png`);
  run('click', '.tour-button--primary');
  settled('document.querySelector(".photo-viewer__image")?.naturalWidth>0');
  check('Mobile modal close and controls are onscreen', evaluate('[...document.querySelectorAll("dialog button")].every(b=>{let r=b.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth && r.height>=44})'));
  run('click', '[aria-label="放大图片"]');
  check('Mobile zoom control works', evaluate('document.querySelector(".photo-viewer__zoom").textContent === "125%"'));
  run('screenshot', `${out}/wuzhen-mobile-viewer.png`);
  run('set', 'viewport', '844', '390');
  check('Landscape controls remain onscreen', evaluate('[...document.querySelectorAll("dialog button")].every(b=>{let r=b.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight && r.right<=innerWidth})'));
  run('click', '[aria-label="关闭图片浏览"]');
  run('set', 'viewport', '320', '720');
  check('320px layout does not overflow', evaluate('document.documentElement.scrollWidth<=innerWidth'));
  run('focus', '.tour-button--primary');
  run('press', 'Enter');
  settled('document.querySelector(".photo-viewer__image")?.naturalWidth>0');
  check('320px viewer toolbar fits', evaluate('document.querySelector("dialog").scrollWidth<=innerWidth'));
  // Failure injection exercises the explicit retry state without changing assets.
  evaluate('document.querySelector(".photo-viewer__image").dispatchEvent(new Event("error"))');
  check('Image loading error is actionable', evaluate('!!document.querySelector("[role=alert]") && document.querySelector("[role=alert]").textContent.includes("重新加载")'));
  run('find', 'text', '重新加载', 'click');
  settled('document.querySelector(".photo-viewer__image")?.naturalWidth>0');
  check('Retry recovers image loading', evaluate('!document.querySelector("[role=alert]")'));
  run('press', 'Escape');
  const errors = run('errors');
  check('No uncaught browser errors', !errors.errors?.length, errors);
  const audit = run('a11y', '--selector', '.photo-tour', '--json');
  writeFileSync(`${out}/wuzhen-accessibility.json`, JSON.stringify(audit, null, 2));
  writeFileSync(`${out}/wuzhen-test-results.json`, JSON.stringify({ checks, note: 'Chromium desktop and responsive emulation. Physical phone pinch gestures and Safari not tested.' }, null, 2));
  console.log(`All ${checks.length} checks passed.`);
} catch (error) {
  try { console.error('PAGE STATE', JSON.stringify(evaluate('({url:location.href,dialog:document.querySelector("dialog")?.outerHTML,scrollY,bodyStyle:document.body.style.cssText})'))); run('screenshot', `${out}/test-failure.png`); } catch {}
  writeFileSync(`${out}/wuzhen-test-results.json`, JSON.stringify({ checks, error: String(error) }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  try { run('close'); } catch {}
}
