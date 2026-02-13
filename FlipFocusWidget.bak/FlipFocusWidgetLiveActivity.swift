import ActivityKit
import WidgetKit
import SwiftUI
import AppIntents

// Ensure FlipFocusAttributes.swift is added to this Target!

struct FlipFocusWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FlipFocusAttributes.self) { context in
            // Lock Screen/Banner UI
            VStack(alignment: .leading) {
                HStack {
                    Image(systemName: "brain.head.profile")
                        .foregroundColor(.indigo)
                    Text("Deep Work")
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                    Text(context.state.endTime, style: .timer)
                        .font(.system(.title2, design: .monospaced))
                        .fontWeight(.bold)
                        .foregroundColor(.yellow)
                }
                
                Spacer()
                
                HStack {
                    Text("Stay focused.")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                    
                    if #available(iOS 17.0, *) {
                        Button(intent: StopSessionIntent()) {
                            Text("Stop Session")
                                .font(.caption)
                                .fontWeight(.bold)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.red.opacity(0.8))
                                .foregroundColor(.white)
                                .cornerRadius(16)
                        }
                    } else {
                        // Fallback for iOS 16
                        Text("Open App to Stop")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .activityBackgroundTint(Color(red: 0.1, green: 0.1, blue: 0.1))
            .activitySystemActionForegroundColor(Color.indigo)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    VStack {
                        Label("Focus", systemImage: "brain.head.profile")
                            .font(.caption)
                            .foregroundColor(.indigo)
                    }
                    .dynamicIsland(verticalPlacement: .belowIfTooWide)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.endTime, style: .timer)
                        .font(.title2)
                        .monospacedDigit()
                        .foregroundColor(.yellow)
                        .dynamicIsland(verticalPlacement: .belowIfTooWide)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Spacer()
                        if #available(iOS 17.0, *) {
                            Button(intent: StopSessionIntent()) {
                                Label("Stop Session", systemImage: "stop.circle.fill")
                                    .padding()
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.red)
                        } else {
                           Text("Tracking Focus...")
                                .foregroundColor(.gray)
                        }
                        Spacer()
                    }
                }
            } compactLeading: {
                Label {
                    Text("Focus")
                } icon: {
                    Image(systemName: "brain.head.profile")
                        .foregroundColor(.indigo)
                }
                .labelStyle(.iconOnly)
            } compactTrailing: {
                Text(context.state.endTime, style: .timer)
                    .monospacedDigit()
                    .foregroundColor(.yellow)
                    .frame(maxWidth: 40)
            } minimal: {
                 Image(systemName: "brain.head.profile")
                    .foregroundColor(.indigo)
            }
        }
    }
}
