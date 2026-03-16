import { useEffect, useRef, useState } from 'react';

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

export const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = 'black',
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;
    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '999px',
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

export const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'black',
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        borderRadius: '999px',
        backgroundColor: eyeColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'all 0.15s ease-out',
      }}
    >
      {!isBlinking && (
        <div
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            borderRadius: '999px',
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

interface AnimatedCharactersProps {
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
  typingTrigger?: number;
  errorTrigger?: number;
}

export function AnimatedCharacters({
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
  typingTrigger = 0,
  errorTrigger = 0,
}: AnimatedCharactersProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [typingPulse, setTypingPulse] = useState(false);
  const [isErrorReacting, setIsErrorReacting] = useState(false);
  const [errorOffset, setErrorOffset] = useState(0);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 入场动画 — 双帧 rAF 确保浏览器先渲染初始状态
  useEffect(() => {
    let raf1: number;
    let raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setHasEntered(true);
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);

  // 登录失败 — 抖动 + 表情反应
  useEffect(() => {
    if (errorTrigger <= 0) return;
    setIsErrorReacting(true);
    setIsLookingAtEachOther(false);
    setTypingPulse(false);

    // 抖动
    const steps = [-12, 10, -8, 6, -4, 0];
    steps.forEach((value, index) => {
      window.setTimeout(() => setErrorOffset(value), index * 70);
    });

    // 抖动结束后保持表情 1.2 秒再恢复
    const resetTimer = window.setTimeout(() => {
      setErrorOffset(0);
      setIsErrorReacting(false);
    }, steps.length * 70 + 1200);
    return () => window.clearTimeout(resetTimer);
  }, [errorTrigger]);

  // 紫色眨眼
  useEffect(() => {
    const rand = () => Math.random() * 4000 + 3000;
    const schedule = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); schedule(); }, 150);
      }, rand());
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // 黑色眨眼
  useEffect(() => {
    const rand = () => Math.random() * 4000 + 3000;
    const schedule = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); schedule(); }, 150);
      }, rand());
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // 输入时互看
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      setTypingPulse(true);
      const timer = window.setTimeout(() => {
        setIsLookingAtEachOther(false);
        setTypingPulse(false);
      }, 520);
      return () => window.clearTimeout(timer);
    }
    setIsLookingAtEachOther(false);
    setTypingPulse(false);
  }, [isTyping, typingTrigger]);

  // 紫色偷看密码
  useEffect(() => {
    if (passwordLength > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    }
    setIsPurplePeeking(false);
  }, [passwordLength, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const isHidingPassword = passwordLength > 0 && !showPassword;
  const peeking = passwordLength > 0 && showPassword;
  const entryT = 'transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.9s cubic-bezier(0.22,1,0.36,1), height 0.7s ease-in-out';
  const groupTransform = isErrorReacting ? `translateX(${errorOffset}px)` : 'translateX(0)';

  return (
    <div style={{ position: 'relative', width: '550px', height: '400px', transform: groupTransform, transition: isErrorReacting ? 'none' : 'transform 0.2s ease-out' }}>

      {/* 紫色角色 */}
      <div
        ref={purpleRef}
        style={{
          position: 'absolute', bottom: 0, left: '70px', width: '180px',
          height: (isTyping || isHidingPassword) ? '440px' : '400px',
          backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1,
          transition: entryT, opacity: hasEntered ? 1 : 0,
          transform: !hasEntered ? 'translateY(80px) scaleY(0.82)'
            : isErrorReacting ? 'skewX(3deg) translateY(-8px)'
            : peeking ? 'skewX(0deg)'
            : (typingPulse || isTyping || isHidingPassword)
              ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
              : `skewX(${purplePos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div style={{
          position: 'absolute', display: 'flex', gap: '32px',
          left: peeking ? '20px' : isLookingAtEachOther ? '55px' : `${45 + purplePos.faceX}px`,
          top: peeking ? '35px' : isLookingAtEachOther ? '65px' : `${40 + purplePos.faceY}px`,
          transition: 'all 0.7s ease-in-out',
        }}>
          <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
            forceLookX={isErrorReacting ? 0 : peeking ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={isErrorReacting ? 6 : peeking ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
          <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
            forceLookX={isErrorReacting ? 0 : peeking ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={isErrorReacting ? 6 : peeking ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
        </div>
        {/* 嘴巴 */}
        <div style={{
          position: 'absolute', width: isErrorReacting ? '14px' : '18px', height: isErrorReacting ? '14px' : '8px',
          border: isErrorReacting ? '2px solid #2D2D2D' : '2px solid #ffffff',
          borderTop: isErrorReacting ? '2px solid #2D2D2D' : 'none', borderLeft: isErrorReacting ? '2px solid #2D2D2D' : 'none', borderRight: isErrorReacting ? '2px solid #2D2D2D' : 'none',
          borderRadius: isErrorReacting ? '999px' : '0 0 12px 12px',
          left: peeking ? '80px' : `${82 + purplePos.faceX * 0.35}px`,
          top: isErrorReacting ? '72px' : peeking ? '78px' : `${82 + purplePos.faceY * 0.35}px`,
          transition: 'all 0.3s ease-in-out',
        }} />
      </div>

      {/* 黑色角色 */}
      <div
        ref={blackRef}
        style={{
          position: 'absolute', bottom: 0, left: '240px', width: '120px', height: '310px',
          backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2,
          transition: entryT, opacity: hasEntered ? 1 : 0,
          transform: !hasEntered ? 'translateY(110px) scaleY(0.78)'
            : isErrorReacting ? 'skewX(-3deg) translateY(-6px)'
            : peeking ? 'skewX(0deg)'
            : isLookingAtEachOther
              ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
              : (typingPulse || isTyping || isHidingPassword)
                ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                : `skewX(${blackPos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div style={{
          position: 'absolute', display: 'flex', gap: '24px',
          left: peeking ? '10px' : isLookingAtEachOther ? '32px' : `${26 + blackPos.faceX}px`,
          top: peeking ? '28px' : isLookingAtEachOther ? '12px' : `${32 + blackPos.faceY}px`,
          transition: 'all 0.7s ease-in-out',
        }}>
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
            forceLookX={isErrorReacting ? 0 : peeking ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={isErrorReacting ? 5 : peeking ? -4 : isLookingAtEachOther ? -4 : undefined} />
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
            forceLookX={isErrorReacting ? 0 : peeking ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={isErrorReacting ? 5 : peeking ? -4 : isLookingAtEachOther ? -4 : undefined} />
        </div>
      </div>

      {/* 橙色角色 */}
      <div
        ref={orangeRef}
        style={{
          position: 'absolute', bottom: 0, left: 0, width: '240px', height: '200px', zIndex: 3,
          backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0',
          transition: entryT, opacity: hasEntered ? 1 : 0,
          transform: !hasEntered ? 'translateY(120px) scale(0.88)'
            : peeking ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div style={{
          position: 'absolute', display: 'flex', gap: '32px',
          left: peeking ? '50px' : `${82 + (orangePos.faceX || 0)}px`,
          top: peeking ? '85px' : `${90 + (orangePos.faceY || 0)}px`,
          transition: 'all 0.2s ease-out',
        }}>
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
        </div>
        {/* 嘴巴 */}
        <div style={{
          position: 'absolute',
          width: isErrorReacting ? '16px' : '26px',
          height: isErrorReacting ? '16px' : '12px',
          border: isErrorReacting ? '3px solid #2D2D2D' : '3px solid #2D2D2D',
          borderTop: isErrorReacting ? '3px solid #2D2D2D' : 'none',
          borderLeft: isErrorReacting ? '3px solid #2D2D2D' : 'none',
          borderRight: isErrorReacting ? '3px solid #2D2D2D' : 'none',
          borderRadius: isErrorReacting ? '999px' : '0 0 18px 18px',
          left: peeking ? '98px' : `${104 + (orangePos.faceX || 0) * 0.45}px`,
          top: isErrorReacting ? '118px' : peeking ? '116px' : `${122 + (orangePos.faceY || 0) * 0.45}px`,
          transition: 'all 0.3s ease-in-out',
        }} />
      </div>

      {/* 黄色角色 */}
      <div
        ref={yellowRef}
        style={{
          position: 'absolute', bottom: 0, left: '310px', width: '140px', height: '230px',
          backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4,
          transition: entryT, opacity: hasEntered ? 1 : 0,
          transform: !hasEntered ? 'translateY(100px) scaleY(0.84)'
            : peeking ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div style={{
          position: 'absolute', display: 'flex', gap: '24px',
          left: peeking ? '20px' : `${52 + (yellowPos.faceX || 0)}px`,
          top: peeking ? '35px' : `${40 + (yellowPos.faceY || 0)}px`,
          transition: 'all 0.2s ease-out',
        }}>
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
        </div>
        {/* 嘴巴 */}
        <div style={{
          position: 'absolute',
          width: isErrorReacting ? '30px' : '80px',
          height: isErrorReacting ? '10px' : '4px',
          backgroundColor: isErrorReacting ? 'transparent' : '#2D2D2D',
          borderRadius: isErrorReacting ? '0' : '999px',
          border: isErrorReacting ? '3px solid #2D2D2D' : 'none',
          borderTop: isErrorReacting ? 'none' : 'none',
          borderBottomLeftRadius: isErrorReacting ? '0' : '999px',
          borderBottomRightRadius: isErrorReacting ? '0' : '999px',
          borderTopLeftRadius: isErrorReacting ? '15px' : '999px',
          borderTopRightRadius: isErrorReacting ? '15px' : '999px',
          left: peeking ? '10px' : isErrorReacting ? `${52 + (yellowPos.faceX || 0)}px` : `${40 + (yellowPos.faceX || 0)}px`,
          top: peeking ? '88px' : isErrorReacting ? '84px' : `${88 + (yellowPos.faceY || 0)}px`,
          transition: 'all 0.3s ease-in-out',
        }} />
      </div>
    </div>
  );
}

export default AnimatedCharacters;
