# How to Add Missing Files to Xcode

The following files were restored to your disk but are not yet linked to the build system:

1. `LiveActivityModule.m`
2. `LiveActivityModule.swift`
3. `FlipFocusAttributes.swift`

You must verify that these are properly added to your Xcode project for the app to build.

## Step-by-Step Instructions

1.  **Open the Project**:
    - Open your terminal.
    - Run: `open ios/flipfocusapp.xcworkspace`
    - This will launch Xcode.

2.  **Locate the Group**:
    - In the **Project Navigator** (left sidebar), find the yellow folder named `flipfocusapp`.
    - It should contain `AppDelegate.swift`, `Info.plist`, etc.

3.  **Add Files**:
    - **Right-click** on the `flipfocusapp` folder.
    - Select **"Add Files to 'flipfocusapp'..."**

4.  **Select the Files**:
    - Navigate to the `ios/flipfocusapp` directory in the file picker.
    - Select these three files (hold Cmd to select multiple):
      - `LiveActivityModule.m`
      - `LiveActivityModule.swift`
      - `FlipFocusAttributes.swift`

5.  **Important Options** (Click "Options" if hidden):
    - [x] **Copy items if needed**: (Optional, since they are already there, but good to check)
    - [x] **Create groups**: Selected
    - [x] **Add to targets**: Check the box for **`flipfocusapp`** (the main app target).

6.  **Finish**:
    - Click **Add**.

7.  **Verify**:
    - The files should now appear in the project navigator.
    - Press **Cmd+B** to build. The errors about "LiveActivityModule" should be gone.
