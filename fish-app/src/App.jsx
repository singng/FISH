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
const fishMoveVideo1 = '/FISHMOVE1.mp4';
const fishMoveVideo2 = '/FISHMOVE2.mp4';
const fishMoveVideo3 = '/FISHMOVE3.mp4';

const STATE = {
  INIT: 'init',
  VIDEO: 'video',
  SLIDE: 'slide',
  RESULT: 'result',
  RESET: 'reset',
};

// 艺术风格介绍映射
const artDescriptions = {
  "Russian Constructivism Fish": "俄罗斯构成主义（Russian Constructivism）是20世纪初起源于俄国的一场激进艺术与设计运动，强调艺术服务于社会革命和工业化目标，反对传统艺术的装饰性与个人主义，主张将艺术与技术、生产相结合，追求功能与形式统一。",
  // 你可以继续补充其它图片名的介绍
};
const defaultDescription = "这是一种独特的艺术风格鱼，融合了艺术与想象力，展现了不止鱼此的美学追求。";

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
  const [videoType, setVideoType] = useState('none'); // 'none' | 'move1' | 'move2' | 'move3'
  const clickTimer = useRef(null);
  const clickCount = useRef(0);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const video3Ref = useRef(null);

  // 记录按下时间和位置
  const pressInfo = useRef({ time: 0, x: 0, y: 0, moved: false, timer: null });
  const MOVE_THRESHOLD = 15; // px
  const LONG_PRESS = 300; // ms

  // 结果卡片渐隐控制
  const [showResultCard, setShowResultCard] = useState(true);

  const [musicOn, setMusicOn] = useState(false); // false: 静音, true: 有声

  // 首页封面点击，渐隐消失
  const handleCoverClick = () => {
    setCoverHide(true);
    setTimeout(() => setShowCover(false), 800); // 动画时长与css一致
  };

  // 单击/双击/三击主图事件
  const handleFishClick = () => {
    if (state !== STATE.INIT) return;
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 1) {
        setVideoType('move1');
        setState(STATE.VIDEO);
        if (video1Ref.current) {
          video1Ref.current.currentTime = 0;
          video1Ref.current.play();
        }
      } else if (clickCount.current === 2) {
        setVideoType('move2');
        setState(STATE.VIDEO);
        if (video2Ref.current) {
          video2Ref.current.currentTime = 0;
          video2Ref.current.play();
        }
      } else if (clickCount.current >= 3) {
        setVideoType('move3');
        setState(STATE.VIDEO);
        if (video3Ref.current) {
          video3Ref.current.currentTime = 0;
          video3Ref.current.play();
        }
      }
      clickCount.current = 0;
    }, 250); // 250ms内统计点击次数
  };

  // 视频播放结束，回到主图
  const handleVideoEnd = () => {
    setVideoType('none');
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
    // if (!pressInfo.current.moved && duration < LONG_PRESS) {
    //   setState(STATE.VIDEO);
    // }
  };

  // 轮播时松开，停止轮播
  const handleSlideEnd = () => {
    if (state === STATE.SLIDE) {
      if (animRef.current) clearInterval(animRef.current);
      setResultIdx(slideIdx);
      setShowResultCard(true); // 进入结果页时重置卡片显示
      setState(STATE.RESULT);
      setShowResult(true);
      isPressing.current = false;
    }
  };

  // 轮播
  const startSlide = () => {
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      setSlideIdx(idx => (idx + 1) % slideImages.length);
    }, slideSpeed);
  };

  // GET按钮点击
  const handleGetClick = () => {
    setShowResultCard(false);
    setTimeout(() => {
      setShowResult(false);
      setTimeout(() => setState(STATE.INIT), 800); // 渐变动画时长
    }, 800); // 卡片渐隐动画时长
  };

  // 渲染
  return (
    <div className="fish-app">
      {/* 右上角信息栏 */}
      <div className="info-bar">
        <span className="info-item">3 TIMES</span>
        <span className="info-sep">|</span>
        <span
          className={`info-item info-music${musicOn ? '' : ' muted'}`}
          onClick={() => setMusicOn(m => !m)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          MUSIC
        </span>
        <span className="info-sep">|</span>
        <span className="info-item">COLLCETION</span>
      </div>
      {showCover && (
        <div className={`cover${coverHide ? ' hide' : ''}`} onClick={handleCoverClick} style={{ zIndex: 2 }}>
          <img
            src={coverImg}
            alt="封面"
            className="cover-img"
            onError={e => { e.target.src = fishImg; }}
          />
        </div>
      )}
      {state === STATE.INIT && (
        <img
          src={fishImg}
          alt="鱼"
          className="fish-img"
          style={{ cursor: 'pointer', zIndex: 1, position: 'relative' }}
          onMouseDown={handlePressStart}
          onMouseMove={handlePressMove}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchMove={handlePressMove}
          onTouchEnd={handlePressEnd}
          draggable={false}
          onClick={handleFishClick}
        />
      )}
      {/* 视频区域，三个video都渲染，display控制显示，提前加载 */}
      <div className="video-placeholder" style={{ display: state === STATE.VIDEO ? 'block' : 'none' }}>
        <video
          ref={video1Ref}
          src={fishMoveVideo1}
          className="video-move"
          width="100%"
          height="auto"
          autoPlay={videoType === 'move1'}
          muted={!musicOn}
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          style={{ display: videoType === 'move1' ? 'block' : 'none' }}
        />
        <video
          ref={video2Ref}
          src={fishMoveVideo2}
          className="video-move"
          width="100%"
          height="auto"
          autoPlay={videoType === 'move2'}
          muted={!musicOn}
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          style={{ display: videoType === 'move2' ? 'block' : 'none' }}
        />
        <video
          ref={video3Ref}
          src={fishMoveVideo3}
          className="video-move"
          width="100%"
          height="auto"
          autoPlay={videoType === 'move3'}
          muted={!musicOn}
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          style={{ display: videoType === 'move3' ? 'block' : 'none' }}
        />
      </div>
      {!showCover && (
        <>
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
              {/* 结果卡片 */}
              <div className={`result-card${showResultCard ? '' : ' fadeout'}`}>
                <div className="result-title">
                  {slideImages[resultIdx].replace(/\.png$/,'').toUpperCase()}
                </div>
                <div className="result-desc">
                  {artDescriptions[slideImages[resultIdx].replace(/\.png$/,'')] || defaultDescription}
                </div>
                <div className="result-text">你, 不止鱼此</div>
                <button className="result-get-btn" onClick={handleGetClick}>GET</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
