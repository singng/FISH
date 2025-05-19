import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// 轮播图片文件名（自动生成，实际开发可用接口或FS读取）
const slideImages = [
  "Hyperrealism Fish.png",
  "Cloisonnism Fish.png",
  "Precisionism Fish.png",
  "Dadaism Fish.png",
  "De Stijl Fish.png",
  "Harlem Renaissance Fish.png",
  "Sumi-e Fish.png",
  "Suprematism Fish.png",
  "Dutch Golden Age Fish.png",
  "Tibetan Thangka Fish.png",
  "Scandinavian Fish.png",
  "Russian Constructivism Fish.png",
  "Egyptian Fish.png",
  "Vaporwave Fish.png",
  "Art Nouveau Fish.png",
  "Trompe l'oeil Fish.png",
  "Brutalist Fish.png",
  "Romanticism Fish.png",
  "Memphis Design Fish.png",
  "Baroque Fish.png",
  "Cyberpunk Fish.png",
  "Minimalist Fish.png",
  "Rococo Fish.png",
  "Constructivist Fish.png",
  "Folk Art Fish.png",
  "Futurism Fish.png",
  "Gothic Fish.png",
  "Bauhaus Fish.png",
  "Fauvism Fish.png",
  "Pointillism Fish.png",
  "Abstract Expressionist Fish.png",
  "Neon Fish.png",
  "Medieval Manuscript Fish.png",
  "Psychedelic Fish.png",
  "Children's Book Fish.png",
  "Mosaic Fish.png",
  "Graffiti Fish.png",
  "Chalk Pastel Fish.png",
  "Steampunk Fish.png",
  "Chinese Ink Fish.png",
  "Pixel Art Fish.png",
  "Stained Glass Fish.png",
  "Surrealist Fish.png",
  "Art Deco Fish.png",
  "Impressionist Fish.png",
  "Pop Art Fish.png",
  "Ukiyo-e Fish.png",
  "Watercolor Fish.png"
];

const fishImg = '/fish.png';
const coverImg = '/cover.png'; // 你可以替换为自己的封面图
const slideBase = '/slides/';
const fishMoveVideo = '/FISHMOVE.mp4';

const STATE = {
  INIT: 'init',
  VIDEO: 'video',
  SLIDE: 'slide',
  RESULT: 'result',
  RESET: 'reset',
};

function App() {
  const [showCover, setShowCover] = useState(true);
  const [coverHide, setCoverHide] = useState(false);
  const [state, setState] = useState(STATE.INIT);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideSpeed, setSlideSpeed] = useState(100);
  const [resultIdx, setResultIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const longPressTimer = useRef(null);
  const dragRef = useRef(false);
  const [dragCount, setDragCount] = useState(0);
  const [lastDir, setLastDir] = useState(null);
  const isPressing = useRef(false);

  // 记录按下时间和位置
  const pressInfo = useRef({ time: 0, x: 0, y: 0, moved: false, timer: null });
  const MOVE_THRESHOLD = 15; // px
  const LONG_PRESS = 300; // ms

  // 首页封面点击，渐隐消失
  const handleCoverClick = () => {
    setCoverHide(true);
    setTimeout(() => setShowCover(false), 800); // 动画时长与css一致
  };

  // 点击鱼图，播放视频
  const handleFishClick = () => {
    if (state !== STATE.INIT) return;
    setState(STATE.VIDEO);
  };

  // 视频播放结束，回到主图
  const handleVideoEnd = () => {
    setState(STATE.INIT);
  };

  // 鼠标/手指按下
  const handlePressStart = (e) => {
    if (!(state === STATE.INIT || state === STATE.RESULT)) return;
    isPressing.current = true;
    const isTouch = e.type === 'touchstart';
    const point = isTouch ? e.touches[0] : e;
    pressInfo.current = {
      time: Date.now(),
      x: point.clientX,
      y: point.clientY,
      moved: false,
      timer: setTimeout(() => {}, 999999), // 不自动长按触发
    };
    setDragCount(0);
    setLastDir(null);
  };

  // 鼠标/手指移动
  const handlePressMove = (e) => {
    if (!(state === STATE.INIT || state === STATE.RESULT) || !isPressing.current) return;
    const isTouch = e.type === 'touchmove';
    const point = isTouch ? e.touches[0] : e;
    const dx = point.clientX - pressInfo.current.x;
    const dy = point.clientY - pressInfo.current.y;
    // 只判断水平方向
    if (Math.abs(dx) > MOVE_THRESHOLD) {
      const dir = dx > 0 ? 'right' : 'left';
      if (lastDir && dir !== lastDir) {
        setDragCount(c => {
          const newCount = c + 1;
          if (newCount >= 2) {
            setState(STATE.SLIDE);
            setSlideSpeed(30);
            startSlide();
          }
          return newCount;
        });
      }
      setLastDir(dir);
      pressInfo.current.x = point.clientX; // 重置起点，便于下次判断
    }
  };

  // 鼠标/手指松开
  const handlePressEnd = (e) => {
    isPressing.current = false;
    if (!(state === STATE.INIT || state === STATE.RESULT)) return;
    clearTimeout(pressInfo.current.timer);
    const duration = Date.now() - pressInfo.current.time;
    // 没有移动且时间短，判定为点击
    if (!pressInfo.current.moved && duration < LONG_PRESS) {
      setState(STATE.VIDEO);
    }
  };

  // 轮播时松开，停止轮播
  const handleSlideEnd = () => {
    if (state === STATE.SLIDE) {
      if (animRef.current) clearInterval(animRef.current);
      setResultIdx(slideIdx);
      setState(STATE.RESULT);
      setShowResult(true);
      isPressing.current = false;
      // 3秒后渐变回主图
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowResult(false);
        setTimeout(() => setState(STATE.INIT), 800); // 渐变动画时长
      }, 3000);
    }
  };

  // 轮播
  const startSlide = () => {
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      setSlideIdx(idx => (idx + 1) % slideImages.length);
    }, slideSpeed);
  };

  // 渲染
  return (
    <div className="fish-app">
      {showCover && (
        <div className={`cover${coverHide ? ' hide' : ''}`} onClick={handleCoverClick}>
          <img
            src={coverImg}
            alt="封面"
            className="cover-img"
            onError={e => { e.target.src = fishImg; }}
          />
        </div>
      )}
      {!showCover && (
        <>
          {state === STATE.INIT && (
            <img
              src={fishImg}
              alt="鱼"
              className="fish-img"
              style={{ cursor: 'pointer' }}
              onMouseDown={handlePressStart}
              onMouseMove={handlePressMove}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchMove={handlePressMove}
              onTouchEnd={handlePressEnd}
              draggable={false}
            />
          )}
          {state === STATE.VIDEO && (
            <div className="video-placeholder">
              <video
                src={fishMoveVideo}
                className="video-move"
                width="100%"
                height="auto"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnd}
                style={{ display: 'block' }}
              />
            </div>
          )}
          {state === STATE.SLIDE && (
            <div
              className="slide-area"
              onMouseUp={handleSlideEnd}
              onTouchEnd={handleSlideEnd}
            >
              <img
                src={slideBase + slideImages[slideIdx]}
                alt={slideImages[slideIdx]}
                className="slide-img"
                draggable={false}
              />
              <div className="slide-title">{slideImages[slideIdx].replace(/\.png$/,'')}</div>
              <div className="slide-tip">按住或滑动鱼图，松开停止</div>
            </div>
          )}
          {state === STATE.RESULT && (
            <div className={`result-area${showResult ? '' : ' fadeout'}`}>
              <img
                src={slideBase + slideImages[resultIdx]}
                alt={slideImages[resultIdx]}
                className="slide-img"
                draggable={false}
              />
              <div className="slide-title">{slideImages[resultIdx].replace(/\.png$/,'')}</div>
              <div className="result-text">你，不止鱼此</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
