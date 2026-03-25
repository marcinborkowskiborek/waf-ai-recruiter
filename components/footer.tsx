export function Footer() {
  return (
    <footer className="text-center py-8 space-y-2">
      <p className="text-sm text-muted-foreground">
        Rozwiązanie zbudowane przez{' '}
        <a
          href="https://www.linkedin.com/in/marcin-borkowski/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Marcin Borkowski
        </a>
      </p>
      <p className="text-sm text-muted-foreground">
        <a
          href="https://wearefuture.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          WeAreFuture
        </a>
        {' '}&mdash; szkolenia, doradztwo i wdrożenia AI dla średnich i dużych firm.
      </p>
    </footer>
  );
}
