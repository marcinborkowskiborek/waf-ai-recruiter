import Image from 'next/image';

export function Hero() {
  return (
    <section className="text-center space-y-6 py-16">
      <Image
        src="/waf-logo.png"
        alt="WeAreFuture"
        width={240}
        height={60}
        className="mx-auto mb-8 invert brightness-200"
      />
      <h1 className="text-4xl font-light tracking-tight">
        AI <span className="text-primary font-bold">Recruiter</span> Demo
      </h1>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
        Wpisz rolę, którą rekrutujesz. AI przeszuka publicznie dostępne źródła
        i w kilkadziesiąt sekund znajdzie potencjalnych kandydatów.
      </p>
    </section>
  );
}
