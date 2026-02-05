import Foundation

/// Lightweight model capturing onboarding inputs.
struct UserProfile: Codable {
    let id: String
    var name: String
    var goal: HealthGoal

    init(id: String = UUID().uuidString, name: String = "", goal: HealthGoal = .general) {
        self.id = id
        self.name = name
        self.goal = goal
    }
}

/// Primary health goals presented during onboarding.
enum HealthGoal: String, Codable, CaseIterable, Identifiable {
    case ibs       = "ibs"
    case fodmap    = "fodmap"
    case general   = "general"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .ibs:     return "Manage IBS"
        case .fodmap:  return "FODMAP Sensitivity"
        case .general: return "General Wellness"
        }
    }

    var subtitle: String {
        switch self {
        case .ibs:     return "Track triggers and reduce flare-ups"
        case .fodmap:  return "Identify high-FODMAP foods to avoid"
        case .general: return "Understand how food affects your body"
        }
    }

    var icon: String {
        switch self {
        case .ibs:     return "waveform.path.ecg"
        case .fodmap:  return "leaf.fill"
        case .general: return "heart.text.square.fill"
        }
    }
}
