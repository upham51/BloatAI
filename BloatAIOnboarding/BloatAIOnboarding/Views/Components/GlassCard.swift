import SwiftUI

/// A glassmorphic card displaying a full-bleed image with a moody overlay
/// and a bottom-aligned label. Replaces the reference project's flat white
/// cards with a luxury dark-glass aesthetic.
///
/// The card uses `.ultraThinMaterial` over a dark fill, a gradient border
/// shimmer, and layered shadows to achieve the glassmorphism look.
struct GlassCard: View {
    let imageName: String
    let title: String
    let accentColor: Color

    var body: some View {
        ZStack(alignment: .bottom) {
            // ── Background glass fill ────────────────────────────────
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.charcoal)

            // ── Image layer ──────────────────────────────────────────
            Image(imageName)
                .resizable()
                .scaledToFill()
                .frame(maxWidth: 220, maxHeight: 200)
                .clipped()
                .cornerRadius(24)

            // ── Moody vignette overlay ───────────────────────────────
            RoundedRectangle(cornerRadius: 24)
                .fill(AppGradients.cardOverlay)

            // ── Title label ──────────────────────────────────────────
            Text(title)
                .font(AppFont.callout())
                .foregroundStyle(Color.warmIvory)
                .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                .padding(.horizontal, 12)
                .padding(.bottom, 14)
        }
        .frame(maxWidth: 220, maxHeight: 200)
        // ── Glass border shimmer ─────────────────────────────────────
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(AppGradients.glassBorder, lineWidth: 1)
        )
        // ── Layered shadows ──────────────────────────────────────────
        .shadow(color: .black.opacity(0.35), radius: 16, x: 0, y: 8)
        .shadow(color: accentColor.opacity(0.08), radius: 30, x: 0, y: 16)
    }
}

/// Placeholder card used when asset images are not yet available.
/// Renders an SF Symbol icon over a gradient instead of a photo.
struct PlaceholderGlassCard: View {
    let icon: String
    let title: String
    let accentColor: Color

    var body: some View {
        ZStack(alignment: .bottom) {
            // ── Gradient background ──────────────────────────────────
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [Color.charcoalLight, Color.charcoal],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            // ── Icon ─────────────────────────────────────────────────
            Image(systemName: icon)
                .resizable()
                .scaledToFit()
                .frame(maxHeight: 64)
                .foregroundStyle(accentColor.opacity(0.35))
                .offset(y: -30)

            // ── Overlay ──────────────────────────────────────────────
            RoundedRectangle(cornerRadius: 24)
                .fill(AppGradients.cardOverlay)

            // ── Title ────────────────────────────────────────────────
            Text(title)
                .font(AppFont.callout())
                .foregroundStyle(Color.warmIvory)
                .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                .padding(.horizontal, 12)
                .padding(.bottom, 14)
        }
        .frame(maxWidth: 220, maxHeight: 200)
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(AppGradients.glassBorder, lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.35), radius: 16, x: 0, y: 8)
        .shadow(color: accentColor.opacity(0.08), radius: 30, x: 0, y: 16)
    }
}

#Preview {
    ZStack {
        Color.deepNavy.ignoresSafeArea()
        VStack(spacing: 20) {
            PlaceholderGlassCard(
                icon: "fork.knife",
                title: "Sourdough & Brie",
                accentColor: .mintGreen
            )
            PlaceholderGlassCard(
                icon: "leaf.fill",
                title: "Garden Salad",
                accentColor: .softSage
            )
        }
    }
}
