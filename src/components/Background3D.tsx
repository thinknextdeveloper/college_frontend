// Shared animated background: glowing orbs + floating 3D glass cubes
function Cube({ size, duration, className }: { size: number; duration: number; className: string }) {
  const half = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  return (
    <div
      aria-hidden
      className={`anim-float pointer-events-none absolute ${className}`}
      style={{ perspective: 800, animationDuration: `${duration + 4}s` }}
    >
      <div
        className="preserve-3d anim-spin-3d relative"
        style={{ width: size, height: size, animationDuration: `${duration}s` }}
      >
        {faces.map((t, i) => (
          <div key={i} className="absolute inset-0 border border-white/40 bg-white/10" style={{ transform: t }} />
        ))}
      </div>
    </div>
  );
}

export default function Background3D() {
  return (
    <>
      <div className="anim-orb pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div
        className="anim-orb pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl"
        style={{ animationDelay: '-5s' }}
      />
      <Cube size={70} duration={16} className="left-[6%] top-[14%]" />
      <Cube size={46} duration={22} className="right-[8%] top-[10%]" />
      <Cube size={90} duration={26} className="bottom-[8%] left-[8%]" />
      <Cube size={54} duration={19} className="bottom-[14%] right-[8%]" />
    </>
  );
}