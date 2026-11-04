import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, Scissors, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'wouter';

import type { ReadyToWearProduct } from './ready-to-wear';
import './customize-a-look.css';

export type CustomizationRequest = {
  adjustmentType: string;
  requestedChanges: string;
  sizePreference: string;
  quantity: number;
  expectedDate: string;
  customerName: string;
  whatsapp: string;
  additionalNotes: string;
};

type CustomizePageProps = {
  products: ReadyToWearProduct[];
  readyToWearHref: string;
  onAddCustomizedToCart: (product: ReadyToWearProduct, request: CustomizationRequest) => void;
  onOpenCart: () => void;
};

const adjustmentSuggestions = [
  'Sleeve adjustment',
  'Add or adjust a gown slit',
  'Add stones or embellishments',
  'Minor length adjustment',
  'Other adjustment',
];

const steps = [
  {
    number: '01',
    title: 'Choose a Look',
    copy: 'Browse our Ready-to-Wear collection and select the design you love.',
  },
  {
    number: '02',
    title: 'Tell Us Your Changes',
    copy: 'Describe the adjustment you’d like us to make.',
  },
  {
    number: '03',
    title: 'Review Your Request',
    copy: 'Add the look and your customization details to your Cart.',
  },
  {
    number: '04',
    title: 'Complete Your Order',
    copy: 'Submit your order through WhatsApp so we can review your request and confirm the details.',
  },
];

function RequestForm({
  product,
  onAdd,
  onOpenCart,
  onChooseAnother,
}: {
  product: ReadyToWearProduct;
  onAdd: (request: CustomizationRequest) => void;
  onOpenCart: () => void;
  onChooseAnother: () => void;
}) {
  const [adjustmentType, setAdjustmentType] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');
  const [sizePreference, setSizePreference] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expectedDate, setExpectedDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [added, setAdded] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd({
      adjustmentType,
      requestedChanges: requestedChanges.trim(),
      sizePreference: sizePreference.trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      expectedDate,
      customerName: customerName.trim(),
      whatsapp: whatsapp.trim(),
      additionalNotes: additionalNotes.trim(),
    });
    setAdded(true);
  };

  return (
    <section className="customize-form-section" id="customize-request" aria-labelledby="customize-form-title">
      <div className="customize-form-heading">
        <p className="eyebrow">A thoughtful detail, just for you</p>
        <h2 id="customize-form-title" className="serif">Tell Us Your <em>Desired Changes.</em></h2>
        <p>Your selected design stays at the heart of every request.</p>
      </div>

      <div className="customize-form-layout">
        <aside className="customize-selected-look" aria-label={`Selected look: ${product.title}`}>
          <div className="customize-selected-image">
            <img src={product.image} alt={product.alt} />
          </div>
          <div className="customize-selected-details">
            <p className="eyebrow">{product.categoryLabel} · Selected look</p>
            <h3 className="serif">{product.title}</h3>
            <p className="customize-selected-price">{product.priceLabel}</p>
            <p className="customize-selected-description">{product.description}</p>
            <button className="customize-change-look" type="button" onClick={onChooseAnother}>
              Choose another look <ArrowRight size={15} />
            </button>
          </div>
        </aside>

        <form className="customize-request-form" onSubmit={submit}>
          <div className="customize-readonly-field">
            <span>Selected look</span>
            <p><ShoppingBag size={15} /> {product.title} <strong>{product.priceLabel}</strong></p>
            <small>This request is linked to this Ready-to-Wear design.</small>
          </div>

          <fieldset className="customize-adjustment-fieldset">
            <legend>Type of adjustment <span>Optional suggestions · subject to approval</span></legend>
            <div className="customize-adjustment-options">
              {adjustmentSuggestions.map((suggestion) => (
                <button
                  type="button"
                  className={`customize-adjustment-option${adjustmentType === suggestion ? ' is-selected' : ''}`}
                  key={suggestion}
                  aria-pressed={adjustmentType === suggestion}
                  onClick={() => setAdjustmentType((current) => current === suggestion ? '' : suggestion)}
                >
                  {adjustmentType === suggestion && <Check size={14} />}
                  {suggestion}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="customize-field customize-field-full">
            <span>What would you like to change? <b aria-hidden="true">*</b></span>
            <textarea
              required
              rows={4}
              value={requestedChanges}
              onChange={(event) => setRequestedChanges(event.target.value)}
              placeholder="Describe the adjustment you'd like us to make to this look..."
            />
            <small>Please keep your request to adjustments to the selected design.</small>
          </label>

          <div className="customize-form-grid">
            <label className="customize-field">
              <span>Size / measurement preference</span>
              <input
                value={sizePreference}
                onChange={(event) => setSizePreference(event.target.value)}
                placeholder="e.g. Medium or measurements to discuss"
              />
            </label>
            <label className="customize-field">
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                max="20"
                step="1"
                required
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <label className="customize-field">
              <span>Expected date</span>
              <input type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} />
            </label>
            <label className="customize-field">
              <span>Your name <b aria-hidden="true">*</b></span>
              <input autoComplete="name" required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name" />
            </label>
            <label className="customize-field customize-field-full">
              <span>WhatsApp number <b aria-hidden="true">*</b></span>
              <input type="tel" autoComplete="tel" required value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="+234..." />
            </label>
            <label className="customize-field customize-field-full">
              <span>Additional notes</span>
              <textarea rows={3} value={additionalNotes} onChange={(event) => setAdditionalNotes(event.target.value)} placeholder="Anything else relevant to this request?" />
            </label>
          </div>

          <p className="customize-review-notice">
            All customization requests are subject to review and confirmation. We will contact you on WhatsApp to discuss your request before confirming the final details.
          </p>
          {added && (
            <div className="customize-added-confirmation" role="status">
              <Check size={17} />
              <span><strong>Added to your Cart.</strong> Your customization request is saved with this look.</span>
              <button type="button" onClick={onOpenCart}>Open Cart</button>
            </div>
          )}
          <button className="button-gold customize-submit" type="submit">
            {added ? 'Add Another Customized Look to Cart' : 'Add Customized Look to Cart'}
            <ShoppingBag size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

export default function CustomizePage({ products, readyToWearHref, onAddCustomizedToCart, onOpenCart }: CustomizePageProps) {
  const categories = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      if (seen.has(product.category)) return false;
      seen.add(product.category);
      return true;
    });
  }, [products]);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.category ?? '');
  const [selectedProduct, setSelectedProduct] = useState<ReadyToWearProduct | null>(null);
  const activeProduct = categories.find((product) => product.category === activeCategory);

  useEffect(() => {
    if (selectedProduct) {
      document.getElementById('customize-request')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedProduct]);

  useEffect(() => {
    const activeTab = document.getElementById(`customize-category-${activeCategory}`);
    const track = activeTab?.parentElement;
    if (!activeTab || !(track instanceof HTMLElement)) return;
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

  const chooseProduct = (product: ReadyToWearProduct) => {
    setSelectedProduct(product);
  };

  const chooseAnother = () => {
    setSelectedProduct(null);
    window.requestAnimationFrame(() => {
      document.getElementById('customize-catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <main className="customize-page">
      <section className="customize-intro" aria-labelledby="customize-title">
        <div className="customize-shell customize-intro-inner">
          <p className="customize-kicker">Olajumoke Peculiar Signature · Ile-Ife</p>
          <h1 id="customize-title" className="customize-title serif">Customize <em>a Look.</em></h1>
          <p className="customize-intro-copy">
            Love one of our designs but have a change in mind? Tell us what you'd like adjusted, and let's make the look feel more like you.
          </p>
          <p className="customize-intro-note">
            Our customization service is for adjustments to selected Ready-to-Wear designs. Availability depends on the design and the changes requested.
          </p>
          <Link className="button-gold customize-explore" href={readyToWearHref}>
            Explore Ready-to-Wear <ArrowRight size={15} />
          </Link>
          <span className="customize-intro-mark" aria-hidden="true"><Scissors size={22} /></span>
        </div>
      </section>

      <section className="customize-how section-space" aria-labelledby="customize-how-title">
        <div className="customize-shell">
          <div className="customize-section-heading">
            <p className="eyebrow">A simple, considered process</p>
            <h2 id="customize-how-title" className="serif">Your Look, <em>Your Little Touch.</em></h2>
            <p>Choose a Peculiar look and tell us how you'd like to personalise it.</p>
          </div>
          <div className="customize-steps">
            {steps.map((step, index) => (
              <article className="customize-step" key={step.number}>
                <div className="customize-step-mark">
                  <span>{step.number}</span>
                  {index < steps.length - 1 && <span className="customize-step-line" aria-hidden="true" />}
                </div>
                <div>
                  <h3 className="serif">{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="customize-catalogue" id="customize-catalogue" aria-labelledby="customize-catalogue-title">
        <div className="customize-shell">
          <div className="customize-section-heading">
            <p className="eyebrow">Begin with a Peculiar design</p>
            <h2 id="customize-catalogue-title" className="serif">Which Look Would You <em>Like to Customize?</em></h2>
            <p>Start with one of our existing designs, then tell us what you'd like changed.</p>
          </div>

          <div className={`customize-category-bar${selectedProduct ? ' has-selected-look' : ''}`}>
            <div className="customize-category-tabs" role="tablist" aria-label="Ready-to-Wear categories">
              {categories.map((product) => (
                <button
                  key={product.category}
                  id={`customize-category-${product.category}`}
                  className={`customize-category-tab${activeCategory === product.category ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === product.category}
                  aria-controls={`customize-product-${product.id}`}
                  onClick={() => setActiveCategory(product.category)}
                >
                  {product.categoryLabel}
                </button>
              ))}
            </div>
          </div>

          {activeProduct && (
            <article className="customize-product-card" id={`customize-product-${activeProduct.id}`} role="tabpanel" aria-labelledby={`customize-category-${activeProduct.category}`}>
              <div className="customize-product-image">
                <img src={activeProduct.image} alt={activeProduct.alt} />
                <span className="customize-product-index">Peculiar · {String(categories.indexOf(activeProduct) + 1).padStart(2, '0')}</span>
              </div>
              <div className="customize-product-details">
                <p className="eyebrow">{activeProduct.categoryLabel} · Ready-to-Wear</p>
                <h3 className="serif">{activeProduct.title}</h3>
                <p>{activeProduct.description}</p>
                <span className="customize-product-price">{activeProduct.priceLabel}</span>
                <button className="button-gold" type="button" onClick={() => chooseProduct(activeProduct)}>
                  Customize This Look <Sparkles size={15} />
                </button>
              </div>
            </article>
          )}
          <p className="customize-browse-hint"><ArrowDown size={14} /> Select a category to explore the curated looks</p>

          {selectedProduct && (
            <RequestForm
              key={selectedProduct.id}
              product={selectedProduct}
              onAdd={(request) => onAddCustomizedToCart(selectedProduct, request)}
              onOpenCart={onOpenCart}
              onChooseAnother={chooseAnother}
            />
          )}
        </div>
      </section>
    </main>
  );
}
