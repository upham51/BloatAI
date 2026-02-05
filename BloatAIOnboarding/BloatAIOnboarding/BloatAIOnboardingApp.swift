import SwiftUI

@main
struct BloatAIOnboardingApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                OnboardingView()
            }
            .preferredColorScheme(.dark)
        }
    }
}
