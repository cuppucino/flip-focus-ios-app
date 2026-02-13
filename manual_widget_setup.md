import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.1, \*)
struct FlipFocusWidget: Widget {
var body: some WidgetConfiguration {
ActivityConfiguration(for: FlipFocusAttributes.self) { context in
// --- LOCK SCREEN / NOTIFICATION CENTER UI ---
// Convert the Double timestamp (seconds) to a Date object
let startDate = Date(timeIntervalSince1970: context.state.startTime)

            VStack(alignment: .leading) {
                HStack {
                    Image(systemName: "hourglass")
                        .foregroundColor(.indigo)
                    Text("Focus Session")
                        .font(.headline)
                        .foregroundColor(.indigo)
                    Spacer()
                    // Timer updates automatically using the Date object
                    Text(timerInterval: startDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.title2)
                        .foregroundColor(.primary)
                }

                Spacer()

                HStack {
                   Label(context.state.phase.capitalized, systemImage: "brain.head.profile")
                       .font(.subheadline)
                       .foregroundColor(.secondary)
                }
            }
            .padding()
            .activityBackgroundTint(Color.cyan.opacity(0.1))
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            // --- DYNAMIC ISLAND UI ---
            // Convert the Double timestamp to a Date object
            let startDate = Date(timeIntervalSince1970: context.state.startTime)

            // ERROR FIX: 'return' is mandatory here because we have multiple lines in the closure
            return DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Label("Focus", systemImage: "brain")
                        .font(.caption)
                        .foregroundColor(.indigo)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: startDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.title2)
                        .foregroundColor(.indigo)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.phase.capitalized)
                        .font(.body)
                }
            } compactLeading: {
                Image(systemName: "hourglass")
                    .foregroundColor(.indigo)
            } compactTrailing: {
                Text(timerInterval: startDate...Date.distantFuture, countsDown: false)
                    .monospacedDigit()
                    .frame(width: 50)
                    .foregroundColor(.indigo)
            } minimal: {
                Image(systemName: "hourglass")
                    .foregroundColor(.indigo)
            }
        }
    }

}
