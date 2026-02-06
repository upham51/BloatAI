import SwiftUI

/// # OnboardingView
///
/// The primary orchestrator for BloatAI's onboarding experience.
///
/// Architecture follows the reference project's elegant state-machine pattern:
/// a single `Step` enum drives all layout through computed properties, and
/// SwiftUI interpolates between them automatically inside `withAnimation`.
///
/// ## Steps
/// 1. `.start`    — Logo fades in on deep navy canvas
/// 2. `.appear`   — Glass cards fly in from off-screen, scatter around logo
/// 3. `.discover` — Cards slide down; serif headline "Decode Your Body's Signals"
/// 4. `.track`    — One card zooms; meal-tracking explanation appears
/// 5. `.patterns` — Cards regroup; Bento Grid of features
/// 6. `.name`     — Name input with glassmorphic underline
/// 7. `.goal`     — Goal picker (IBS / FODMAP / Wellness)
/// 8. `.finish`   — Personalized welcome with spread card flourish
///
struct OnboardingView: View {

    // MARK: - Focus State

    @FocusState private var isTextFieldFocused: Bool

    // MARK: - Theme Constants

    let backgroundColor: Color = .deepNavy
    let accentColor: Color = .mintGreen

    // MARK: - Animation State

    @State private var step: OnboardingStep = .start
    @State private var logoOpacity: CGFloat = 0
    @State private var buttonOpacity: CGFloat = 0
    @State private var subtitleOpacity: CGFloat = 0
    @State private var cloudOpacity: CGFloat = 0
    @State private var navigate = false
    @State private var user = UserProfile()

    // MARK: - Computed Layout Properties
    //
    // Each property returns a value per step. When `step` changes inside
    // `withAnimation`, SwiftUI smoothly interpolates every dependent frame.

    /// Cards invisible at `.start`, visible everywhere else.
    private var cardsOpacity: CGFloat {
        step == .start ? 0 : 1
    }

    /// Primary vertical offset for the top card pair.
    private var cardsYOffset: CGFloat {
        switch step {
        case .start:    return 100
        case .appear:   return 15
        case .discover: return screenHeight / 1.5
        case .track:    return screenHeight / 1.5
        case .patterns: return 200
        case .name:     return 0
        case .goal:     return 0
        case .finish:   return 0
        }
    }

    /// Secondary Y offset (bottom card pair offset from top pair).
    private var cardsDownYOffset: CGFloat {
        switch step {
        case .discover, .track: return screenHeight / 3
        case .patterns:         return 50
        default:                return 0
        }
    }

    /// Horizontal scatter distance — cards start far off-screen.
    private var cardsXOffset: CGFloat {
        step == .start ? 500 : 110
    }

    /// Rotation per step — alternates direction for visual dynamism.
    private var cardsRotation: CGFloat {
        switch step {
        case .start:    return 15
        case .appear:   return -15
        case .discover: return 15
        case .track:    return 15
        case .patterns: return -15
        case .name:     return -15
        case .goal:     return 15
        case .finish:   return 345
        }
    }

    /// Vertical offset for the "zoomed" card during `.track`.
    private var cardYOffset: CGFloat {
        if step == .track {
            return isCompact ? screenHeight / 1.9 : screenHeight / 1.7
        }
        return 0
    }

    /// Horizontal offset for the "zoomed" card during `.track`.
    private var cardXOffset: CGFloat {
        step == .track ? cardsXOffset : 0
    }

    /// Extra rotation on the featured card during `.track`.
    private var demoCardRotation: CGFloat {
        step == .track ? 15 : 360
    }

    /// Extra spread on `.finish` for dramatic flourish.
    private var finishRotation: CGFloat {
        step == .finish ? 30 : 0
    }

    /// Offset for `.patterns` step — pulls cards toward center.
    private var cardsPatternOffset: CGFloat {
        step == .patterns ? cardsYOffset - 50 : 0
    }

    /// Upward shift when collecting user data (`.name`, `.goal`).
    private var cardsUserDataOffset: CGFloat {
        (step == .name || step == .goal) ? 150 : 0
    }

    // MARK: - Helpers

    private var screenHeight: CGFloat { UIScreen.main.bounds.height }
    private var screenWidth: CGFloat { UIScreen.main.bounds.width }
    private var isCompact: Bool {
        screenWidth == 375 && screenHeight == 667 // iPhone SE
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            // ── Background gradient ──────────────────────────────────
            AppGradients.background
                .ignoresSafeArea()

            // ── Ambient glow (subtle mint behind cards) ──────────────
            Circle()
                .fill(Color.mintGreen.opacity(0.06))
                .blur(radius: 120)
                .frame(width: 400, height: 400)
                .offset(y: -100)

            // ── FINISH step content ──────────────────────────────────
            if step == .finish {
                finishContent
            }

            // ── DISCOVER step content ────────────────────────────────
            if step == .discover {
                discoverContent
            }

            // ── TRACK step content ───────────────────────────────────
            if step == .track {
                trackContent
            }

            // ── PATTERNS step content ────────────────────────────────
            if step == .patterns {
                patternsContent
            }

            // ── Card stack + inline step content ─────────────────────
            VStack(spacing: 0) {
                // Top card pair
                ZStack {
                    PlaceholderGlassCard(
                        icon: "fork.knife",
                        title: "Sourdough & Brie",
                        accentColor: accentColor
                    )
                    .rotationEffect(.degrees(-cardsRotation + 15))
                    .offset(
                        x: cardsXOffset - cardXOffset,
                        y: cardsYOffset - cardYOffset - cardsPatternOffset
                    )
                    .scaleEffect(trackCardScale(primary: true))

                    PlaceholderGlassCard(
                        icon: "cup.and.saucer.fill",
                        title: "Morning Latte",
                        accentColor: .softSage
                    )
                    .rotationEffect(.degrees(cardsRotation))
                    .offset(
                        x: -cardsXOffset,
                        y: -cardsYOffset + (cardsDownYOffset * 4)
                    )
                    .scaleEffect(trackCardScale(primary: false))
                }
                .opacity(cardsOpacity)
                .offset(y: -cardsUserDataOffset)

                // ── NAME step ────────────────────────────────────────
                if step == .name {
                    nameContent
                }

                // ── GOAL step ────────────────────────────────────────
                if step == .goal {
                    goalContent
                }

                // ── Logo + welcome text ──────────────────────────────
                VStack(spacing: 6) {
                    Text("Welcome to")
                        .font(AppFont.serifTitle3())
                        .foregroundStyle(Color.warmIvory.opacity(0.7))

                    Text("BloatAI")
                        .font(.system(size: 42, weight: .bold, design: .serif))
                        .foregroundStyle(accentColor)

                    Text("Culinary Intelligence")
                        .font(AppFont.caption())
                        .foregroundStyle(Color.softSage.opacity(0.6))
                        .tracking(3)
                        .textCase(.uppercase)
                        .padding(.top, 2)
                }
                .opacity(logoOpacity)
                .onAppear(perform: startEntryAnimation)

                // Bottom card pair
                ZStack {
                    PlaceholderGlassCard(
                        icon: "flame.fill",
                        title: "Spicy Ramen",
                        accentColor: .dustyRose
                    )
                    .rotationEffect(.degrees(-cardsRotation - finishRotation))
                    .offset(
                        x: cardsXOffset,
                        y: cardsYOffset - cardsDownYOffset - (cardsPatternOffset * 0.9)
                    )
                    .scaleEffect(trackCardScale(primary: false))

                    PlaceholderGlassCard(
                        icon: "leaf.fill",
                        title: "Garden Bowl",
                        accentColor: .mintGreen
                    )
                    .rotationEffect(.degrees(cardsRotation + finishRotation))
                    .offset(
                        x: -cardsXOffset,
                        y: -cardsYOffset + (cardsDownYOffset * 3) + cardsPatternOffset
                    )
                    .scaleEffect(trackCardScale(primary: false))
                }
                .padding(.top, 40)
                .offset(y: cardsUserDataOffset)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .foregroundStyle(Color.warmIvory)
        .navigationDestination(isPresented: $navigate) {
            // Navigate to main app
            Text("Main App")
        }
        // ── Bottom continue button ───────────────────────────────────
        .safeAreaInset(edge: .bottom) {
            ContinueButton(
                step: step,
                isDisabled: step == .name && user.name.isEmpty
            ) {
                if step == .finish {
                    navigate.toggle()
                } else {
                    withAnimation(.snappy(duration: 0.8)) {
                        advanceStep()
                    }
                }
            }
            .padding(.bottom, isCompact ? 8 : 0)
            .opacity(shouldHideButton ? 0 : buttonOpacity)
        }
    }

    // MARK: - Step Content Views

    /// `.discover` — Hero headline with staggered subtitle reveal.
    private var discoverContent: some View {
        VStack(spacing: 40) {
            VStack(spacing: 12) {
                Text("Decode Your")
                    .font(AppFont.serifTitle())
                    .foregroundStyle(Color.warmIvory)

                Text("Body's Signals")
                    .font(AppFont.serifLargeTitle())
                    .foregroundStyle(accentColor)
            }

            VStack(spacing: 16) {
                Text("AI-powered food intelligence that\nlearns your unique patterns")
                    .font(AppFont.body())
                    .foregroundStyle(Color.warmIvory.opacity(0.6))
                    .multilineTextAlignment(.center)

                // "Powered by" badge
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                        .font(.caption)
                        .foregroundStyle(accentColor)
                    Text("Powered by Claude AI")
                        .font(AppFont.caption())
                        .foregroundStyle(Color.softSage.opacity(0.7))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.06))
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                        )
                )
            }
            .opacity(subtitleOpacity)
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
                    withAnimation(.easeInOut(duration: 1.5)) {
                        subtitleOpacity = 1
                    }
                }
            }
        }
        .transition(.opacity)
        .frame(maxHeight: .infinity, alignment: .top)
        .padding(.top, screenHeight / 5)
    }

    /// `.track` — Meal tracking explanation with scrollable detail.
    private var trackContent: some View {
        VStack(spacing: 0) {
            // Headline
            VStack(spacing: 8) {
                Text("10 Seconds")
                    .font(AppFont.serifTitle())
                    .foregroundStyle(accentColor)
                Text("to Log a Meal")
                    .font(AppFont.serifTitle2())
                    .foregroundStyle(Color.warmIvory)
            }
            .frame(maxHeight: .infinity, alignment: .top)
            .padding(.top, 8)

            // Scrollable description
            ScrollView {
                Text("Snap a photo or describe your meal in words. Our AI identifies ingredients, estimates portions, flags potential triggers — and learns your body's unique responses over time.\n\nNo calorie counting. No food diaries. Just genuine understanding.")
                    .font(AppFont.body())
                    .foregroundStyle(Color.warmIvory.opacity(0.7))
                    .lineSpacing(6)
            }
            .frame(maxHeight: screenHeight / 5)
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.white.opacity(0.04))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                    )
            )
        }
        .transition(.opacity)
        .frame(maxHeight: .infinity)
        .padding(.horizontal, 20)
        .padding(.vertical, screenHeight / 8)
    }

    /// `.patterns` — Bento Grid feature showcase.
    private var patternsContent: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text("Your Personal")
                    .font(AppFont.serifTitle2())
                    .foregroundStyle(Color.warmIvory)
                Text("Food Atlas")
                    .font(AppFont.serifTitle())
                    .foregroundStyle(accentColor)
            }

            FeatureGrid(accentColor: accentColor)

            Text("Patterns emerge. Understanding follows.")
                .font(AppFont.caption())
                .foregroundStyle(Color.softSage.opacity(0.5))
                .tracking(1)
                .textCase(.uppercase)
                .opacity(cloudOpacity)
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
                        withAnimation(.snappy(duration: 1.5)) {
                            cloudOpacity = 1
                        }
                    }
                }
        }
        .offset(y: -20)
    }

    /// `.name` — Name input with glassmorphic underline.
    private var nameContent: some View {
        VStack(spacing: 0) {
            Text("What should we\ncall you?")
                .font(AppFont.serifTitle2())
                .foregroundStyle(Color.warmIvory)
                .multilineTextAlignment(.center)

            VStack(spacing: 6) {
                TextField(
                    text: $user.name,
                    prompt: Text("Your name")
                        .foregroundStyle(Color.softSage.opacity(0.4))
                ) { }
                .focused($isTextFieldFocused)
                .frame(maxWidth: .infinity, alignment: .center)
                .submitLabel(.done)
                .multilineTextAlignment(.center)
                .foregroundStyle(accentColor)
                .font(.system(size: 32, weight: .bold, design: .serif))
                .tint(accentColor)
                .toolbar {
                    ToolbarItemGroup(placement: .keyboard) {
                        Spacer()
                        Button("Done") { isTextFieldFocused = false }
                            .font(AppFont.bodyMedium())
                            .foregroundStyle(accentColor)
                    }
                }

                // Glass underline
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                accentColor.opacity(0.1),
                                accentColor.opacity(0.5),
                                accentColor.opacity(0.1)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(maxWidth: .infinity, maxHeight: 1)
                    .padding(.horizontal, 64)
            }
            .padding(.top, 20)
        }
        .offset(y: 20)
        .transition(.opacity)
    }

    /// `.goal` — Health goal picker with selectable glass tiles.
    private var goalContent: some View {
        VStack(spacing: 24) {
            VStack(spacing: 4) {
                Text("What brings you here,")
                    .font(AppFont.serifTitle3())
                    .foregroundStyle(Color.warmIvory.opacity(0.7))
                Text("\(user.name)?")
                    .font(AppFont.serifTitle())
                    .foregroundStyle(accentColor)
            }

            VStack(spacing: 12) {
                ForEach(HealthGoal.allCases) { goal in
                    GoalTile(
                        goal: goal,
                        isSelected: user.goal == goal,
                        accentColor: accentColor
                    ) {
                        withAnimation(.snappy(duration: 0.4)) {
                            user.goal = goal
                        }
                    }
                }
            }
            .padding(.horizontal, 32)
        }
        .offset(y: 20)
        .transition(.opacity)
    }

    /// `.finish` — Personalized welcome.
    private var finishContent: some View {
        VStack(spacing: 12) {
            Text("Welcome,")
                .font(AppFont.serifTitle2())
                .foregroundStyle(Color.warmIvory.opacity(0.7))

            Text(user.name)
                .font(.system(size: 44, weight: .bold, design: .serif))
                .foregroundStyle(accentColor)

            Text("Your journey to understanding\nyour body begins now")
                .font(AppFont.body())
                .foregroundStyle(Color.softSage.opacity(0.6))
                .multilineTextAlignment(.center)
                .padding(.top, 4)
        }
    }

    // MARK: - Animation Logic

    /// Triggers the entry sequence: logo fade → button fade → cards fly in.
    private func startEntryAnimation() {
        DispatchQueue.main.async {
            withAnimation(.easeInOut(duration: 0.6)) {
                logoOpacity = 1
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            withAnimation(.easeInOut(duration: 1)) {
                buttonOpacity = 1
            }
            withAnimation(.snappy(duration: 0.8)) {
                step = .appear
            }
        }
    }

    /// State machine — advances to the next step.
    private func advanceStep() {
        // Reset delayed-reveal opacities for fresh staggered animations
        subtitleOpacity = 0
        cloudOpacity = 0

        switch step {
        case .start:
            step = .appear
        case .appear:
            logoOpacity = 0
            step = .discover
        case .discover:
            step = .track
        case .track:
            step = .patterns
        case .patterns:
            step = .name
        case .name:
            step = .goal
        case .goal:
            step = .finish
        case .finish:
            break
        }
    }

    // MARK: - Helpers

    /// Scale factor for cards — larger during pattern/data steps,
    /// and the primary card zooms on `.track`.
    private func trackCardScale(primary: Bool) -> CGFloat {
        if step == .track && primary && !isCompact { return 1.3 }
        if step == .patterns || step == .name || step == .goal { return 1.2 }
        return 1
    }

    /// Hide the continue button while the name field is empty or keyboard is up.
    private var shouldHideButton: Bool {
        (step == .name && user.name.isEmpty) || isTextFieldFocused
    }
}

// MARK: - Goal Tile

/// Selectable glassmorphic tile for the goal picker step.
private struct GoalTile: View {
    let goal: HealthGoal
    let isSelected: Bool
    let accentColor: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: goal.icon)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 24, height: 24)
                    .foregroundStyle(isSelected ? accentColor : .warmIvory.opacity(0.4))

                VStack(alignment: .leading, spacing: 2) {
                    Text(goal.title)
                        .font(AppFont.bodyMedium())
                        .foregroundStyle(
                            isSelected ? accentColor : Color.warmIvory.opacity(0.8)
                        )
                    Text(goal.subtitle)
                        .font(AppFont.caption())
                        .foregroundStyle(Color.warmIvory.opacity(0.4))
                }

                Spacer()

                // Selection indicator
                Circle()
                    .fill(isSelected ? accentColor : Color.clear)
                    .frame(width: 12, height: 12)
                    .overlay(
                        Circle()
                            .stroke(
                                isSelected ? accentColor : Color.white.opacity(0.2),
                                lineWidth: 1.5
                            )
                    )
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 18)
                    .fill(
                        isSelected
                            ? accentColor.opacity(0.08)
                            : Color.white.opacity(0.04)
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(
                        isSelected
                            ? accentColor.opacity(0.4)
                            : Color.white.opacity(0.08),
                        lineWidth: isSelected ? 1.2 : 0.6
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        OnboardingView()
    }
    .preferredColorScheme(.dark)
}
