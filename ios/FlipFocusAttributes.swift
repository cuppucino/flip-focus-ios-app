import ActivityKit
import Foundation

struct FlipFocusAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic state
        var startTime: Double
        var phase: String // "focusing", "break", "summary"
    }

    // Fixed non-changing properties
    var name: String
}
