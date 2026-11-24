import { useState } from 'react';
import { COMPANY, SOCIAL_LINKS } from '../config/site';
import { SOCIAL_ICONS } from './icons';

function CompanyLogo() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="footer__wordmark">{COMPANY.name}</span>;
  }
  return (
    <img
      className="footer__logo"
      src={COMPANY.logoSrc}
      alt={`${COMPANY.name} logo`}
      height="28"
      onError={() => setFailed(true)}
    />
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <CompanyLogo />
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. Product data from{' '}
            <a href="https://dummyjson.com/docs/products" target="_blank" rel="noopener noreferrer">
              DummyJSON
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>

        <nav aria-label="Social media">
          <ul className="social">
            {SOCIAL_LINKS.map(({ id, label, href }) => {
              const Icon = SOCIAL_ICONS[id];
              return (
                <li key={id}>
                  <a
                    className="social__link"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    title={label}
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
