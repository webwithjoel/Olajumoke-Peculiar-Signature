import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Image as ImageIcon, ShoppingBag, X } from 'lucide-react';

import './ready-to-wear.css';

export type ReadyToWearProduct = {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  priceLabel: string;
};

type ReadyToWearPageProps = {
  products: ReadyToWearProduct[];
  onAddToCart: (product: ReadyToWearProduct) => void;
  onOpenCart: () => void;
  cartCount: number;
};

type ProductCategory = {
  id: string;
  label: string;
  products: ReadyToWearProduct[];
};

function makeDomId(category: string) {
  return `rtw-category-${category}`;
}

function ProductModal({
  product,
  onClose,
  onAdd,
  wasAdded,
}: {
  product: ReadyToWearProduct;
  onClose: () => void;
  onAdd: () => void;
  wasAdded: boolean;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = priorOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="rtw-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-testid={`modal-look-${product.id}`}
    >
      <div
        ref={modalRef}
        className="rtw-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`rtw-modal-title-${product.id}`}
        aria-describedby={`rtw-modal-description-${product.id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          className="rtw-modal-close"
          type="button"
          aria-label={`Close details for ${product.title}`}
          onClick={onClose}
          data-testid={`button-close-look-${product.id}`}
        >
          <X size={19} strokeWidth={1.6} />
        </button>
        <div className="rtw-modal-media">
          <img src={product.image} alt={product.alt} />
        </div>
        <div className="rtw-modal-copy">
          <p className="rtw-modal-category">{product.categoryLabel}</p>
          <h2 className="rtw-modal-title" id={`rtw-modal-title-${product.id}`}>{product.title}</h2>
          <p className="rtw-modal-price">{product.priceLabel}</p>
          <p className="rtw-modal-description" id={`rtw-modal-description-${product.id}`}>{product.description}</p>
          <button
            type="button"
            className="rtw-modal-action"
            onClick={onAdd}
            data-testid={`button-modal-select-${product.id}`}
          >
            <span>{wasAdded ? 'Added to Your Cart' : 'Select This Look'}</span>
            {wasAdded ? <Check size={17} /> : <ShoppingBag size={16} />}
          </button>
          {wasAdded && <p className="rtw-modal-added" role="status">This look is in your cart. Continue browsing whenever you’re ready.</p>}
        </div>
      </div>
    </div>
  );
}

export default function ReadyToWearPage({
  products,
  onAddToCart,
  onOpenCart,
  cartCount,
}: ReadyToWearPageProps) {
  const categories = useMemo<ProductCategory[]>(() => {
    const groups = new Map<string, ProductCategory>();
    products.forEach((product) => {
      const id = product.category;
      const category = groups.get(id);
      if (category) {
        category.products.push(product);
      } else {
        groups.set(id, { id, label: product.categoryLabel, products: [product] });
      }
    });
    return Array.from(groups.values());
  }, [products]);

  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ReadyToWearProduct | null>(null);
  const [addedProduct, setAddedProduct] = useState<ReadyToWearProduct | null>(null);
  const [toastProduct, setToastProduct] = useState<ReadyToWearProduct | null>(null);
  const tabTrackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const hasHandledInitialTarget = useRef(false);

  useEffect(() => {
    if (!categories.length || hasHandledInitialTarget.current) return;
    hasHandledInitialTarget.current = true;
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get('category');
    let hashCategory = window.location.hash.replace(/^#/, '');
    try {
      hashCategory = decodeURIComponent(hashCategory);
    } catch {
      hashCategory = '';
    }
    const target = categories.find((category) => category.id === requestedCategory)
      ?? categories.find((category) => category.id === hashCategory)
      ?? categories[0];
    setActiveCategory(target.id);
    if (requestedCategory || hashCategory) {
      window.requestAnimationFrame(() => {
        document.getElementById(makeDomId(target.id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [categories]);

  useEffect(() => {
    if (!categories.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveCategory(visible.target.getAttribute('data-category') ?? '');
    }, {
      rootMargin: '-22% 0px -58% 0px',
      threshold: [0, .12, .3, .55],
    });
    categories.forEach((category) => {
      const section = document.getElementById(makeDomId(category.id));
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (!activeCategory) return;
    const activeTab = tabRefs.current.get(activeCategory);
    const track = tabTrackRef.current;
    if (!activeTab || !track) return;
    const tabBounds = activeTab.getBoundingClientRect();
    const trackBounds = track.getBoundingClientRect();
    if (tabBounds.left < trackBounds.left || tabBounds.right > trackBounds.right) {
      const tabOffset = tabBounds.left - trackBounds.left;
      track.scrollTo({
        left: track.scrollLeft + tabOffset - (track.clientWidth - activeTab.clientWidth) / 2,
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    if (!toastProduct) return;
    const timeout = window.setTimeout(() => setToastProduct(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toastProduct]);

  const closeModal = useCallback(() => setSelectedProduct(null), []);

  const selectCategory = (category: ProductCategory) => {
    setActiveCategory(category.id);
    document.getElementById(makeDomId(category.id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addProduct = (product: ReadyToWearProduct) => {
    onAddToCart(product);
    setAddedProduct(product);
    setToastProduct(product);
  };

  return (
    <main className="rtw-page">
      <section className="rtw-intro" aria-labelledby="rtw-title">
        <div className="rtw-shell rtw-intro-inner">
          <p className="rtw-kicker">Olajumoke Peculiar Signature · Ile-Ife</p>
          <h1 className="rtw-title" id="rtw-title">Ready-to-<span>Wear</span></h1>
          <p className="rtw-description">
            Explore our curated collection of Peculiar looks, created for moments worth making a statement.
          </p>
          <span className="rtw-side-note" aria-hidden="true">Made for your moment</span>
        </div>
      </section>

      {categories.length > 0 && (
        <nav className="rtw-category-bar" aria-label="Ready-to-Wear categories">
          <div className="rtw-shell rtw-category-track" ref={tabTrackRef} role="tablist" aria-label="Choose a collection category">
            {categories.map((category, index) => (
              <button
                key={category.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(category.id, node);
                  else tabRefs.current.delete(category.id);
                }}
                type="button"
                className={`rtw-tab${activeCategory === category.id ? ' is-active' : ''}`}
                role="tab"
                id={`rtw-tab-label-${category.id}`}
                aria-selected={activeCategory === category.id}
                aria-controls={makeDomId(category.id)}
                onClick={() => selectCategory(category)}
                onKeyDown={(event) => {
                  const currentIndex = categories.findIndex((item) => item.id === category.id);
                  let nextIndex = currentIndex;
                  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % categories.length;
                  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + categories.length) % categories.length;
                  else if (event.key === 'Home') nextIndex = 0;
                  else if (event.key === 'End') nextIndex = categories.length - 1;
                  else return;
                  event.preventDefault();
                  const nextCategory = categories[nextIndex];
                  tabRefs.current.get(nextCategory.id)?.focus();
                  selectCategory(nextCategory);
                }}
                data-testid={`tab-category-${category.id}`}
              >
                <span>{category.label}</span>
                <span className="sr-only">, collection {index + 1}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="rtw-shell rtw-collection" aria-live="off">
        {categories.length === 0 ? (
          <section className="rtw-empty" data-testid="empty-ready-to-wear">
            <span className="rtw-empty-mark" />
            <h2>The collection is taking shape.</h2>
            <p>Ready-to-Wear looks will appear here when they are available to browse.</p>
          </section>
        ) : (
          categories.map((category, categoryIndex) => (
            <section
              className="rtw-category-section"
              id={makeDomId(category.id)}
              key={category.id}
              data-category={category.id}
              role="tabpanel"
              aria-labelledby={`rtw-tab-label-${category.id}`}
              data-testid={`section-category-${category.id}`}
            >
              <header className="rtw-section-heading">
                <div>
                  <p className="rtw-section-overline">The collection · {String(categoryIndex + 1).padStart(2, '0')}</p>
                  <h2>{category.label}</h2>
                </div>
                <p>Considered pieces for your most meaningful occasions.</p>
              </header>
              <div className="rtw-products">
                {category.products.map((product, productIndex) => (
                  <article
                    className={`rtw-product${category.products.length === 1 ? ' rtw-product-single' : ''}`}
                    key={product.id}
                    data-testid={`card-product-${product.id}`}
                  >
                    <button
                      className="rtw-product-image-button"
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      aria-label={`View a larger image and details for ${product.title}`}
                      data-testid={`button-view-look-${product.id}`}
                    >
                      <img src={product.image} alt={product.alt} loading={productIndex > 1 ? 'lazy' : 'eager'} />
                      <span className="rtw-image-hint"><ImageIcon size={14} /> View the look</span>
                    </button>
                    <div className="rtw-product-info">
                      <h3 className="rtw-product-name" data-testid={`text-product-name-${product.id}`}>{product.title}</h3>
                      <p className="rtw-price" data-testid={`text-product-price-${product.id}`}>{product.priceLabel}</p>
                      <button
                        className="rtw-select-button"
                        type="button"
                        onClick={() => addProduct(product)}
                        data-testid={`button-select-look-${product.id}`}
                      >
                        <span>{addedProduct?.id === product.id ? 'Added to Your Cart' : 'Select This Look'}</span>
                        {addedProduct?.id === product.id ? <Check size={16} /> : <ArrowUpRight size={16} />}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeModal}
          onAdd={() => addProduct(selectedProduct)}
          wasAdded={addedProduct?.id === selectedProduct.id}
        />
      )}

      {toastProduct && (
        <div className="rtw-toast" role="status" aria-live="polite" data-testid={`status-added-${toastProduct.id}`}>
          <span className="rtw-toast-icon"><Check size={15} /></span>
          <span className="rtw-toast-copy">
            <strong>{toastProduct.title}</strong>
            <span>Added to your cart · {cartCount} {cartCount === 1 ? 'look' : 'looks'}</span>
          </span>
          <button
            type="button"
            className="rtw-toast-cart"
            onClick={() => {
              setSelectedProduct(null);
              onOpenCart();
            }}
            data-testid="button-toast-open-cart"
          >
            View cart
          </button>
        </div>
      )}
    </main>
  );
}
