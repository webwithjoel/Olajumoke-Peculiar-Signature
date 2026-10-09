import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Menu,
  Minus,
  MessageCircle,
  MoveUpRight,
  Palette,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation } from 'wouter';

import logo from '@assets/facebook_1789877054235_7507288488086170700_1789913660928.jpg';
import heroPortrait from '@assets/grok_1789900297954_1789913661002.jpg';
import olajumokePortrait from '@assets/grok_1789909975867_1789914950678.jpg';
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
import NotFound from '@/pages/not-found';
import CustomizePage, { type CustomizationRequest } from '@/pages/customize-a-look';
import ReadyToWearPage, { type ReadyToWearProduct } from '@/pages/ready-to-wear';
import AboutContactPage from '@/pages/about-contact';

type Look = {
  image: string;
  alt: string;
  id?: string;
  title?: string;
  description?: string;
  priceLabel?: string;
};

type CartItem = Look & {
  id: string;
  quantity: number;
  customization?: CustomizationRequest;
};

type CartCheckoutData = {
  expectedDate: string;
  name: string;
  whatsapp: string;
  fulfillment: 'Pickup' | 'Delivery' | '';
  address: string;
  sizePreference: string;
  notes: string;
};

const whatsappNumber = '2348035493448';
const directWhatsAppMessage = "Hello Olajumoke, I’d like to know more about your Peculiar collections.";
const directWhatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(directWhatsAppMessage)}`;
const cartStorageKey = 'olajumoke-peculiar-signature-ready-to-wear-cart';
const checkoutStorageKey = 'olajumoke-peculiar-signature-ready-to-wear-checkout';
const routeBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const readyToWearHref = `${routeBase}ready-to-wear`;
const customizeLookHref = `${routeBase}customize-a-look`;
const aboutContactHref = `${routeBase}about-contact`;
const aboutStoryEyebrow = 'The woman behind the signature';
const aboutStoryTitle = 'Meet Olajumoke.';
const aboutStoryImageAlt = 'Olajumoke in a turquoise embellished outfit';
const aboutStoryParagraphs: string[] = [
  'Behind every Peculiar look is a desire to help you stand out, feel confident and make a lasting impression.',
  'From carefully considered details to the final look, Olajumoke Peculiar Signature brings together fashion, individuality and the beauty of dressing for the moment.',
];

const emptyCheckout: CartCheckoutData = {
  expectedDate: '',
  name: '',
  whatsapp: '',
  fulfillment: '',
  address: '',
  sizePreference: '',
  notes: '',
};

function formatDate(date: string) {
  if (!date) return 'Not specified';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function lookName(look: Look) {
  return look.title ?? 'Peculiar Look';
}

function getCategoryHref(slug: string) {
  const encoded = encodeURIComponent(slug);
  return `${readyToWearHref}?category=${encoded}#${encoded}`;
}

function lookbookWhatsAppHref(look: Look) {
  const message = `Hello Olajumoke, I saw ${lookName(look)} in your Lookbook and I'd like to ask about it.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

const looks: Look[] = [
  {
    image: heroPortrait,
    title: 'Signature White Look',
    alt: 'Woman in a white satin silhouette with a sculptural gele',
  },
  {
    image: blackSequin,
    title: 'Black Sequin Evening Look',
    alt: 'Woman in a black sequinned gown seated outdoors at night',
  },
  {
    image: purpleTraditional,
    title: 'Purple Traditional Look',
    alt: 'Woman in a richly embroidered purple traditional outfit',
  },
  {
    image: aquaLook,
    title: 'Aqua Peplum Look',
    alt: 'Woman in a turquoise peplum top and textured skirt',
  },
  {
    image: limeLook,
    title: 'Lime Celebration Look',
    alt: 'Woman in a lime green lace evening gown with a matching gele',
  },
  {
    image: burgundyLook,
    title: 'Burgundy Yoruba Look',
    alt: 'Woman in a burgundy Yoruba-inspired outfit with a coral gele',
  },
  {
    image: bridalGroup,
    title: 'Lavender Bridal Party Look',
    alt: 'Bride surrounded by friends in coordinated lavender looks',
  },
  {
    image: sequinDetail,
    title: 'Black Sequin Detail',
    alt: 'Close detail of a black sequinned dress with sheer sleeves',
  },
  {
    image: maternityLook,
    title: 'Emerald Maternity Look',
    alt: 'Pregnant woman in a velvet emerald and turquoise dress',
  },
  {
    image: asoEbi,
    title: 'Blue Aso-Ebi Look',
    alt: 'Blue aso-ebi styling moment with a dramatic gele',
  },
  {
    image: blackRedLook,
    title: 'Black and Red Statement Look',
    alt: 'Black and red embroidered dress displayed on a mannequin',
  },
  {
    image: blackSheer,
    title: 'Black Sheer Evening Look',
    alt: 'Woman in a black sheer gown with a red gele in a studio',
  },
];

const possibilities = [
  {
    icon: Sparkles,
    title: 'Choose a Look',
    copy: 'Browse through our Ready-to-Wear Collections.',
    steps: ['Browse the collections', 'Select a look', 'Add to Cart', 'Pick your size', 'Checkout on WhatsApp'],
    action: 'Explore Ready-to-Wear',
    href: readyToWearHref,
  },
  {
    icon: Palette,
    title: 'Customize a Look',
    copy: 'Like a piece, but would like to make an adjustment? Let us know.',
    steps: ['Pick the look', 'Describe the changes you’d like', 'Review your request', 'Send on WhatsApp'],
    action: 'Customize a Look',
    href: customizeLookHref,
  },
];

const categories = [
  {
    title: 'Bridal',
    copy: 'For the bride and every beautiful moment around her.',
    slug: 'bridal',
    image: bridalGroup,
    alt: 'Bridal party in coordinated lavender looks',
  },
  {
    title: 'Owambe & Traditional',
    copy: 'Traditional styles for celebrations and special moments.',
    slug: 'owambe-traditional',
    image: purpleTraditional,
    alt: 'Woman in a richly embroidered purple traditional outfit',
  },
  {
    title: 'Dinner & Special Occasions',
    copy: 'Considered looks for evenings and occasions worth remembering.',
    slug: 'dinner-special-occasions',
    image: limeLook,
    alt: 'Woman in a lime green lace evening gown with a matching gele',
  },
  {
    title: 'Corporate & Formal',
    copy: 'Elegant fashion for work, formal occasions and everything in between.',
    slug: 'corporate-formal',
    image: purplePortrait,
    alt: 'Woman in a purple structured dress',
  },
  {
    title: 'Headpieces & Fascinators',
    copy: 'Fascinators, hatinators and statement headpieces to complete the look.',
    slug: 'headpieces-fascinators',
    image: aquaLook,
    alt: 'Woman in a turquoise look with a sculptural headpiece',
  },
];

const readyToWearProducts: ReadyToWearProduct[] = [
  {
    id: 'bridal-lavender-party',
    slug: 'bridal',
    category: 'bridal',
    categoryLabel: 'Bridal',
    title: 'Lavender Bridal Party Look',
    image: bridalGroup,
    alt: 'Bridal party in coordinated lavender looks',
    description: 'For the bride and every beautiful moment around her.',
    priceLabel: 'Price on request',
  },
  {
    id: 'owambe-purple-traditional',
    slug: 'owambe-traditional',
    category: 'owambe-traditional',
    categoryLabel: 'Owambe & Traditional',
    title: 'Purple Traditional Look',
    image: purpleTraditional,
    alt: 'Woman in a richly embroidered purple traditional outfit',
    description: 'Traditional styles for celebrations and special moments.',
    priceLabel: 'Price on request',
  },
  {
    id: 'dinner-lime-celebration',
    slug: 'dinner-special-occasions',
    category: 'dinner-special-occasions',
    categoryLabel: 'Dinner & Special Occasions',
    title: 'Lime Celebration Look',
    image: limeLook,
    alt: 'Woman in a lime green lace evening gown with a matching gele',
    description: 'Considered looks for evenings and occasions worth remembering.',
    priceLabel: 'Price on request',
  },
  {
    id: 'corporate-purple-structured',
    slug: 'corporate-formal',
    category: 'corporate-formal',
    categoryLabel: 'Corporate & Formal',
    title: 'Purple Structured Look',
    image: purplePortrait,
    alt: 'Woman in a purple structured dress',
    description: 'Elegant fashion for work, formal occasions and everything in between.',
    priceLabel: 'Price on request',
  },
  {
    id: 'headpieces-aqua-peplum',
    slug: 'headpieces-fascinators',
    category: 'headpieces-fascinators',
    categoryLabel: 'Headpieces & Fascinators',
    title: 'Aqua Peplum Look',
    image: aquaLook,
    alt: 'Woman in a turquoise look with a sculptural headpiece',
    description: 'Fascinators, hatinators and statement headpieces to complete the look.',
    priceLabel: 'Price on request',
  },
];

function scrollToSection(id: string, closeMenu?: () => void) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  closeMenu?.();
}

function Nav({
  cartCount,
  onOpenCart,
  isCollectionPage,
  isAboutPage,
}: {
  cartCount: number;
  onOpenCart: () => void;
  isCollectionPage: boolean;
  isAboutPage: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const links = [
    { label: 'Home', href: routeBase, anchor: false },
    { label: 'Ready-to-Wear', href: readyToWearHref, anchor: false },
    { label: 'Customize a Look', href: customizeLookHref, anchor: false },
    { label: 'About / Contact', href: isAboutPage ? '#about-contact-enquiry' : aboutContactHref, anchor: isAboutPage },
  ];

  return (
    <header className={`site-header${isCollectionPage ? ' site-header-light site-header-collection' : ''}`}>
      <div className="section-shell nav-wrap">
        <Link
          className="brand-lockup"
          href={routeBase}
          onClick={() => {
            if (!isCollectionPage) {
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
            }
            close();
          }}
          aria-label="Olajumoke Peculiar Signature home"
          data-testid="button-brand-home"
        >
          <img src={logo} alt="Olajumoke Peculiar Signature gold OP monogram" />
          <span>
            Olajumoke
            <br />
            Peculiar Signature
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(({ label, href, anchor }) => anchor ? (
            <a
              key={label}
              href={href}
              onClick={close}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(/[^a-z]+/g, '-')}`}
            >
              {label}
            </a>
          ) : (
            <Link
              key={label}
              href={href}
              onClick={close}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(/[^a-z]+/g, '-')}`}
            >
              {label}
            </Link>
          ))}
          <a
            className="nav-my-looks nav-cart-link"
            href="#cart"
            onClick={(event) => {
              event.preventDefault();
              onOpenCart();
              close();
            }}
            data-testid="link-nav-cart"
          >
            <ShoppingBag size={15} /> Cart
            {cartCount > 0 && <span>{cartCount}</span>}
          </a>
        </nav>
        <div className="mobile-header-actions">
          <button
            type="button"
            className="mobile-cart-button"
            onClick={onOpenCart}
            aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : 'Open cart'}
            data-testid="button-mobile-cart"
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className="mobile-cart-count">{cartCount}</span>}
          </button>
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {links.map(({ label, href, anchor }) => anchor ? (
              <a
                key={label}
                href={href}
                onClick={close}
                data-testid={`link-mobile-${label.toLowerCase().replaceAll(/[^a-z]+/g, '-')}`}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                onClick={close}
                data-testid={`link-mobile-${label.toLowerCase().replaceAll(/[^a-z]+/g, '-')}`}
              >
                {label}
              </Link>
            ))}
            <a
              href="#cart"
              onClick={(event) => {
                event.preventDefault();
                onOpenCart();
                close();
              }}
              data-testid="link-mobile-cart"
            >
              <ShoppingBag size={15} /> Cart {cartCount > 0 && <span className="mobile-count">{cartCount}</span>}
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

function SiteFooter({ onOpenCart }: { onOpenCart: () => void }) {
  return (
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
          <Link href={routeBase}>Home</Link>
          <Link href={readyToWearHref}>Ready-to-Wear</Link>
          <Link href={customizeLookHref}>Customize a Look</Link>
          <Link href={aboutContactHref}>About / Contact</Link>
          <a
            href="#cart"
            onClick={(event) => {
              event.preventDefault();
              onOpenCart();
            }}
          >
            Cart
          </a>
        </div>
        <div className="footer-col" id="contact">
          <h3>Contact</h3>
          <a href={directWhatsAppHref} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
          <p>Opposite Olasode Junction, Ile-Ife, Osun State</p>
          <a href="tel:+2348035493448">+234 803 549 3448</a>
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <span>© 2026 Olajumoke Peculiar Signature. All rights reserved.</span>
        <span>Made in Ile-Ife, Nigeria</span>
      </div>
    </footer>
  );
}

function PossibilityCard({
  icon: Icon,
  title,
  copy,
  steps,
  action,
  href,
}: (typeof possibilities)[number]) {
  return (
    <article className="possibility-card">
      <Icon size={24} strokeWidth={1.2} aria-hidden="true" />
      <span className="possibility-number">0{possibilities.findIndex((item) => item.title === title) + 1}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      <ol className="possibility-steps">
        {steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <Link className="possibility-cta" href={href}>
        {action} <MoveUpRight size={14} />
      </Link>
    </article>
  );
}

function CategoryCard({
  title,
  copy,
  slug,
  image,
  alt,
}: (typeof categories)[number]) {
  return (
    <Link className="category-card" href={getCategoryHref(slug)} aria-label={`Browse ${title} ready-to-wear`}>
      <img src={image} alt={alt} loading="lazy" />
      <span className="category-overlay">
        <strong>{title}</strong>
        <small>{copy}</small>
        <span className="category-card-action">Explore category <ArrowRight size={16} /></span>
      </span>
    </Link>
  );
}

function LookCard({ look, onSelect }: { look: Look; onSelect: () => void }) {
  return (
    <article className="look-card">
      <img src={look.image} alt={look.alt} loading="lazy" />
      <div className="look-overlay">
        <button
          type="button"
          className="button-ghost"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          data-testid="button-select-look"
        >
          Select This Look
        </button>
      </div>
    </article>
  );
}

function LookModal({
  look,
  onClose,
  onAdd,
}: {
  look: Look;
  onClose: () => void;
  onAdd: (look: Look) => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="look-select-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="look-select-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="form-modal-close" onClick={onClose} aria-label="Close selected look">
          <X size={19} />
        </button>
        <img src={look.image} alt={look.alt} />
        <div className="look-select-copy">
          <p className="eyebrow">Ready-to-wear · Featured look</p>
          <h2 id="look-select-title" className="serif">{lookName(look)}</h2>
          <p>{look.alt}</p>
          <button className="button-gold" type="button" onClick={() => onAdd(look)}>
            <ShoppingBag size={16} /> Select This Look
          </button>
        </div>
      </div>
    </div>
  );
}

function CartModal({
  items,
  checkout,
  checkoutError,
  onCheckoutChange,
  onQuantityChange,
  onRemove,
  onClose,
  onSubmit,
}: {
  items: CartItem[];
  checkout: CartCheckoutData;
  checkoutError: string;
  onCheckoutChange: (field: keyof CartCheckoutData, value: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop cart-backdrop" role="presentation" onClick={onClose}>
      <div
        className="cart-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="form-modal-close" onClick={onClose} aria-label="Close cart">
          <X size={19} />
        </button>
        <div className="cart-modal-heading">
          <p className="eyebrow">Ready-to-wear selections · {items.reduce((total, item) => total + item.quantity, 0)} items</p>
          <h2 id="cart-title" className="serif">Your Cart</h2>
          <p>Review your selected looks and share your order details with Olajumoke on WhatsApp. Prices are confirmed with you there.</p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={30} />
            <h3 className="serif">Your cart is waiting for a look.</h3>
            <p>Browse the ready-to-wear collections and select a look to begin.</p>
            <Link className="button-gold" href={readyToWearHref}>Explore Ready-to-Wear <MoveUpRight size={15} /></Link>
          </div>
        ) : (
          <form className="cart-content" onSubmit={onSubmit}>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.alt} />
                  <div className="cart-item-copy">
                    <span className="eyebrow">{item.customization ? 'Customization request' : 'Ready-to-wear look'}</span>
                    <h3 className="serif">{lookName(item)}</h3>
                    <p>{item.description ?? item.alt}</p>
                    {item.priceLabel && <p className="cart-item-price">{item.priceLabel} · {item.quantity} {item.quantity === 1 ? 'look' : 'looks'}</p>}
                    {item.customization && (
                      <div className="cart-customization-details">
                        <p><strong>Requested change:</strong> {item.customization.adjustmentType || 'Adjustment'} — {item.customization.requestedChanges}</p>
                        <p><strong>Size / measurements:</strong> {item.customization.sizePreference || 'To discuss'}</p>
                        <p><strong>Expected date:</strong> {formatDate(item.customization.expectedDate)}</p>
                        <p><strong>Customer:</strong> {item.customization.customerName} · {item.customization.whatsapp}</p>
                        {item.customization.additionalNotes && <p><strong>Additional notes:</strong> {item.customization.additionalNotes}</p>}
                      </div>
                    )}
                    <div className="cart-item-controls">
                      <div className="quantity-control" aria-label={`Quantity for ${lookName(item)}`}>
                        <button type="button" aria-label="Decrease quantity" onClick={() => onQuantityChange(item.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button className="text-button" type="button" onClick={() => onRemove(item.id)}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-checkout">
              <p className="eyebrow">WhatsApp checkout</p>
              <div className="form-grid">
                <label className="form-field">
                  <span>Expected date</span>
                  <input type="date" required value={checkout.expectedDate} onChange={(event) => onCheckoutChange('expectedDate', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Your Name</span>
                  <input required value={checkout.name} onChange={(event) => onCheckoutChange('name', event.target.value)} placeholder="Your name" />
                </label>
                <label className="form-field">
                  <span>WhatsApp Number</span>
                  <input type="tel" required value={checkout.whatsapp} onChange={(event) => onCheckoutChange('whatsapp', event.target.value)} placeholder="+234..." />
                </label>
                <label className="form-field">
                  <span>Pickup or Delivery</span>
                  <select required value={checkout.fulfillment} onChange={(event) => onCheckoutChange('fulfillment', event.target.value)}>
                    <option value="">Choose one</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </label>
                {checkout.fulfillment === 'Delivery' && (
                  <label className="form-field cart-address-field">
                    <span>Delivery address</span>
                    <textarea required rows={3} value={checkout.address} onChange={(event) => onCheckoutChange('address', event.target.value)} placeholder="Enter your delivery address" />
                  </label>
                )}
                <label className="form-field">
                  <span>Size / measurement preference</span>
                  <input required value={checkout.sizePreference} onChange={(event) => onCheckoutChange('sizePreference', event.target.value)} placeholder="Size or measurements to discuss" />
                </label>
              </div>
              <label className="form-field">
                <span>Additional notes</span>
                <textarea rows={3} value={checkout.notes} onChange={(event) => onCheckoutChange('notes', event.target.value)} placeholder="Anything else Olajumoke should know?" />
              </label>
              {checkoutError && <p className="form-error" role="alert">{checkoutError}</p>}
              <p className="cart-no-pricing">No payment is taken here. Olajumoke will confirm your request with you on WhatsApp.</p>
              <button className="button-gold cart-checkout-button" type="submit">
                <MessageCircle size={16} /> Checkout on WhatsApp
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
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
            href={lookbookWhatsAppHref(look)}
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
  const [location] = useLocation();
  const currentPath = location.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  const collectionPath = readyToWearHref.replace(/\/+$/, '') || '/';
  const customizePath = customizeLookHref.replace(/\/+$/, '') || '/';
  const aboutContactPath = aboutContactHref.replace(/\/+$/, '') || '/';
  const isCollectionPage = currentPath === collectionPath;
  const isCustomizePage = currentPath === customizePath;
  const isAboutPage = currentPath === aboutContactPath;
  const isEditorialSubpage = isCollectionPage || isCustomizePage || isAboutPage;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedLook, setSelectedLook] = useState<Look | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(cartStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [checkout, setCheckout] = useState<CartCheckoutData>(() => {
    if (typeof window === 'undefined') return { ...emptyCheckout };
    try {
      const stored = window.localStorage.getItem(checkoutStorageKey);
      return stored ? { ...emptyCheckout, ...JSON.parse(stored) } : { ...emptyCheckout };
    } catch {
      return { ...emptyCheckout };
    }
  });
  const lookbookTrackRef = useRef<HTMLDivElement>(null);
  const reviewTrackRef = useRef<HTMLDivElement>(null);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.localStorage.setItem(checkoutStorageKey, JSON.stringify(checkout));
  }, [checkout]);

  useEffect(() => {
    const pageTitle = isCollectionPage
      ? 'Ready-to-Wear | Olajumoke Peculiar Signature'
      : isCustomizePage
        ? 'Customize a Look | Olajumoke Peculiar Signature'
        : isAboutPage
          ? 'About & Contact | Olajumoke Peculiar Signature'
          : 'Olajumoke Peculiar Signature | Bespoke Fashion in Ile-Ife';
    const description = isCollectionPage
      ? 'Explore our curated collection of Peculiar looks, created for moments worth making a statement.'
      : isCustomizePage
        ? 'Choose a Ready-to-Wear design from Olajumoke Peculiar Signature and request an adjustment. Every request is reviewed on WhatsApp.'
        : isAboutPage
          ? 'Meet Olajumoke Peculiar Signature, explore the collections, and get in touch through WhatsApp or social media.'
          : 'Olajumoke Peculiar Signature is a premium Nigerian women’s fashion atelier in Ile-Ife, creating bespoke and ready-to-wear fashion for every moment worth making a statement.';
    document.title = pageTitle;
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
    setOg('og:title', pageTitle);
    setOg('og:description', description);
    setOg('og:type', 'website');
    setOg('og:image', logo);
  }, [isCollectionPage, isCustomizePage, isAboutPage]);

  const addToCart = (look: Look, openCart = true) => {
    setCartItems((current) => {
      const existing = current.find((item) => !item.customization && item.image === look.image);
      return existing
        ? current.map((item) => item.image === look.image ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...look, id: look.id ?? look.image, quantity: 1 }];
    });
    setSelectedLook(null);
    setCheckoutError('');
    if (openCart) setCartOpen(true);
  };

  const addCustomizedToCart = (product: ReadyToWearProduct, customization: CustomizationRequest) => {
    setCartItems((current) => [
      ...current,
      {
        ...product,
        id: `custom-${product.id}-${crypto.randomUUID()}`,
        quantity: customization.quantity,
        customization,
      },
    ]);
    setCheckout((current) => ({
      ...current,
      name: customization.customerName,
      whatsapp: customization.whatsapp,
      expectedDate: customization.expectedDate || current.expectedDate,
      sizePreference: customization.sizePreference || current.sizePreference,
    }));
    setCheckoutError('');
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((current) => quantity < 1
      ? current.filter((item) => item.id !== id)
      : current.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const updateCheckout = (field: keyof CartCheckoutData, value: string) => {
    setCheckout((current) => ({
      ...current,
      [field]: value,
      ...(field === 'fulfillment' && value !== 'Delivery' ? { address: '' } : {}),
    }));
    setCheckoutError('');
  };

  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cartItems.length === 0) return;
    if (checkout.fulfillment === 'Delivery' && !checkout.address.trim()) {
      setCheckoutError('Enter a delivery address to continue.');
      return;
    }
    const selectedLooks = cartItems
      .map((item, index) => {
        if (item.customization) {
          const request = item.customization;
          return `CUSTOMIZATION REQUEST ${index + 1}
Look: ${lookName(item)}
Product price: ${item.priceLabel ?? 'Price on request'}
Quantity: ${item.quantity}
Requested adjustments: ${request.adjustmentType || 'Adjustment — see details below'}
Adjustment details: ${request.requestedChanges}
Size / measurement preference: ${request.sizePreference || 'To discuss'}
Expected date: ${formatDate(request.expectedDate)}
Customer name: ${request.customerName}
WhatsApp number: ${request.whatsapp}
Pickup or delivery preference: ${checkout.fulfillment}
${checkout.fulfillment === 'Delivery' ? `Delivery address: ${checkout.address}` : ''}
Additional notes: ${request.additionalNotes || 'None'}`;
        }
        return `READY-TO-WEAR LOOK ${index + 1}: ${lookName(item)}
Product price: ${item.priceLabel ?? 'Price on request'}
Quantity: ${item.quantity}`;
      })
      .join('\n');
    const message = `Hello Olajumoke, I’d like to place a ready-to-wear order request.

${selectedLooks}

Expected date: ${formatDate(checkout.expectedDate)}
Customer name: ${checkout.name}
WhatsApp number: ${checkout.whatsapp}
Fulfilment: ${checkout.fulfillment}
${checkout.fulfillment === 'Delivery' ? `Delivery address: ${checkout.address}` : ''}
Size / measurement preference: ${checkout.sizePreference}
Additional notes: ${checkout.notes || 'None'}

Please confirm the order details with me. Thank you.`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const scrollCarousel = (track: HTMLDivElement | null, direction: -1 | 1) => {
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.72, 260),
      behavior: 'smooth',
    });
  };

  const nextLook = () =>
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % looks.length,
    );
  const previousLook = () =>
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + looks.length) % looks.length,
    );

  return (
    <div className={`atelier-page${isEditorialSubpage ? ' atelier-page-collection' : ''}`}>
      <Nav
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        isCollectionPage={isEditorialSubpage}
        isAboutPage={isAboutPage}
      />
      <Switch>
        <Route path={routeBase}>
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
              <Link
                className="button-gold"
                href={readyToWearHref}
                data-testid="button-hero-collections"
              >
                Explore Our Looks <MoveUpRight size={15} />
              </Link>
              <Link
                className="button-ghost"
                href={customizeLookHref}
                data-testid="link-hero-customize"
              >
                Customize a Look
              </Link>
            </div>
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
                Browse our ready-to-wear collections or request an adjustment to a Peculiar design.
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
                <LookCard
                  key={look.image}
                  look={look}
                  onSelect={() => setSelectedLook(look)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="make-it-yours section-space" aria-labelledby="make-it-yours-title">
          <div className="section-shell make-it-yours-grid">
            <div className="make-it-yours-copy">
              <p className="eyebrow">Personalise a Peculiar design</p>
              <h2 id="make-it-yours-title" className="serif">Make It <em>Yours.</em></h2>
              <p>Love the look, but want to make it your own?</p>
              <p>Tell us about a change you'd like to make to one of our ready-to-wear pieces.</p>
              <p className="make-it-yours-examples">
                Adjustments can include changing long sleeves to short sleeves, adding a bottom slit to a gown, or adding stones to a gele. We focus on thoughtful changes to existing Peculiar designs.
              </p>
              <Link className="button-gold" href={customizeLookHref}>
                Customize a Look <MoveUpRight size={15} />
              </Link>
            </div>
            <div className="make-it-yours-image">
              <img src={blackRedLook} alt="A Peculiar ready-to-wear design with considered tailoring details" loading="lazy" />
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
              <div className="carousel-controls" aria-label="Lookbook carousel controls">
                <button type="button" className="carousel-control" aria-label="Previous lookbook images" onClick={() => scrollCarousel(lookbookTrackRef.current, -1)}>
                  <ArrowLeft size={17} />
                </button>
                <button type="button" className="carousel-control" aria-label="Next lookbook images" onClick={() => scrollCarousel(lookbookTrackRef.current, 1)}>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
            <div className="lookbook-carousel-track" ref={lookbookTrackRef}>
              {looks.map((look, index) => (
                <button
                  type="button"
                  className="lookbook-slide"
                  key={look.image}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Open ${lookName(look)} in the lookbook`}
                  data-testid={`button-lookbook-${index}`}
                >
                  <img src={look.image} alt={look.alt} loading="lazy" />
                  <span>{look.alt}</span>
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
              <div className="carousel-controls" aria-label="Client review carousel controls">
                <button type="button" className="carousel-control" aria-label="Previous client reviews" onClick={() => scrollCarousel(reviewTrackRef.current, -1)}>
                  <ArrowLeft size={17} />
                </button>
                <button type="button" className="carousel-control" aria-label="Next client reviews" onClick={() => scrollCarousel(reviewTrackRef.current, 1)}>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
            <p className="testimonial-intro">
              Every look is created to make its moment feel even more special.
            </p>
            <div className="testimonial-carousel-track" ref={reviewTrackRef}>
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
              <img src={olajumokePortrait} alt={aboutStoryImageAlt} loading="lazy" />
            </div>
            <div className="about-copy">
              <p className="eyebrow">{aboutStoryEyebrow}</p>
              <h2 id="about-title" className="serif">
                Meet <em>Olajumoke.</em>
              </h2>
              {aboutStoryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
            Choose an existing Peculiar design and request an adjustment to make the look feel like your own.
          </p>
          <div className="final-actions">
            <Link className="button-ghost" href={customizeLookHref}>
              Customize a Look
            </Link>
            <Link className="button-ghost" href={readyToWearHref}>
              Explore Ready-to-Wear
            </Link>
          </div>
        </section>
      </main>
        </Route>
        <Route path={readyToWearHref}>
          <ReadyToWearPage
            products={readyToWearProducts}
            onAddToCart={(product) => addToCart(product, false)}
            onOpenCart={() => setCartOpen(true)}
            cartCount={cartCount}
          />
        </Route>
        <Route path={customizeLookHref}>
          <CustomizePage
            products={readyToWearProducts}
            readyToWearHref={readyToWearHref}
            onAddCustomizedToCart={addCustomizedToCart}
            onOpenCart={() => setCartOpen(true)}
          />
        </Route>
        <Route path={aboutContactHref}>
          <AboutContactPage
            aboutImage={olajumokePortrait}
            aboutImageAlt={aboutStoryImageAlt}
            aboutEyebrow={aboutStoryEyebrow}
            aboutTitle={aboutStoryTitle}
            aboutParagraphs={aboutStoryParagraphs}
            categories={categories}
            categoryHref={getCategoryHref}
            readyToWearHref={readyToWearHref}
            whatsappNumber={whatsappNumber}
          />
        </Route>
        <Route component={NotFound} />
      </Switch>
      <SiteFooter onOpenCart={() => setCartOpen(true)} />

      <a
        className="floating-whatsapp"
        href={directWhatsAppHref}
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

      {selectedLook && (
        <LookModal
          key={selectedLook.image}
          look={selectedLook}
          onClose={() => setSelectedLook(null)}
          onAdd={addToCart}
        />
      )}

      {cartOpen && (
        <CartModal
          items={cartItems}
          checkout={checkout}
          checkoutError={checkoutError}
          onCheckoutChange={updateCheckout}
          onQuantityChange={updateQuantity}
          onRemove={(id) => setCartItems((current) => current.filter((item) => item.id !== id))}
          onClose={() => setCartOpen(false)}
          onSubmit={submitCheckout}
        />
      )}
    </div>
  );
}

export default Home;