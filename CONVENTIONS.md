# Biblia Codex: Convenciones y Sistema de Diseño (Premium)

Este documento describe los principios y estándares técnicos que mantienen la identidad visual "Premium" y la robustez del proyecto.

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño **Borderless & Surface-based** (Sin Bordes, Basado en Superficies).

### Design Tokens (CSS Variables)

- **Fuentes:**
  - Sans: `Manrope` (UI, botones, inputs)
  - Serif: `Libre Baskerville` (Texto bíblico principal)
  - Display: `Cormorant Garamond` (Títulos grandes, kicks)
- **Superficies:**
  - `var(--surface-1)`: Elevación sutil (fondos de tarjetas).
  - `var(--surface-overlay)`: Fondo para modales y hojas laterales (Glassmorphism).
- **Sombras Premium:**
  - `shadow-float`: Sombra profunda para elementos que "flotan" sobre el contenido.
  - `shadow-glow`: Brillo suave del color de acento.

### Principios UI

1. **Jerarquía Visual por Profundidad:** Evitar bordes negros o grises. Usar sombras suaves y sutiles cambios en el color de fondo para separar secciones.
2. **Glassmorphism:** Usar `backdrop-blur` en elementos superpuestos para mantener el contexto visual.
3. **Micro-animaciones:** Cada interacción debe tener una respuesta fluida. Usar `framer-motion` con `ease-premium` (`cubic-bezier(0.23, 1, 0.32, 1)`).

## 🛠 Convenciones Técnicas (TypeScript)

### 1. Tipado Estricto (Poka-Yoke)

- **Evitar `any`**: Todas las interfaces de datos deben estar en `src/types.ts`.
- **Mapeo de Datos**: Usar `mapResultRow<T>` en `BibleService.ts` para convertir filas de SQLite en objetos tipados automáticamente.
- **Interfaces Centralizadas**: No definir interfaces locales si ya existen globalmente.

### 2. Organización de Componentes

- **Componentes Common**: Elementos reutilizables (botones, chips, wrappers) deben vivir en `src/components/Common` o `src/components/ui`.
- **Lógica en Services**: El manejo de bases de datos SQLite debe permanecer exclusivamente en `BibleService.ts`.

## 🚀 Mejora Continua (Kaizen)

- **Pequenas Mejores**: "Dejar el código mejor de lo que se encontró".
- **JIT (Just-In-Time)**: No construir frameworks genéricos si no se necesitan 3 o más implementaciones similares.
- **Validación Continua**: Ejecutar `npm run lint` antes de cada commit.
