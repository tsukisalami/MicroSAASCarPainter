# Option B: PaintPreview — AI Color Visualizer for Shops

## Concept
B2B tool for auto body shops: upload a customer's car photo, pick colors/finishes, generate a realistic mockup to show the client before committing to a paint job.

## Core Features
- **Photo upload & AI recolor**: Shop uploads customer's car photo, selects color + finish (metallic, matte, pearl, candy), AI generates realistic preview
- **Before/after comparison**: Side-by-side slider for customer presentations
- **Embeddable website widget**: Lead capture tool shops add to their website — visitors upload their car, pick a color, and submit as a quote request
- **Share via SMS/email**: Send mockups directly to customers to close deals faster
- **Color library**: Curated palette of popular automotive paint brands (PPG, Axalta, BASF, Sherwin-Williams)

## Target Customer
- Independent body shops (1-10 employees)
- Custom paint shops
- Car dealerships (pre-sale cosmetic work)
- Wrap shops (secondary market)

## Revenue Model
- Free tier: 5 visualizations/month
- Pro: $39/mo — unlimited visualizations, website widget, brand customization
- Enterprise: $99/mo — API access, multi-location, white-label

## Technical Considerations
- Requires image segmentation model (SAM or similar) to isolate car body from background
- Color transfer / neural style approach for realistic paint rendering
- GPU inference costs need to be factored into pricing
- Consider using existing APIs (Replicate, Stability AI) to reduce ML infrastructure burden

## Market Gap
- Consumer-facing AI recolor apps exist (Pixelcut, Car Color Changer AI) but none are designed for the B2B shop workflow
- No tool integrates visualization into the quoting/sales pipeline
- WrapMyRide.ai targets wrap shops specifically — paint shops are underserved

## Status
Parked for Phase 2. Can be built as an upsell module to QuotePaint.
