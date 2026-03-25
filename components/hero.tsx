import Image from 'next/image';

export function Hero() {
  return (
    <section className="text-center space-y-6 py-16">
      <a href="https://wearefuture.ai" target="_blank" rel="noopener noreferrer">
        <Image
          src="/waf-logo.png"
          alt="WeAreFuture"
          width={240}
          height={60}
          className="mx-auto mb-8 brightness-0 invert"
        />
      </a>
      <h1 className="text-4xl font-light tracking-tight">
        Znajdź dopasowanych kandydatów <span className="text-primary font-bold">w 60 sekund</span>
      </h1>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
        Bez LinkedIn Recruitera. Bez subskrypcji. Wklej opis stanowiska &mdash; resztę zrobi AI.
      </p>
    </section>
  );
}
