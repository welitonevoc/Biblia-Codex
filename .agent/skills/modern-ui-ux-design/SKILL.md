---
name: modern-ui-ux-design
description: Guidelines for Creative & Modern UI Design. Covers Neumorphism, Dark Mode, Transparent Headers, Advanced Spatial awareness, Rounded elements, 3D animations, and Skeleton waiting screens.
---

# Modern UI / UX Design Guidelines

This skill dictates the **Visual and Aesthetic Rules** for any modern application. The days of solid color headers, sharp-edged rectangles, and flat lifeless interfaces are over. Use these principles to build premium, "wow-factor" experiences.

## 1. The 8 Pillars of Modern Mobile & Web UI

### #1 Transparent & Slipping Headers
*   **Solid color headers are outdated.** The fastest way to make an app feel modern is to remove rigid, solid-colored navigation bars.
*   **Implementation:** Use transparent headers that overlay the content, or headers that slide into view (slipping) only when the user scrolls for quick actions. This creates much-needed breathing room at the top of the app.

### #2 Neumorphism & Soft Shadows 
*   **Concept:** A progression from flat design, Neumorphism acts as an intermediate between 2D and 3D. 
*   **Aesthetic:** The UI elements appear extruded directly from the background. The background color and the card color must be identical.
*   **Implementation:** Depth is generated via a "drop shadow" (darker tone) and a "glow shadow" (lighter tone) on opposing corners. Use subtle pops of bright color over neutral canvas tones. Always ensure contrast ratios meet accessibility standards!

### #3 Dark Mode First
*   **Concept:** Dark mode is no longer an optional toggle; it's an expected core feature. It soothes eyes, saves OLED battery life, and brings dramatic attention to colorful focal points (UX tracking).
*   **Implementation:** Design high-legibility dark themes. Do not use pure pitch-black (`#000000`) for surfaces; use deep grays or deep blues. Ensure texts and icons maintain accessibility contrast over dark surfaces.

### #4 3D Animations & Elements
*   **Concept:** With advanced smartphone hardware, 3D is no longer just ornamental. It serves a practical purpose of interaction.
*   **Implementation:** Add subtle 3D interactions, 360-degree product views, or elegant 3D illustrations. Focus on interaction efficiency and "wow effects" that do not block the user flow.

### #5 Go For White Space (Negative Space)
*   **Concept:** Your interface must "breathe." Without space, users feel overwhelmed.
*   **Implementation:** Be incredibly liberal with margins, paddings, and line height. 
*   Keep related elements close together (Law of Proximity) and unrelated elements far apart. Establish a cohesive spacing token system (e.g., base-8 padding: 8px, 16px, 24px, 32px).

### #6 Hit the Curves
*   **Concept:** Rounded objects and elements are HIP. They appear friendlier, safer, and encourage interaction.
*   **Implementation:** Use rounded corners on buttons, cards, images, and bottom sheets (`border-radius: 16px` to `24px` or pill shapes). Completely sharp edges should only be used if the brand explicitly asks for an "aggressive" layout.

### #7 Make Waiting Delightful (Skeletons)
*   **Concept:** Users hate waiting. Blank screens with tiny loading spinners frustrate users and increase bounce rates.
*   **Implementation:** Always use **Skeleton Screens** (mockups of text, images, and content blocks) with smooth shimmer animations while data is fetching. 

### #8 Glorious Images & Illustrations
*   **Concept:** Visual data is processed 60,000 times faster than text.
*   **Implementation:** Rely heavily on high-quality photographs, bespoke illustrations, or 3D renders. Break long scrolls of text with engaging imagery related to the context to prevent boredom.

## 2. Research & Platform Convention Framework

*   **Respect Platform Guidelines:** While the design should be unique and modern, you must respect iOS (Human Interface Guidelines) and Android (Material Design) conventions. Users expect familiar patterns for basic interactions.
*   **Comprehensive Research:** Before designing, know the target demographic. Identify core business values. Determine primary vs secondary needs.
*   **Keep it Simple:** Eliminate unnecessary components. Direct the user toward specific actions. Ensure graphic elements are clickable and navigation is effortless.

## 3. Tech-Stack Specific Styling

*   **Flutter:** Use `BackdropFilter` for transparent blur headers. Rely on packages like `flutter_neumorphic`. Use `shimmer` for skeleton loading.
*   **React Native / Expo:** Use `@react-native-community/blur` for glass headers. Use `react-native-reanimated` for smooth 3D-like transitions.
*   **Web (Tailwind):** Use utilities like `backdrop-blur-md`, `bg-transparent`, and generate neumorphic shadow scales in `tailwind.config.js`. Use `animate-pulse` for skeleton screens. 
