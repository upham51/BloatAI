import SwiftUI

/// Animated continue button — matches the reference project's bouncing arrow
/// style, re-skinned with the glassmorphic dark aesthetic.
///
/// - During progression: shows a mint-filled pill with an animated arrow
/// - On the final step: expands to show "Begin Tracking" text
struct ContinueButton: View {
    let step: OnboardingStep
    let isDisabled: Bool
    let action: () -> Void

    @State private var arrowOffset: CGFloat = -3

    private var isFinish: Bool { step == .finish }
    private var buttonWidth: CGFloat { isFinish ? 220 : 150 }

    var body: some View {
        Button(action: action) {
            ZStack {
                // ── Pill background ──────────────────────────────────
                Capsule()
                    .fill(Color.mintGreen)
                    .frame(width: buttonWidth, height: 52)
                    .shadow(color: .mintGreen.opacity(0.35), radius: 16, x: 0, y: 6)
                    .shadow(color: .mintGreen.opacity(0.15), radius: 30, x: 0, y: 12)

                if isFinish {
                    // ── Final step label ─────────────────────────────
                    Text("Begin Tracking")
                        .font(AppFont.bodyMedium())
                        .foregroundStyle(Color.deepNavy)
                } else {
                    // ── Animated arrow ───────────────────────────────
                    Image(systemName: "arrow.right")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 18)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.deepNavy)
                        .offset(x: arrowOffset)
                        .onAppear {
                            withAnimation(
                                .easeInOut(duration: 0.6)
                                .repeatForever(autoreverses: true)
                            ) {
                                arrowOffset = 5
                            }
                        }
                }
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack {
        Color.deepNavy.ignoresSafeArea()
        VStack(spacing: 30) {
            ContinueButton(step: .discover, isDisabled: false) { }
            ContinueButton(step: .finish, isDisabled: false) { }
        }
    }
}
