import SwiftUI

// MARK: - Color Palette

/// Deep, luxurious color system — "Next Level" aesthetic
/// Navy and Charcoal foundations with Mint Green and Soft Sage accents
extension Color {

    // ── Backgrounds & Bases ──────────────────────────────────────────
    static let deepNavy      = Color(red: 0.039, green: 0.086, blue: 0.157)   // #0A1628
    static let charcoal      = Color(red: 0.110, green: 0.137, blue: 0.200)   // #1C2333
    static let charcoalLight = Color(red: 0.157, green: 0.184, blue: 0.251)   // #282F40

    // ── Accent & Active States ───────────────────────────────────────
    static let mintGreen     = Color(red: 0.290, green: 0.929, blue: 0.769)   // #4AEDC4
    static let softSage      = Color(red: 0.545, green: 0.686, blue: 0.620)   // #8BAF9E

    // ── Supporting Colors ────────────────────────────────────────────
    static let warmIvory     = Color(red: 0.973, green: 0.961, blue: 0.937)   // #F8F5EF
    static let mutedGold     = Color(red: 0.820, green: 0.737, blue: 0.584)   // #D1BC95
    static let dustyRose     = Color(red: 0.776, green: 0.533, blue: 0.518)   // #C68884

    // ── Glass Surface ────────────────────────────────────────────────
    static let glassFill     = Color.white.opacity(0.08)
    static let glassBorder   = Color.white.opacity(0.15)
}

// MARK: - Gradients

struct AppGradients {
    /// Primary background gradient — deep navy → charcoal vertical sweep
    static let background = LinearGradient(
        colors: [.deepNavy, .charcoal, .deepNavy.opacity(0.95)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// Accent glow for highlights
    static let mintGlow = RadialGradient(
        colors: [.mintGreen.opacity(0.3), .clear],
        center: .center,
        startRadius: 0,
        endRadius: 200
    )

    /// Glass card border shimmer
    static let glassBorder = LinearGradient(
        colors: [
            .white.opacity(0.25),
            .white.opacity(0.08),
            .white.opacity(0.02),
            .white.opacity(0.12)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// Card image overlay — moody vignette
    static let cardOverlay = LinearGradient(
        colors: [.clear, .black.opacity(0.4)],
        startPoint: .top,
        endPoint: .bottom
    )
}

// MARK: - Typography

/// Serif headlines + geometric sans-serif body
struct AppFont {

    // ── Headlines — Serif (New York on iOS) ─────────────────────────
    static func serifLargeTitle() -> Font {
        .system(.largeTitle, design: .serif, weight: .bold)
    }

    static func serifTitle() -> Font {
        .system(.title, design: .serif, weight: .semibold)
    }

    static func serifTitle2() -> Font {
        .system(.title2, design: .serif, weight: .semibold)
    }

    static func serifTitle3() -> Font {
        .system(.title3, design: .serif, weight: .medium)
    }

    // ── Body & Data — Geometric Sans-Serif ─────────────────────────
    static func body() -> Font {
        .system(.body, design: .rounded, weight: .regular)
    }

    static func bodyMedium() -> Font {
        .system(.body, design: .rounded, weight: .medium)
    }

    static func caption() -> Font {
        .system(.caption, design: .rounded, weight: .regular)
    }

    static func callout() -> Font {
        .system(.callout, design: .rounded, weight: .medium)
    }

    static func headline() -> Font {
        .system(.headline, design: .rounded, weight: .semibold)
    }
}

// MARK: - View Modifiers

/// Glassmorphism surface modifier
struct GlassSurface: ViewModifier {
    var cornerRadius: CGFloat = 24
    var opacity: CGFloat = 0.08

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .opacity(0.6)
            )
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color.white.opacity(opacity))
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(AppGradients.glassBorder, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.25), radius: 20, x: 0, y: 10)
            .shadow(color: .mintGreen.opacity(0.05), radius: 40, x: 0, y: 20)
    }
}

/// Subtle glow behind interactive elements
struct MintGlow: ViewModifier {
    var radius: CGFloat = 60
    var opacity: CGFloat = 0.15

    func body(content: Content) -> some View {
        content
            .background(
                Circle()
                    .fill(Color.mintGreen.opacity(opacity))
                    .blur(radius: radius)
            )
    }
}

extension View {
    func glassSurface(cornerRadius: CGFloat = 24) -> some View {
        modifier(GlassSurface(cornerRadius: cornerRadius))
    }

    func mintGlow(radius: CGFloat = 60, opacity: CGFloat = 0.15) -> some View {
        modifier(MintGlow(radius: radius, opacity: opacity))
    }
}
