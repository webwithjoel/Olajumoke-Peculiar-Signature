import { type FormEvent, useState } from 'react';
import { ArrowRight, ArrowUpRight, MessageCircle, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'wouter';

import './about-contact.css';

type Category = {
  title: string;
  slug: string;
  image: string;
  alt: string;
};

type EnquiryValues = {
  fullName: string;
  whatsappNumber: string;
  reason: string;
  message: string;
};

type AboutContactProps = {
  aboutImage: string;
  aboutImageAlt: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  categories: Category[];
  categoryHref: (slug: string) => string;
  readyToWearHref: string;
  whatsappNumber: string;
};

const enquiryReasons = [
  'Ready-to-Wear Enquiry',
  'Customization Enquiry',
  'Order Enquiry',
  'General Enquiry',
];

export default function AboutContactPage({
  aboutImage,
  aboutImageAlt,
  aboutEyebrow,
  aboutTitle,
  aboutParagraphs,
  categories,
  categoryHref,
  readyToWearHref,
  whatsappNumber,
}: AboutContactProps) {
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryValues>({
    defaultValues: {
      fullName: '',
      whatsappNumber: '',
      reason: '',
      message: '',
    },
  });

  const chatHref = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  const submitEnquiry = (values: EnquiryValues) => {
    setSubmitError('');
    const text = [
      'Hello Olajumoke Peculiar Signature, I have an enquiry.',
      '',
      `Full Name: ${values.fullName.trim()}`,
      `WhatsApp Number: ${values.whatsappNumber.trim()}`,
      `Reason for Enquiry: ${values.reason}`,
      `Message: ${values.message.trim()}`,
    ].join('\n');
    const destination = `${chatHref}?text=${encodeURIComponent(text)}`;

    try {
      window.open(destination, '_blank', 'noopener,noreferrer');
    } catch {
      setSubmitError('WhatsApp could not be opened in this browser.');
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    setSubmitError('');
    void handleSubmit(submitEnquiry)(event);
  };

  return (
    <main className="about-contact-page">
      <section className="ac-about ac-section" aria-labelledby="ac-about-title">
        <div className="ac-shell ac-about-grid">
          <div className="ac-about-image-frame">
            <img src={aboutImage} alt={aboutImageAlt} data-testid="img-about-brand" />
            <span className="ac-image-caption">Olajumoke Peculiar Signature</span>
          </div>
          <div className="ac-about-copy">
            <p className="eyebrow" data-testid="text-about-eyebrow">{aboutEyebrow}</p>
            <h1 id="ac-about-title" className="serif">{aboutTitle}</h1>
            <div className="ac-about-paragraphs">
              {aboutParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`} data-testid={`text-about-paragraph-${index + 1}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ac-looks ac-section" aria-labelledby="ac-looks-title">
        <div className="ac-shell">
          <div className="ac-looks-heading">
            <div>
              <p className="eyebrow">A wardrobe for every moment</p>
              <h2 id="ac-looks-title" className="serif">Our Signature <em>Looks</em></h2>
            </div>
            <p className="ac-looks-intro">
              From special celebrations to elegant everyday style, explore our collections and find a look that speaks to you.
            </p>
          </div>
          <div className="ac-category-grid">
            {categories.map((category, index) => (
              <Link
                className="ac-category-card"
                href={categoryHref(category.slug)}
                key={category.slug}
                data-testid={`link-category-${category.slug}`}
              >
                <img src={category.image} alt={category.alt} loading="lazy" />
                <span className="ac-category-index">0{index + 1}</span>
                <span className="ac-category-copy">
                  <strong>{category.title}</strong>
                  <span className="ac-category-link">Discover the look <ArrowUpRight size={15} /></span>
                </span>
              </Link>
            ))}
          </div>
          <div className="ac-looks-cta">
            <Link className="button-gold" href={readyToWearHref} data-testid="link-explore-collections">
              Explore Our Collections <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="ac-contact ac-section" id="about-contact-enquiry" aria-labelledby="ac-contact-title">
        <div className="ac-shell ac-contact-grid">
          <div className="ac-contact-copy">
            <p className="eyebrow">We would love to hear from you</p>
            <h2 id="ac-contact-title" className="serif">Let&apos;s <em>Connect</em></h2>
            <p className="ac-contact-intro">
              Have a question about one of our looks, an existing order, or a customization request? Get in touch with us on your preferred social platform.
            </p>
            <a
              className="ac-whatsapp-link"
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-chat-whatsapp"
            >
              <span className="ac-whatsapp-icon"><MessageCircle size={20} /></span>
              <span><small>For a direct conversation</small><strong>Chat With Us on WhatsApp</strong></span>
              <ArrowUpRight size={18} />
            </a>
            <div className="ac-social-links">
              <span>Follow the signature</span>
              <a href="https://www.instagram.com/peculiarfwz?vrfl=eHpkaG13OHAwd3Nh" target="_blank" rel="noopener noreferrer" data-testid="link-instagram">
                Instagram <ArrowUpRight size={14} />
              </a>
              <a href="https://www.facebook.com/share/1UTHDW2bk7/" target="_blank" rel="noopener noreferrer" data-testid="link-facebook">
                Facebook <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          <div className="ac-form-panel">
            <div className="ac-form-heading">
              <p className="ac-section-kicker">WHATSAPP ENQUIRY FORM</p>
              <h3 className="serif">Let’s start a conversation.</h3>
              <p>Share a few details and we’ll prepare your message for WhatsApp.</p>
            </div>
            <form className="ac-enquiry-form" onSubmit={onSubmit} noValidate data-testid="form-whatsapp-enquiry">
              <label className="ac-field" htmlFor="ac-full-name">
                <span>Full Name <b>*</b></span>
                <input
                  id="ac-full-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'ac-full-name-error' : undefined}
                  data-testid="input-full-name"
                  {...register('fullName', { required: 'Please enter your full name.' })}
                />
                {errors.fullName && <small id="ac-full-name-error" className="ac-field-error">{errors.fullName.message}</small>}
              </label>

              <label className="ac-field" htmlFor="ac-whatsapp">
                <span>WhatsApp Number <b>*</b></span>
                <input
                  id="ac-whatsapp"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Include your country code"
                  aria-invalid={Boolean(errors.whatsappNumber)}
                  aria-describedby={errors.whatsappNumber ? 'ac-whatsapp-error' : undefined}
                  data-testid="input-whatsapp-number"
                  {...register('whatsappNumber', { required: 'Please enter your WhatsApp number.' })}
                />
                {errors.whatsappNumber && <small id="ac-whatsapp-error" className="ac-field-error">{errors.whatsappNumber.message}</small>}
              </label>

              <label className="ac-field" htmlFor="ac-reason">
                <span>Reason for Enquiry <b>*</b></span>
                <select
                  id="ac-reason"
                  aria-invalid={Boolean(errors.reason)}
                  aria-describedby={errors.reason ? 'ac-reason-error' : undefined}
                  data-testid="select-enquiry-reason"
                  {...register('reason', { required: 'Please choose a reason for your enquiry.' })}
                >
                  <option value="">Choose a reason</option>
                  {enquiryReasons.map((reason) => <option value={reason} key={reason}>{reason}</option>)}
                </select>
                {errors.reason && <small id="ac-reason-error" className="ac-field-error">{errors.reason.message}</small>}
              </label>

              <label className="ac-field" htmlFor="ac-message">
                <span>Message <b>*</b></span>
                <textarea
                  id="ac-message"
                  rows={4}
                  placeholder="Tell us how we can help"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'ac-message-error' : undefined}
                  data-testid="textarea-enquiry-message"
                  {...register('message', { required: 'Please add a message for our team.' })}
                />
                {errors.message && <small id="ac-message-error" className="ac-field-error">{errors.message.message}</small>}
              </label>

              {submitError && <p className="ac-submit-error" role="alert" data-testid="status-enquiry-error">{submitError}</p>}
              <button className="ac-submit-button" type="submit" disabled={isSubmitting} data-testid="button-send-whatsapp-enquiry">
                <span>Send Enquiry on WhatsApp</span><Send size={16} />
              </button>
              <p className="ac-form-note">Your message will open in WhatsApp for you to review and send.</p>
            </form>
          </div>
        </div>
      </section>

      <section className="ac-final-cta" aria-labelledby="ac-final-title">
        <div className="ac-shell">
          <p className="eyebrow">Your next memorable moment begins here</p>
          <h2 className="serif" id="ac-final-title">Find a Look That Feels Like You</h2>
          <p>Explore our collections and discover a Peculiar look for your next special moment.</p>
          <Link className="ac-collection-button" href={readyToWearHref} data-testid="link-explore-ready-to-wear">
            Explore Ready-to-Wear <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
