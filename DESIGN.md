---
name: Architectural Neon
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e0c0af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a78b7c'
  outline-variant: '#584235'
  surface-tint: '#ffb68b'
  primary: '#ffb68b'
  on-primary: '#522300'
  primary-container: '#ff7a00'
  on-primary-container: '#5c2800'
  inverse-primary: '#994700'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#f8b2d9'
  on-tertiary: '#4f1f3f'
  tertiary-container: '#ce8cb2'
  on-tertiary-container: '#572546'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb68b'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#ffd8eb'
  tertiary-fixed-dim: '#f8b2d9'
  on-tertiary-fixed: '#360829'
  on-tertiary-fixed-variant: '#6a3556'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 84px
    fontWeight: '900'
    lineHeight: 90px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-caps:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  container-max: 1440px
---

## Brand & Style

The design system for Marena Cutz is a fusion of high-fashion editorial rigor and the vibrant, high-energy environment of a modern professional barbershop. It is built on a foundation of **Minimalism** and **Architectural Precision**, utilizing vast negative space and strict grid alignments to create a feeling of luxury and exclusivity.

The emotional response is "Sophisticated Pulse"—the interface feels as sharp and calculated as a master barber's fade, but is electrified by a color palette that defies traditional luxury tropes. By combining the high-contrast drama of Bodoni Moda with "Neon" accents, the system positions the brand as a leader in street-luxury grooming.

## Colors

This design system utilizes a **Dark Mode** foundation to simulate the sleek, industrial feel of a high-end studio.

- **Primary (Vibrant Orange):** Used for primary actions, high-importance status, and "call to service" buttons. It represents the energy and heat of the craft.
- **Secondary (Electric Turquoise):** Used for highlighting specialized services, interactive states, and technical details. It provides a cool, sterile contrast to the orange.
- **Tertiary (Soft Pink):** Used sparingly for lifestyle elements, softer interactions, or secondary accents to prevent the palette from feeling overly aggressive.
- **Neutrals (Deep Charcoal & Pure Black):** The "Architectural" base. Gradients should be avoided; use solid, flat fills to maintain the structured look.

## Typography

The typographic hierarchy is the core of the "Editorial" feel. 

- **Bodoni Moda** is reserved for large, high-impact headlines. It should be used with extreme weight (900) for a "fashion-mag" look or lighter weights for a more delicate, architectural feel.
- **Hanken Grotesk** handles all functional text, providing a clean, contemporary sans-serif balance that ensures legibility in the dark interface.
- **Space Mono** is introduced for technical labels (price, duration, time slots), mimicking the "precision tool" aspect of barbering and the architectural lighting in the reference imagery.

## Layout & Spacing

This design system employs a **Fixed Grid** for desktop to maintain an editorial layout, and a **Fluid Grid** for mobile.

- **Desktop:** 12-column grid with generous 80px margins to allow content to "breathe" like a high-fashion spread.
- **Rhythm:** An 8px linear scale is used for all internal padding and margins. 
- **Architectural Alignment:** Elements should be strictly aligned to the grid. Use "Asymmetric Balance"—for example, a large headline may span 8 columns while the supporting body text is offset to the final 4 columns, creating visual tension and interest.

## Elevation & Depth

To maintain the architectural aesthetic, the design system avoids traditional shadows. 

- **Tonal Layers:** Depth is achieved through "Stacked Fills." The background is at `#0A0A0A`, while cards or containers sit on `#1E1E1E`. 
- **Neon Glow:** Instead of shadows, use extremely subtle outer glows (using the accent colors) for active states. These should feel like the reflection of neon tubes on a dark floor.
- **Thin Rules:** Use 1px borders in high-contrast white or accent colors to define sections rather than using drop shadows.

## Shapes

The shape language is **Sharp (0)**. 

To reflect the "Architectural" brief, avoid rounded corners entirely. Buttons, input fields, and image containers should have 90-degree angles. This conveys a sense of precision, sharpness (like a blade), and structural integrity. 

*Exception:* Only the "Barber Chair" accent elements (like custom chips or specific iconography) may use circular forms to mirror the circular lighting seen in the studio.

## Components

- **Buttons:** Sharp 0px corners. Primary buttons use the Vibrant Orange fill with black text. Secondary buttons use a 1px Electric Turquoise border with Turquoise text (Ghost style).
- **Input Fields:** Bottom-border only (Editorial style). The label should use `label-caps` (Space Mono) positioned above the line. The line turns Electric Turquoise on focus.
- **Cards:** No borders or shadows. Use a slightly lighter neutral fill (`#1E1E1E`) to separate from the background. 
- **Status Chips:** Use the three accent colors (Orange, Pink, Turquoise) to categorize services (e.g., "Haircut", "Beard", "Treatment"). 
- **Selection Controls:** Checkboxes and Radios are sharp squares/diamonds. On selection, they fill solid with the Primary color.
- **Navigation:** Top-tier navigation uses high-contrast white typography. Active states are indicated by a 2px horizontal bar in a rotating accent color.
