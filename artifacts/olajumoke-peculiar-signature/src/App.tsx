import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  Lightbulb,
  Menu,
  MessageCircle,
  MoveUpRight,
  Palette,
  Scissors,
  Sparkles,
  X,
} from 'lucide-react';

import logo from '@assets/facebook_1789877054235_7507288488086170700_1789913660928.jpg';
import heroPortrait from '@assets/grok_1789900297954_1789913661002.jpg';
import streetPortrait from '@assets/grok_1789900238954_1789913660971.jpg';
import burgundyLook from '@assets/grok_1789909921138_1789913661040.jpg';
import aquaLook from '@assets/grok_1789909975867_1789913661079.jpg';
import purplePortrait from '@assets/grok_1789909998342_1789913687121.jpg';
import blackRedLook from '@assets/grok_1789910022387_1789913687169.jpg';
import maternityLook from '@assets/grok_1789910055462_1789913687206.jpg';
import blackSequin from '@assets/grok_1789910238656_1789913687240.jpg';
import blackSheer from '@assets/grok_1789910260475_1789913687281.jpg';
import purpleTraditional from '@assets/grok_1789910358057_1789913728099.jpg';
import bridalGroup from '@assets/grok_1789910479780_1789913728061.jpg';
import limeLook from '@assets/grok_1789910590729_1789913728021.jpg';
import asoEbi from '@assets/grok_1789910981424_1789913727983.jpg';
import sequinDetail from '@assets/grok_1789911010662_1789913727831.jpg';

type Look = {
  image: string;
  alt: string;
};

const whatsappNumber = '2348035493448';
const lookbookMessage =
  "Hello Olajumoke, I saw a look I love in your Lookbook and I'd like to ask about it.";
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lookbookMessage)}`;
const customRequestHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Olajumoke, I'd like to start a custom request.")}`;

const looks: Look[] = [
  {
    image: heroPortrait,
    alt: 'Woman in a white satin silhouette with a sculptural gele',
  },
  {
    image: blackSequin,
    alt: 'Woman in a black sequinned gown seated outdoors at night',
  },
  {
    image: purpleTraditional,
    alt: 'Woman in a richly embroidered purple traditional outfit',
  },
  {
    image: aquaLook,
    alt: 'Woman in a turquoise peplum top and textured skirt',
  },
  {
    image: limeLook,
    alt: 'Woman in a lime green lace evening gown with a matching gele',
  },
  {
    image: burgundyLook,
    alt: 'Woman in a burgundy Yoruba-inspired outfit with a coral gele',
  },
  {
    image: bridalGroup,
    alt: 'Bride surrounded by friends in coordinated lavender looks',
  },
  {
    image: sequinDetail,
    alt: 'Close detail of a black sequinned dress with sheer sleeves',
  },
  {
    image: maternityLook,
    alt: 'Pregnant woman in a velvet emerald and turquoise dress',
  },
  {
    image: asoEbi,
    alt: 'Blue aso-ebi styling moment with a dramatic gele',
  },
  {
    image: blackRedLook,
    alt: 'Black and red embroidered dress displayed on a mannequin',
  },
  {
    image: blackSheer,
    alt: 'Woman in a black sheer gown with a red gele in a studio',
  },
];

const possibilities = [
  {
    icon: Sparkles,
    title: 'Choose a Look',
    copy: 'Found something you love? Start with one of our featured looks.',
  },
  {
    icon: Palette,
    title: 'Make It Yours',
    copy: 'Change the colour, fabric or details to create a look that feels uniquely yours.',
  },
  {
    icon: Scissors,
    title: 'Bring Your Own Fabric',
    copy: 'Already have the perfect fabric? Bring it and let us create your look with it.',
  },
  {
    icon: Lightbulb,
    title: 'Bring Your Inspiration',
    copy: "Have a design you've seen somewhere else? Show us what you have in mind.",
  },
  {
    icon: Heart,
    title: 'Create Something New',
    copy: "Have an idea of your own? Tell us what you're imagining and let's bring it to life.",
  },
];

const categories = [
  {
    title: 'Bridal',
    copy: 'For the bride and every beautiful moment around her.',
    image: bridalGroup,
    alt: 'Bridal party in coordinated lavender looks',
  },
  {
    title: 'Celebration',
    copy: 'Statement looks for weddings, parties, birthdays and special occasions.',
    image: limeLook,
    alt: 'Woman in a lime green celebration look',
  },
  {
    title: 'Corporate',
    copy: 'Elegant fashion for work, formal occasions and everything in between.',
    image: purplePortrait,
    alt: 'Woman in a purple structured dress',
  },
  {
    title: 'Headpieces',
    copy: 'Fascinators, hatinators and statement headpieces to complete the look.',
    image: aquaLook,
    alt: 'Woman in a turquoise look with a sculptural headpiece',
  },
];

function scrollToSection(id: string, closeMenu?: () => void) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  closeMenu?.();
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const links = [
    ['Home', 'home'],
    ['Collections', 'collections'],
    ['Bespoke', 'bespoke'],
    ['Lookbook', 'lookbook'],
    ['About', 'about'],
  ];

  return (
    <header className="site-header">
      <div className="section-shell nav-wrap">
        <button
          className="brand-lockup"
          onClick={() => scrollToSection('home', close)}
          aria-label="Olajumoke Peculiar Signature home"
          data-testid="button-brand-home"
        >
          <img src={logo} alt="Olajumoke Peculiar Signature gold OP monogram" />
          <span>
            Olajumoke
            <br />
            Peculiar Signature
          </span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(id);
              }}
              data-testid={`link-nav-${id}`}
            >
              {label}
            </a>
          ))}
          <a
            className="nav-cta"
            href={customRequestHref}
            target="_blank"
            rel="noreferrer"
            data-testid="link-nav-whatsapp"
          >
            <MessageCircle size={14} /> Chat on WhatsApp
          </a>
        </nav>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {links.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(id, close);
                }}
                data-testid={`link-mobile-${id}`}
              >
                {label}
              </a>
            ))}
            <a
              href={customRequestHref}
              target="_blank"
              rel="noreferrer"
              onClick={close}
              data-testid="link-mobile-whatsapp"
            >
              Chat on WhatsApp
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

function PossibilityCard({
  icon: Icon,
  title,
  copy,
}: (typeof possibilities)[number]) {
  return (
    <article className="possibility-card">
      <Icon size={24} strokeWidth={1.2} aria-hidden="true" />
      <span className="possibility-number">0{possibilities.findIndex((item) => item.title === title) + 1}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}

function CategoryCard({
  title,
  copy,
  image,
  alt,
}: (typeof categories)[number]) {
  return (
    <a className="category-card" href="#collections">
      <img src={image} alt={alt} loading="lazy" />
      <span className="category-overlay">
        <strong>{title}</strong>
        <small>{copy}</small>
      </span>
    </a>
  );
}

function LookCard({ look }: { look: Look }) {
  return (
    <article className="look-card">
      <img src={look.image} alt={look.alt} loading="lazy" />
      <div className="look-overlay">
        <button
          type="button"
          className="button-ghost"
          onClick={(event) => event.stopPropagation()}
          data-testid="button-select-look"
        >
          Select This Look
        </button>
      </div>
    </article>
  );
}

function Lightbox({
  activeIndex,
  onClose,
  onNext,
  onPrev,
}: {
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const look = looks[activeIndex];
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft') onPrev();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Peculiar lookbook viewer"
      onClick={onClose}
    >
      <div
        className="lightbox"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const distance = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(distance) > 45) distance < 0 ? onNext() : onPrev();
          touchStart.current = null;
        }}
      >
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lookbook viewer"
          data-testid="button-lightbox-close"
        >
          <X size={19} />
        </button>
        <button
          className="lightbox-nav lightbox-prev"
          onClick={onPrev}
          aria-label="Previous look"
          data-testid="button-lightbox-previous"
        >
          <ArrowLeft size={19} />
        </button>
        <button
          className="lightbox-nav lightbox-next"
          onClick={onNext}
          aria-label="Next look"
          data-testid="button-lightbox-next"
        >
          <ArrowRight size={19} />
        </button>
        <div className="lightbox-media">
          <img src={look.image} alt={look.alt} />
        </div>
        <div className="lightbox-copy">
          <span className="eyebrow">
            The Peculiar Lookbook · {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(looks.length).padStart(2, '0')}
          </span>
          <h2 className="serif">A look worth remembering.</h2>
          <p>{look.alt}. Chat with Olajumoke to ask about this look or make it your own.</p>
          <a
            className="button-gold"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            data-testid="link-lightbox-whatsapp"
          >
            <MessageCircle size={15} /> Chat About This Look
          </a>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Olajumoke Peculiar Signature | Bespoke Fashion in Ile-Ife';
    const description =
      'Olajumoke Peculiar Signature is a premium Nigerian women’s fashion atelier in Ile-Ife, creating bespoke and ready-to-wear fashion for every moment worth making a statement.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    const setOg = (property: string, content: string) => {
      let og = document.querySelector(`meta[property="${property}"]`);
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', property);
        document.head.appendChild(og);
      }
      og.setAttribute('content', content);
    };
    setOg('og:title', 'Olajumoke Peculiar Signature | Bespoke Fashion in Ile-Ife');
    setOg('og:description', description);
    setOg('og:type', 'website');
    setOg('og:image', logo);
  }, []);

  const nextLook = () =>
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % looks.length,
    );
  const previousLook = () =>
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + looks.length) % looks.length,
    );

  return (
    <div className="atelier-page">
      <Nav />
      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-photo">
            <img
              src={heroPortrait}
              alt="Olajumoke in a white statement look with a colourful gele"
            />
          </div>
          <div className="hero-content">
            <p className="eyebrow">Olajumoke Peculiar Signature</p>
            <h1 id="hero-title" className="serif">
              Stand Out.
              <br />
              <em>Be Remembered.</em>
            </h1>
            <p className="hero-dek">
              Bespoke and ready-to-wear fashion created for weddings, celebrations,
              special occasions and every moment worth making a statement.
            </p>
            <div className="hero-actions">
              <button
                className="button-gold"
                onClick={() => scrollToSection('collections')}
                data-testid="button-hero-collections"
              >
                Explore Our Looks <ChevronDown size={15} />
              </button>
              <a
                className="button-ghost"
                href={customRequestHref}
                target="_blank"
                rel="noreferrer"
                data-testid="link-hero-whatsapp"
              >
                <MessageCircle size={16} /> Start a Custom Request
              </a>
            </div>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>OP</span>
            <small>made in Ile-Ife</small>
          </div>
        </section>

        <section className="possibilities section-space" id="bespoke" aria-labelledby="possibilities-title">
          <div className="section-shell">
            <div className="section-heading-centered">
              <p className="eyebrow">Your vision, our craft</p>
              <h2 id="possibilities-title" className="serif">
                One Look. <em>Many Possibilities.</em>
              </h2>
              <p>
                See something you love? Choose the look, make it yours, bring your
                own fabric, show us your inspiration, or create something completely
                new.
              </p>
            </div>
            <div className="possibilities-grid">
              {possibilities.map((item) => (
                <PossibilityCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="find-look section-space" aria-labelledby="find-look-title">
          <div className="section-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Explore the collection</p>
                <h2 id="find-look-title" className="serif">
                  Find Your <em>Look.</em>
                </h2>
              </div>
              <p>Explore pieces created for the moments that matter.</p>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <CategoryCard key={category.title} {...category} />
              ))}
            </div>
          </div>
        </section>

        <section className="looks-band" id="collections" aria-labelledby="featured-title">
          <div className="section-shell">
            <div className="band-heading">
              <div>
                <p className="eyebrow">Made for the moment</p>
                <h2 id="featured-title" className="serif">
                  Featured <em>Looks.</em>
                </h2>
              </div>
              <p>A selection of Peculiar looks to inspire your next statement.</p>
            </div>
            <div className="featured-grid">
              {looks.slice(0, 5).map((look) => (
                <LookCard key={look.image} look={look} />
              ))}
            </div>
          </div>
        </section>

        <section className="lookbook section-space" id="lookbook" aria-labelledby="lookbook-title">
          <div className="section-shell">
            <div className="lookbook-intro">
              <div>
                <p className="eyebrow">The Peculiar Lookbook</p>
                <h2 id="lookbook-title" className="serif">
                  The Peculiar <em>Lookbook.</em>
                </h2>
              </div>
              <p>A glimpse of Peculiar looks, beautiful moments and the women who wear them.</p>
            </div>
            <div className="masonry">
              {looks.map((look, index) => (
                <button
                  type="button"
                  className="masonry-card"
                  key={look.image}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Open lookbook image ${index + 1}`}
                  data-testid={`button-lookbook-${index}`}
                >
                  <img src={look.image} alt={look.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="testimonials section-space" aria-labelledby="testimonials-title">
          <div className="section-shell">
            <div className="testimonial-heading">
              <div>
                <p className="eyebrow">Kind words</p>
                <h2 id="testimonials-title" className="serif">
                  What Our <em>Clients Say.</em>
                </h2>
              </div>
              <div className="testimonial-mark" aria-hidden="true">
                “
              </div>
            </div>
            <p className="testimonial-intro">
              Every look is created to make its moment feel even more special.
            </p>
            <div className="testimonial-grid">
              <figure className="quote">
                <p>
                  “The dress came out even better than I imagined. The fitting was
                  perfect and I got so many compliments that day. Thank you so much!”
                </p>
                <cite>— Amaka</cite>
              </figure>
              <figure className="quote">
                <p>
                  “I showed her the style I wanted and she understood exactly what I
                  was going for. I absolutely loved the final look.”
                </p>
                <cite>— Tolu</cite>
              </figure>
              <figure className="quote">
                <p>
                  “Beautiful work and attention to detail. I felt so confident in my
                  outfit and I'm definitely coming back for another occasion.”
                </p>
                <cite>— Blessing</cite>
              </figure>
            </div>
          </div>
        </section>

        <section className="about section-space" id="about" aria-labelledby="about-title">
          <div className="section-shell about-grid">
            <div className="about-image">
              <img src={streetPortrait} alt="Olajumoke in a colourful printed dress on a street" loading="lazy" />
            </div>
            <div className="about-copy">
              <p className="eyebrow">The woman behind the signature</p>
              <h2 id="about-title" className="serif">
                Meet <em>Olajumoke.</em>
              </h2>
              <p>
                Behind every Peculiar look is a desire to help you stand out, feel
                confident and make a lasting impression.
              </p>
              <p>
                From carefully considered details to the final look, Olajumoke
                Peculiar Signature brings together fashion, individuality and the
                beauty of dressing for the moment.
              </p>
              <a className="button-gold" href="#bespoke" onClick={(event) => { event.preventDefault(); scrollToSection('bespoke'); }}>
                Discover Our Story <MoveUpRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="final-title">
          <p className="eyebrow">Make it peculiar</p>
          <h2 id="final-title" className="serif">
            Have Something <em>Peculiar In Mind?</em>
          </h2>
          <p>
            Whether you've found your perfect look, have your own fabric, or simply
            have an idea you'd love to bring to life, let's create something that
            feels uniquely yours.
          </p>
          <div className="final-actions">
            <a className="button-ghost" href={customRequestHref} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> Start Your Custom Request
            </a>
            <a className="button-ghost" href={customRequestHref} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-shell footer-top">
          <div className="footer-brand">
            <img src={logo} alt="Olajumoke Peculiar Signature logo" loading="lazy" />
            <p>
              Bespoke and ready-to-wear fashion for weddings, celebrations, special
              occasions and every moment worth making a statement.
            </p>
          </div>
          <div className="footer-col">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#collections">Collections</a>
            <a href="#bespoke">Bespoke</a>
            <a href="#lookbook">Lookbook</a>
            <a href="#about">About</a>
          </div>
          <div className="footer-col">
            <h3>Contact</h3>
            <a href={customRequestHref} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
            <p>Opposite Olasode Junction, Ile-Ife, Osun State</p>
            <a href="tel:+2348035493448">+234 803 549 3448</a>
          </div>
        </div>
        <div className="section-shell footer-bottom">
          <span>© 2026 Olajumoke Peculiar Signature. All rights reserved.</span>
          <span>Made in Ile-Ife, Nigeria</span>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href={customRequestHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Olajumoke"
        data-testid="link-floating-whatsapp"
      >
        <MessageCircle size={22} />
        <span>Chat with Olajumoke</span>
      </a>

      {activeIndex !== null && (
        <Lightbox
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNext={nextLook}
          onPrev={previousLook}
        />
      )}
    </div>
  );
}

export default Home;