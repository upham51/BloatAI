import SwiftUI

/// A 2x2 Bento Grid showcasing core app features with glassmorphic tiles.
/// Each tile is a small glass card with an SF Symbol icon and label,
/// arranged in a responsive grid layout.
struct FeatureGrid: View {
    let accentColor: Color

    private let features: [(icon: String, title: String, tint: Color)] = [
        ("target",                   "Trigger Map",    .mintGreen),
        ("brain.head.profile",       "Smart Insights", .softSage),
        ("leaf.fill",                "FODMAP Guide",   .mintGreen),
        ("clock.arrow.circlepath",   "Meal History",   .softSage)
    ]

    var body: some View {
        LazyVGrid(
            columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ],
            spacing: 12
        ) {
            ForEach(Array(features.enumerated()), id: \.offset) { _, feature in
                FeatureTile(
                    icon: feature.icon,
                    title: feature.title,
                    tint: feature.tint
                )
            }
        }
        .padding(.horizontal, 32)
    }
}

/// Individual Bento Grid tile — a compact glassmorphic card
/// with an icon and label. Designed for a luxury, editorial feel.
private struct FeatureTile: View {
    let icon: String
    let title: String
    let tint: Color

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .resizable()
                .scaledToFit()
                .frame(height: 28)
                .foregroundStyle(tint)

            Text(title)
                .font(AppFont.caption())
                .foregroundStyle(Color.warmIvory.opacity(0.85))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .padding(.horizontal, 8)
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(Color.white.opacity(0.06))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(
                    LinearGradient(
                        colors: [
                            .white.opacity(0.18),
                            .white.opacity(0.04)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 0.8
                )
        )
        .shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
    }
}

#Preview {
    ZStack {
        Color.deepNavy.ignoresSafeArea()
        FeatureGrid(accentColor: .mintGreen)
    }
}
