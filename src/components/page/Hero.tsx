
export default function PageHero({ title }: { title: string }) {
  return (
    <section className="relative w-full h-[24rem] flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: `url('/scms-circuit-board.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/80 z-10" />
      <div className="relative z-20 text-white px-4">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
      </div>
    </section>
  )
}