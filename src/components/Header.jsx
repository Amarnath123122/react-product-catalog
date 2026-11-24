export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <h1 className="header__title">
          <span className="header__badge" aria-hidden="true">◆</span>
          Product Explorer
        </h1>
        <p className="header__subtitle">Browse the product catalog</p>
      </div>
    </header>
  );
}
