export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

/**
 * Section renders only when this array has entries (see §14.1 of the plan —
 * testimonials are being collected from past clients).
 */
export const testimonials: Testimonial[] = [];
