---
name: mobile-layout-expert
description: Expert in Responsive, Adaptive, and Cross-Platform Mobile Layouts. Modern techniques for Flutter, iOS Swift (Auto Layout/SwiftUI), and Android (ConstraintLayout/Compose). Triggers on layout, responsive, adaptive, constraintlayout, auto layout.
---

# Mobile Layout Expert

This skill provides advanced, up-to-date guidance on how to build user interfaces that adapt gracefully to any screen size, orientation, or device type (phone, tablet, foldable).

## 1. Core Design Philosophies

* **Responsive Layout:** The UI automatically adjusts to different screen sizes and orientations fluidly using proportions. The same elements shift, resize, or wrap (e.g., a grid changing from 2 columns to 4 columns).
* **Adaptive Layout:** Completely different UI architectures or specific element variations are rendered depending on the device type context (e.g., a Bottom Navigation Bar on a compact phone screen vs. a persistent Navigation Rail/Sidebar on a tablet or desktop).
* **Cross-platform UI:** In frameworks like Flutter, React Native, or Capacitor, this implies writing core layout logic centrally but gracefully falling back to native paradigms when necessary (e.g., iOS Cupertino styling vs. Android Material Design) to preserve platform trust and feel.

## 2. Flutter (Modern Layouts)

Flutter uses a flexible, constraints-down, sizes-up model.

* **Responsive Strategies:**
  * **`LayoutBuilder`**: The holy grail for local responsive design. It provides a `BoxConstraints` object to decide what to build based on the parent's *available space*, NOT just the screen size.
  * **`MediaQuery` / `MediaQuery.sizeOf(context)`**: Use for global screen metrics safely without full rebuilds.
  * **`Flexible` / `Expanded`**: For proportional distributions within `Row` and `Column`.
  * **`Wrap`**: For dynamic flow of chips or buttons that wrap to the next line when space runs out.
* **Adaptive Strategies:**
  * Use **`flutter_adaptive_scaffold`** for out-of-the-box adaptive patterns (Navigation Rail on wide screens, Bottom Nav on small screens).
  * Check `Theme.of(context).platform` or `Platform.isIOS` conditionally to return `Cupertino` widgets vs `Material` widgets.
* **Modern Trends (Flutter 3.x+):** Heavy use of `Sliver` widgets for complex scrollable viewports that restructure dynamically.

## 3. iOS (SwiftUI & Auto Layout)

* **SwiftUI (The Modern Standard):**
  * **`GeometryReader`**: Use when you need exact sizes, but prefer `ViewThatFits` (iOS 16+) which automatically chooses the first layout that fits in the available space.
  * **Adaptive:** `NavigationSplitView` and `NavigationStack` automatically adapt between single-stack push navigation on phones and multi-column sidebars on iPads and Macs.
  * **Grids:** `LazyVGrid` and `LazyHGrid` using `GridItem(.adaptive(minimum: ...))` allows wrapping fluidly.
* **Auto Layout (UIKit):**
  * Uses mathematical constraints (e.g., "Button leading = View leading + 20").
  * **Size Classes:** (Compact vs Regular width/height). The core of adaptive design in UIKit. You activate different `NSLayoutConstraint` sets depending on the current `UITraitCollection`.
  * **Stack Views (`UIStackView`):** Configure the axis (Horizontal/Vertical) dynamically based on trait collections.

## 4. Android (Jetpack Compose & ConstraintLayout)

* **Jetpack Compose (The Modern Standard):**
  * **`BoxWithConstraints`**: The Compose equivalent of Flutter's `LayoutBuilder`. It provides `maxWidth` and `maxHeight` so your composable can redesign its internals based on the space given to it.
  * **Window Size Classes:** The official Android guideline. Calculate `calculateWindowSizeClass()`:
    * `Compact` (Phones)
    * `Medium` (Foldables, small tablets)
    * `Expanded` (Tablets, desktop)
  * **Adaptive Architecture:** Utilize `ListDetailPaneScaffold` (from Material 3 adaptive libraries) for automatic two-pane layouts on foldables/tablets that collapse to one pane on phones.
  * **Flow Layouts:** `FlowRow` and `FlowColumn` for responsive wrapping of dynamic content.
* **ConstraintLayout (XML & Compose):**
  * XML: Use `res/layout` for phones and `res/layout-sw600dp` for tablets. Use Guidelines (percentage-based) and Chains to distribute space evenly.
  * Compose: Use `ConstraintLayout` when you have complex flat positioning that would require heavily nested Rows/Columns. Animations between states can be managed via `MotionLayout` (or `MotionScene`).

## Rules & Checklists for Layouts

1. **Avoid Hardcoded Sizes:** Rely on padding, constraints, weights, and flex values instead of explicit widths/heights.
2. **Design for the "In-Between":** Foldable devices are becoming common. Your layout must gracefully transition during window resizing or folding.
3. **Respect Safe Areas:** Always utilize `SafeArea` (Flutter), `safeAreaPadding` (SwiftUI), or `WindowInsets` (Compose) to prevent drawing content under notches, punch-holes, or dynamic islands.
4. **Touch Targets:** Adaptive layouts must ensure that as screens get smaller, touch targets DO NOT shrink below platform defaults (44pt iOS, 48dp Android).
