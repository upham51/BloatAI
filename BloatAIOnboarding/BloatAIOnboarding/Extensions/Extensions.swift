import SwiftUI

// MARK: - UIScreen Helpers

extension UIScreen {
    /// Screen width shorthand.
    static var screenWidth: CGFloat { UIScreen.main.bounds.width }

    /// Screen height shorthand.
    static var screenHeight: CGFloat { UIScreen.main.bounds.height }

    /// Detect iPhone SE (2nd/3rd gen) or similarly compact devices.
    static var isCompact: Bool { screenWidth == 375 && screenHeight == 667 }
}

// MARK: - View Helpers

extension View {
    /// Conditionally applies a transformation.
    @ViewBuilder
    func `if`<Content: View>(
        _ condition: Bool,
        transform: (Self) -> Content
    ) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}
