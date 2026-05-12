export function Dust({ count = 18 }: { count?: number }) {
  const particles = Array.from({ length: count });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        const dur = 18 + Math.random() * 20;
        const size = 2 + Math.random() * 3;
        return (
          <span
            key={i}
            className="dust-particle"
            style={{
              left: `${left}%`,
              bottom: `-10px`,
              width: size,
              height: size,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}