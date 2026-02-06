import Foundation

/// State machine driving the entire onboarding animation choreography.
///
/// Each case maps to a distinct visual state. Computed properties in
/// `OnboardingView` return layout values for each step, and SwiftUI
/// interpolates between them when the step changes inside `withAnimation`.
enum OnboardingStep {
    case start      // Initial — cards off-screen, logo fades in
    case appear     // Cards fly in, scatter around logo
    case discover   // Cards slide down, "Decode Your Body's Signals" headline
    case track      // One card zooms, meal-tracking explanation
    case patterns   // Cards regroup, Bento Grid of features
    case name       // Text field — "What should we call you?"
    case goal       // Goal picker — IBS / FODMAP / Wellness
    case finish     // Personalized welcome
}
