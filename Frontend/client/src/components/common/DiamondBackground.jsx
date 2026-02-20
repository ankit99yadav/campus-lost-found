const DiamondBackground = () => {
  return (
    <div className="diamond-bg" aria-hidden="true">
      {/* Floating diamonds - Layer 1 (slow, large) */}
      <div className="diamond" style={{'--size':'28px','--opacity':0.28,'--duration':'18s','--delay':'0s','--tx':'-200px','--ty':'-350px','--endScale':0.6,left:'10%',top:'80%'}} />
      <div className="diamond orange filled" style={{'--size':'22px','--opacity':0.30,'--duration':'22s','--delay':'2s','--tx':'180px','--ty':'-400px','--endScale':0.8,left:'30%',top:'90%'}} />
      <div className="diamond glow" style={{'--size':'18px','--opacity':0.32,'--duration':'16s','--delay':'1s','--tx':'-150px','--ty':'-300px','--endScale':0.5,left:'55%',top:'85%'}} />
      <div className="diamond orange" style={{'--size':'32px','--opacity':0.25,'--duration':'25s','--delay':'4s','--tx':'100px','--ty':'-500px','--endScale':0.7,left:'75%',top:'95%'}} />
      <div className="diamond filled" style={{'--size':'16px','--opacity':0.28,'--duration':'14s','--delay':'3s','--tx':'-120px','--ty':'-280px','--endScale':0.9,left:'90%',top:'75%'}} />
      <div className="diamond orange glow" style={{'--size':'20px','--opacity':0.30,'--duration':'19s','--delay':'6s','--tx':'-160px','--ty':'-350px','--endScale':0.6,left:'50%',top:'95%'}} />

      {/* Floating diamonds - Layer 2 (medium speed) */}
      <div className="diamond orange" style={{'--size':'20px','--opacity':0.28,'--duration':'12s','--delay':'0s','--tx':'250px','--ty':'-320px','--endScale':0.6,left:'5%',top:'70%'}} />
      <div className="diamond glow" style={{'--size':'14px','--opacity':0.30,'--duration':'15s','--delay':'5s','--tx':'-200px','--ty':'-350px','--endScale':0.7,left:'40%',top:'100%'}} />
      <div className="diamond orange filled" style={{'--size':'24px','--opacity':0.25,'--duration':'20s','--delay':'7s','--tx':'160px','--ty':'-450px','--endScale':0.5,left:'60%',top:'90%'}} />
      <div className="diamond" style={{'--size':'12px','--opacity':0.35,'--duration':'10s','--delay':'2s','--tx':'-100px','--ty':'-250px','--endScale':1.2,left:'85%',top:'65%'}} />
      <div className="diamond orange glow" style={{'--size':'26px','--opacity':0.22,'--duration':'24s','--delay':'6s','--tx':'140px','--ty':'-380px','--endScale':0.8,left:'20%',top:'85%'}} />

      {/* Floating diamonds - Layer 3 (fast, small) */}
      <div className="diamond orange" style={{'--size':'10px','--opacity':0.40,'--duration':'8s','--delay':'1s','--tx':'-80px','--ty':'-200px','--endScale':0.4,left:'15%',top:'60%'}} />
      <div className="diamond filled" style={{'--size':'8px','--opacity':0.40,'--duration':'7s','--delay':'3s','--tx':'120px','--ty':'-180px','--endScale':0.6,left:'45%',top:'55%'}} />
      <div className="diamond orange" style={{'--size':'12px','--opacity':0.35,'--duration':'9s','--delay':'0s','--tx':'-140px','--ty':'-220px','--endScale':0.8,left:'70%',top:'70%'}} />
      <div className="diamond glow" style={{'--size':'10px','--opacity':0.35,'--duration':'6s','--delay':'4s','--tx':'90px','--ty':'-160px','--endScale':1.3,left:'95%',top:'50%'}} />
      <div className="diamond orange filled" style={{'--size':'9px','--opacity':0.38,'--duration':'7s','--delay':'2s','--tx':'100px','--ty':'-190px','--endScale':0.5,left:'35%',top:'65%'}} />

      {/* Right-to-left floating diamonds */}
      <div className="diamond orange" style={{'--size':'20px','--opacity':0.28,'--duration':'19s','--delay':'3s','--tx':'-300px','--ty':'-200px','--endScale':0.5,left:'100%',top:'30%'}} />
      <div className="diamond filled" style={{'--size':'16px','--opacity':0.28,'--duration':'17s','--delay':'8s','--tx':'-350px','--ty':'-150px','--endScale':0.7,left:'100%',top:'60%'}} />
      <div className="diamond orange glow" style={{'--size':'24px','--opacity':0.25,'--duration':'22s','--delay':'1s','--tx':'-400px','--ty':'-100px','--endScale':0.6,left:'100%',top:'45%'}} />

      {/* Left-to-right floating */}
      <div className="diamond glow" style={{'--size':'18px','--opacity':0.26,'--duration':'21s','--delay':'5s','--tx':'400px','--ty':'-180px','--endScale':0.5,left:'-5%',top:'40%'}} />
      <div className="diamond orange" style={{'--size':'14px','--opacity':0.30,'--duration':'13s','--delay':'9s','--tx':'350px','--ty':'-250px','--endScale':0.8,left:'-5%',top:'70%'}} />
      <div className="diamond orange filled" style={{'--size':'18px','--opacity':0.25,'--duration':'16s','--delay':'4s','--tx':'380px','--ty':'-200px','--endScale':0.6,left:'-5%',top:'50%'}} />

      {/* Pulsing diamonds at fixed spots */}
      <div className="diamond-pulse" style={{'--size':'40px','--delay':'0s',left:'8%',top:'15%'}} />
      <div className="diamond-pulse orange" style={{'--size':'30px','--delay':'1s',left:'25%',top:'35%'}} />
      <div className="diamond-pulse" style={{'--size':'35px','--delay':'2s',left:'50%',top:'10%'}} />
      <div className="diamond-pulse orange" style={{'--size':'25px','--delay':'0.5s',left:'72%',top:'25%'}} />
      <div className="diamond-pulse" style={{'--size':'38px','--delay':'1.5s',left:'88%',top:'40%'}} />
      <div className="diamond-pulse orange" style={{'--size':'28px','--delay':'3s',left:'15%',top:'55%'}} />
      <div className="diamond-pulse" style={{'--size':'32px','--delay':'2.5s',left:'65%',top:'50%'}} />
      <div className="diamond-pulse orange" style={{'--size':'22px','--delay':'0.8s',left:'42%',top:'65%'}} />
      <div className="diamond-pulse" style={{'--size':'36px','--delay':'1.8s',left:'92%',top:'70%'}} />

      {/* Sparkle dots */}
      <div className="sparkle-dot" style={{'--delay':'0s',left:'12%',top:'20%'}} />
      <div className="sparkle-dot orange" style={{'--delay':'0.5s',left:'28%',top:'45%'}} />
      <div className="sparkle-dot" style={{'--delay':'1s',left:'48%',top:'15%'}} />
      <div className="sparkle-dot orange" style={{'--delay':'1.5s',left:'68%',top:'55%'}} />
      <div className="sparkle-dot" style={{'--delay':'2s',left:'82%',top:'30%'}} />
      <div className="sparkle-dot orange" style={{'--delay':'2.5s',left:'35%',top:'70%'}} />
      <div className="sparkle-dot" style={{'--delay':'0.8s',left:'58%',top:'80%'}} />
      <div className="sparkle-dot orange" style={{'--delay':'1.2s',left:'90%',top:'60%'}} />
      <div className="sparkle-dot" style={{'--delay':'3s',left:'5%',top:'40%'}} />
      <div className="sparkle-dot orange" style={{'--delay':'1.8s',left:'75%',top:'75%'}} />
      <div className="sparkle-dot" style={{'--delay':'0.3s',left:'20%',top:'85%'}} />
      <div className="sparkle-dot orange" style={{'--delay':'2.2s',left:'55%',top:'35%'}} />
    </div>
  );
};

export default DiamondBackground;
