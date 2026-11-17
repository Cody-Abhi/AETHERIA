'use client';

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      style={{
        background:
          'linear-gradient(135deg, #D9E4FF 0%, #EBDDFB 28%, #D7F5F2 55%, #FCE6DF 82%, #E3D9FB 100%)',
      }}
    >
      {/* Bokeh Orb 1: Luminous Pearl White (Top Left) */}
      <div
        className="animate-orb-1 absolute -top-20 -left-16 h-[32vw] w-[32vw] min-h-[240px] min-w-[240px] max-h-[460px] max-w-[460px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.92) 0%, rgba(217, 228, 255, 0.55) 58%, transparent 100%)',
        }}
      />

      {/* Bokeh Orb 2: Soft Lavender Glow (Upper Center-Left) */}
      <div
        className="animate-orb-2 absolute top-[14%] left-[22%] h-[26vw] w-[26vw] min-h-[210px] min-w-[210px] max-h-[380px] max-w-[380px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(235, 221, 251, 0.95) 0%, rgba(167, 139, 250, 0.34) 60%, transparent 100%)',
        }}
      />

      {/* Bokeh Orb 3: Mint Aqua Mist (Top Right) */}
      <div
        className="animate-orb-3 absolute top-[8%] right-[6%] h-[30vw] w-[30vw] min-h-[230px] min-w-[230px] max-h-[430px] max-w-[430px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(215, 245, 242, 0.95) 0%, rgba(52, 211, 153, 0.24) 60%, transparent 100%)',
        }}
      />

      {/* Bokeh Orb 4: Pure White Sunbeam Bokeh (Center) */}
      <div
        className="animate-orb-4 absolute top-[38%] left-[44%] h-[24vw] w-[24vw] min-h-[190px] min-w-[190px] max-h-[360px] max-w-[360px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.45) 55%, transparent 100%)',
        }}
      />

      {/* Bokeh Orb 5: Warm Peach Blush (Lower Right) */}
      <div
        className="animate-orb-1 absolute right-[10%] bottom-[10%] h-[31vw] w-[31vw] min-h-[240px] min-w-[240px] max-h-[450px] max-w-[450px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(252, 230, 223, 0.95) 0%, rgba(244, 114, 182, 0.26) 60%, transparent 100%)',
        }}
      />

      {/* Bokeh Orb 6: Sky Cyan Glow (Lower Left) */}
      <div
        className="animate-orb-2 absolute bottom-[12%] left-[8%] h-[28vw] w-[28vw] min-h-[220px] min-w-[220px] max-h-[410px] max-w-[410px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(217, 243, 248, 0.95) 0%, rgba(96, 165, 250, 0.26) 60%, transparent 100%)',
        }}
      />

      {/* Bokeh Orb 7: Warm Golden Pearl (Bottom Center) */}
      <div
        className="animate-orb-3 absolute -bottom-14 left-[36%] h-[25vw] w-[25vw] min-h-[200px] min-w-[200px] max-h-[370px] max-w-[370px] rounded-full opacity-65 blur-[45px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.88) 0%, rgba(251, 191, 36, 0.22) 60%, transparent 100%)',
        }}
      />
    </div>
  );
}
