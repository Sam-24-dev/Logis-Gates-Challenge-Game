# Logic Gates Challenge Game V2 — Plan maestro de producto, diseño e implementación

Este documento es la fuente principal para construir la versión 2.0 de `Logic Gates Challenge Game`. La V2 debe transformar la app básica actual en un producto educativo interactivo, profesional, rápido, entretenido y memorable.

> Estado del plan V2: **fases 0–10 completadas (ver Phase tracker, sección 18).** Este documento conserva el historial de implementación V2; no enumera todas las tareas posteriores al lanzamiento.

## 1. Decisión principal

La V2 se construirá como una experiencia tipo **Digital Logic Lab**: un laboratorio/juego educativo donde el usuario aprende compuertas lógicas resolviendo circuitos, viendo señales moverse, recibiendo retroalimentación útil y progresando por niveles.

La app no debe sentirse como una plantilla SaaS, ni como UI genérica generada por IA, ni como una práctica escolar básica. Debe sentirse como un producto de portafolio serio, con identidad visual propia y valor educativo real.

## 2. Stack aprobado

| Área | Decisión |
| --- | --- |
| Build/dev | Vite |
| UI | React |
| Lenguaje | TypeScript |
| Circuitos | SVG responsive |
| Motion | Motion + CSS/Web Animations controladas |
| Estilos | CSS propio con tokens, no Tailwind inicialmente |
| Deploy | Vercel |
| Tests | Vitest para lógica; Playwright opcional para flujos UI |
| Persistencia | `localStorage` |
| Backend | No en V2 inicial |
| 3D | No Three.js en el core; usar 2.5D visual con SVG/CSS/Motion |

## 3. Principios de producto

1. **Aprender jugando**: cada interacción debe enseñar algo, no solo validar si la salida es `1`.
2. **Claridad antes que espectáculo**: motion, profundidad y estética deben mejorar comprensión, no distraer.
3. **Rápido en móvil**: nada de efectos pesados que rompan performance.
4. **Identidad propia**: evitar look genérico de SaaS, dashboard o plantilla AI.
5. **Progresión clara**: el usuario debe saber dónde está, qué logró y qué sigue.
6. **Feedback educativo**: explicar por qué una combinación funciona o falla.
7. **Accesibilidad real**: teclado, foco visible, contraste, `aria-live`, reduced motion y estados no dependientes solo del color.
8. **Arquitectura escalable**: agregar niveles, gates, modos y pantallas debe ser sencillo.
9. **Iteraciones pequeñas**: construir por fases, validar cada fase y no mezclar cambios enormes sin necesidad.
10. **Deploy profesional**: Vercel con previews para revisar cada etapa.

## 4. Dirección visual aprobada

### Nombre de dirección

**Retro-futuristic Digital Lab**

### Qué debe transmitir

- Laboratorio digital.
- Circuitos vivos.
- Aprendizaje interactivo.
- Juego moderno.
- Energía y precisión técnica.
- Producto serio, no juguete barato.

### Elementos visuales clave

| Elemento | Decisión |
| --- | --- |
| Fondo | Oscuro profundo con grid/circuit pattern sutil. |
| Paneles | Cards tipo consola/laboratorio con bordes luminosos controlados. |
| Circuitos | SVG con wires, gates, nodos y salida luminosa. |
| Color dominante | Azul/indigo profundo. |
| Acentos | Cian para señal, naranja para acción principal, verde para éxito. |
| Tipografía | Una fuente display técnica para títulos y una fuente accesible para texto. |
| Movimiento | Señales viajando, gate pulse, LED transition, transiciones cortas. |
| Profundidad | 2.5D con sombras, capas, perspectiva sutil y glow medido. |

### Qué evitar

- Plantilla SaaS genérica.
- Gradientes morados tipo AI genérico.
- Glassmorphism excesivo.
- Neon barato o saturado.
- Animaciones constantes sin propósito.
- Three.js pesado para el gameplay central.
- Tailwind/shadcn look por defecto.
- Emojis como iconos de UI principal.

## 5. Experiencia objetivo del usuario

La experiencia debe producir esta secuencia emocional:

1. **Primer vistazo**: “Esto se ve profesional.”
2. **Primer nivel**: “Entiendo qué debo hacer.”
3. **Primer error**: “Ahora entiendo por qué fallé.”
4. **Primer acierto**: “Se sintió bien, quiero seguir.”
5. **Varios niveles**: “Estoy aprendiendo sin sentir que estudio.”
6. **Final**: “Esto parece un producto real, no una práctica básica.”

## 6. Alcance funcional de V2

### Incluido en V2

- Migración a Vite + React + TypeScript.
- Rediseño visual completo.
- Diseño responsive real para móvil, tablet y desktop.
- Circuit renderer en SVG.
- Animación de señales en cables.
- Estados ON/OFF claros con texto, color y señal visual.
- Modo práctica.
- Modo reto.
- Progreso por niveles.
- Score básico.
- Streak básico.
- Timer para modo reto.
- Feedback educativo dinámico.
- Tabla de verdad por nivel.
- Explicación de cada compuerta.
- Pantalla final profesional.
- Persistencia local de progreso/mejor resultado.
- Accesibilidad base seria.
- Deploy en Vercel.
- README actualizado.
- Documentación de arquitectura y decisiones.

### Fuera de V2 inicial

- Backend.
- Login/usuarios.
- Ranking online.
- Multiplayer.
- Editor visual de circuitos libre.
- IA generando niveles.
- Three.js como base del juego.
- PWA avanzada.
- Internacionalización completa multi-idioma.

Estos puntos pueden ser V3 o futuras mejoras.

## 7. Arquitectura objetivo

Estructura propuesta:

```text
Logis-Gates-Challenge-Game/
├── AGENTS.md
├── documentation/
│   ├── repository-analysis.md
│   └── v2-product-implementation-plan.md
├── public/
│   ├── favicon.svg
│   └── social-preview.png
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── appTypes.ts
│   ├── components/
│   │   ├── CircuitBoard/
│   │   ├── CompletionScreen/
│   │   ├── FeedbackPanel/
│   │   ├── GateNode/
│   │   ├── InputToggle/
│   │   ├── LevelHeader/
│   │   ├── ModeCard/
│   │   ├── SignalWire/
│   │   └── TruthTable/
│   ├── core/
│   │   ├── evaluateCircuit.ts
│   │   ├── evaluateGate.ts
│   │   ├── scoring.ts
│   │   └── truthTable.ts
│   ├── data/
│   │   ├── gates.ts
│   │   └── levels.ts
│   ├── hooks/
│   │   ├── useGameSession.ts
│   │   ├── usePrefersReducedMotion.ts
│   │   └── useStoredProgress.ts
│   ├── screens/
│   │   ├── ChallengeScreen.tsx
│   │   ├── LevelScreen.tsx
│   │   ├── ModeSelectScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── WelcomeScreen.tsx
│   ├── state/
│   │   ├── gameReducer.ts
│   │   └── initialState.ts
│   ├── styles/
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── motion.css
│   │   └── tokens.css
│   ├── test/
│   │   └── fixtures.ts
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

La estructura puede ajustarse durante implementación, pero la separación de responsabilidades debe mantenerse.

## 8. Separación de responsabilidades

| Módulo | Responsabilidad |
| --- | --- |
| `data/gates.ts` | Definir compuertas, nombres, descripciones, reglas y metadata educativa. |
| `data/levels.ts` | Definir niveles, inputs, circuito, objetivo, dificultad y contenido educativo. |
| `core/evaluateGate.ts` | Evaluar compuertas puras sin DOM ni React. |
| `core/evaluateCircuit.ts` | Evaluar circuitos completos desde datos. |
| `core/truthTable.ts` | Generar tablas de verdad automáticamente. |
| `core/scoring.ts` | Calcular score, streak, bonus de tiempo y penalizaciones. |
| `state/gameReducer.ts` | Controlar estado del juego de forma predecible. |
| `hooks/useGameSession.ts` | Orquestar sesión actual, inputs, avance y modo. |
| `components/CircuitBoard` | Render SVG del circuito. |
| `components/SignalWire` | Visual y animación de cables/señales. |
| `components/GateNode` | Visual de compuertas. |
| `components/InputToggle` | Control accesible para entradas ON/OFF. |
| `components/FeedbackPanel` | Explicación dinámica y estado del intento. |
| `components/TruthTable` | Tabla de verdad semántica/accesible. |
| `screens/*` | Pantallas principales de experiencia. |
| `styles/tokens.css` | Sistema visual centralizado. |

## 9. Modelo de juego propuesto

### Modo práctica

Objetivo: aprender sin presión.

Características:

- Sin timer obligatorio.
- Salida se actualiza en vivo.
- Feedback educativo completo.
- Tabla de verdad disponible.
- Hints disponibles.
- Avance automático o botón “Continue” cuando se resuelve.

### Modo reto

Objetivo: jugar y mejorar rendimiento.

Características:

- Timer por nivel o por set de niveles.
- Score.
- Streak.
- Menos hints por defecto.
- Botón de envío tipo “Submit Signal”.
- Resultado final con desempeño.

### Reglas iniciales de score

- +100 por nivel correcto.
- Bonus por tiempo restante.
- Bonus por streak.
- Penalización ligera por intentos incorrectos.
- No castigar excesivamente en niveles de aprendizaje.

Las reglas exactas pueden ajustarse cuando se implemente `scoring.ts`.

## 10. Contenido educativo esperado

Cada compuerta debe tener:

- Nombre corto: `AND`, `OR`, `XOR`, `NAND`, `NOT`.
- Nombre legible.
- Explicación simple.
- Regla lógica.
- Ejemplo.
- Mensaje para error común.
- Color/acento visual opcional.

Cada nivel debe tener:

- Título.
- Dificultad.
- Objetivo.
- Inputs.
- Circuito.
- Resultado esperado.
- Explicación al resolver.
- Hint opcional.
- Tabla de verdad generable.

## 11. Pantallas de V2

### 11.1 WelcomeScreen

Propósito: vender la experiencia y orientar al usuario.

Debe incluir:

- Hero visual con mini circuito animado.
- Título fuerte.
- Subtítulo claro.
- CTA principal: iniciar laboratorio.
- CTA secundaria: ver cómo funciona.
- Preview de conceptos: gates, signals, truth tables, challenge mode.

Criterios:

- Debe verse memorable en captura.
- No debe parecer landing SaaS genérica.
- Debe cargar rápido.
- Debe ser usable en móvil.

### 11.2 ModeSelectScreen

Propósito: permitir elegir experiencia.

Debe incluir:

- Card de Practice Mode.
- Card de Challenge Mode.
- Descripción breve de cada modo.
- Estado de progreso si existe `localStorage`.
- CTA claro por modo.

Criterios:

- El usuario entiende diferencia entre aprender y retarse.
- Cards accesibles con teclado.
- Sin dependencia exclusiva del color.

### 11.3 LevelScreen

Propósito: core del producto.

Debe incluir:

- Header con nivel, dificultad, progreso, score/streak según modo.
- CircuitBoard SVG.
- Input controls.
- Output/LED.
- FeedbackPanel.
- TruthTable o panel colapsable.
- Acción principal según modo.
- Botón de reset/retry.
- Botón de salida al menú.

Criterios:

- En desktop, circuito y panel educativo deben convivir bien.
- En móvil, debe organizarse verticalmente sin overflow.
- El circuito debe entenderse sin leer todo el texto.
- Cada acción del usuario debe tener respuesta visual inmediata.

### 11.4 ResultsScreen

Propósito: cerrar experiencia y aumentar replay value.

Debe incluir:

- Mensaje de finalización.
- Niveles completados.
- Score final.
- Streak máximo.
- Tiempo total si aplica.
- Mejor resultado guardado si aplica.
- CTA para repetir.
- CTA para cambiar modo.
- CTA para volver al inicio.

Criterios:

- No usar `alert()`.
- Debe sentirse como cierre de juego.
- Debe motivar a jugar otra vez.

## 12. Sistema visual

### Tokens mínimos

- Colores base.
- Colores de estado.
- Espaciado.
- Radios.
- Sombras.
- Tipografía.
- Duraciones de motion.
- Breakpoints.

### Estados visuales

| Estado | Indicadores requeridos |
| --- | --- |
| Input OFF | Texto `OFF`, valor `0`, color neutro/rojo controlado. |
| Input ON | Texto `ON`, valor `1`, color activo, cable iluminado. |
| Output 0 | LED apagado, texto `Y = 0`, explicación. |
| Output 1 | LED activo, texto `Y = 1`, señal visual. |
| Correcto | Color éxito + texto + icono/SVG + anuncio accesible. |
| Incorrecto | Color alerta + texto + sugerencia clara. |
| Focus | Ring visible y consistente. |
| Disabled | Opacidad y texto claro; no solo color. |

## 13. Motion design

### Usar motion para

- Entrada de pantallas.
- Señal viajando por cable.
- Gate pulse al evaluar.
- LED transition.
- Feedback correcto/incorrecto.
- Celebración final moderada.
- Hover/focus de controles.

### No usar motion para

- Fondos infinitos pesados.
- Efectos que no enseñan nada.
- Cambios que causen layout shift.
- Animaciones largas que ralenticen el juego.
- Elementos que puedan marear sin alternativa.

### Reglas técnicas

- Preferir `transform`, `opacity`, `stroke-dashoffset`, `pathLength`.
- Evitar animar `width`, `height`, `top`, `left`.
- Respetar `prefers-reduced-motion`.
- No usar `transition: all`.
- Animaciones entre 150ms y 500ms salvo celebración final.

## 14. Accesibilidad

Checklist obligatorio para V2:

- [ ] Usar `<main>` y estructura semántica.
- [ ] Tener `<h1>` principal.
- [ ] Botones reales para acciones.
- [ ] No usar divs clickeables.
- [ ] Foco visible con `:focus-visible`.
- [ ] Feedback dinámico con `aria-live="polite"`.
- [ ] Truth table como tabla semántica.
- [ ] Contraste mínimo WCAG AA.
- [ ] Estados ON/OFF no dependen solo de color.
- [ ] Navegación por teclado completa.
- [ ] Respetar `prefers-reduced-motion`.
- [ ] Tamaños táctiles adecuados en móvil.
- [ ] SVG con título/descripción cuando aporte significado.

## 15. Performance

Objetivos:

| Métrica | Objetivo |
| --- | --- |
| Mobile responsive | Sin overflow horizontal. |
| Animaciones | 60fps en dispositivos normales. |
| Lighthouse Performance | 90+ como meta. |
| Lighthouse Accessibility | 90+ como meta. |
| JS inicial | Controlado; evitar librerías pesadas innecesarias. |
| Tiempo de interacción | Rápido y sin bloqueos perceptibles. |

Reglas:

- No Three.js en core.
- SVG para circuitos.
- Motion moderado.
- Assets optimizados.
- Evitar renders innecesarios.
- Tests de lógica separados de UI.
- Revisar bundle al final.

## 16. Deploy Vercel

Objetivo: V2 debe desplegarse en Vercel.

### Flujo esperado

1. Crear proyecto Vite.
2. Confirmar `npm run build`.
3. Conectar repo a Vercel.
4. Usar previews por PR.
5. Promover a producción cuando V2 esté lista.

### Consideraciones

- Vercel detecta Vite.
- Build command esperado: `npm run build`.
- Output directory esperado: `dist`.
- Si se usa SPA con rutas internas, agregar `vercel.json` con rewrites.
- Para esta app se puede evitar routing complejo al inicio.

## 17. Plan por fases

## Fase 0 — Preparación y baseline

### Objetivo

Preparar la rama, confirmar alcance y establecer baseline del proyecto actual antes de modificar.

### Trabajo

- Crear rama `feature/ui-ux-v2`.
- Confirmar que `main` está limpio o documentar cambios pendientes.
- Revisar `documentation/repository-analysis.md`.
- Revisar este plan maestro.
- Confirmar workflow de Vercel disponible.
- Tomar screenshots de app actual si se desea comparar antes/después.

### Entregables

- Rama creada.
- Estado inicial documentado.
- Decisión de implementación confirmada.

### Definition of Done

- [x] Rama `feature/ui-ux-v2` creada.
- [x] Plan leído.
- [x] Sin cambios de código todavía o solo configuración acordada.
- [x] Engram actualizado con inicio de fase.

### Resultado de Fase 0

- Rama activa creada: `feature/ui-ux-v2`.
- `main` estaba sincronizada con `origin/main`; los únicos cambios pendientes eran documentos nuevos de planificación (`AGENTS.md` y `documentation/`).
- Se revisaron `documentation/repository-analysis.md`, este plan maestro y las memorias de Engram del proyecto.
- Se confirmó que todavía no existe tooling moderno (`package.json`, Vite, tests, Vercel config); eso corresponde a Fase 1 y Fase 9.
- Se revisó workflow de Vercel disponible: la skill de Vercel existe, pero la CLI local `vercel` no está instalada o no está en `PATH`. Para Fase 9 se podrá usar CLI si se instala/configura o el fallback de la skill.
- Se inspeccionó la demo pública como baseline visual y funcional.
- Baseline responsive móvil confirmado: a 375px existe overflow horizontal (`scrollWidth: 508`), pendiente de corregir en Fase 3.
- Baseline de consola/red: la app carga y el flujo básico funciona; se mantiene la observación menor de `favicon.ico` 404.
- No se implementó código de producto en esta fase.

Validación ejecutada:

```bash
node --check "Proyecto MD.js"
git --no-pager status --short --branch
git --no-pager diff --check
command -v vercel
```

Capturas baseline generadas desde la demo pública y guardadas para comparación futura:

- `documentation/baseline/phase0-baseline-desktop-welcome.png`
- `documentation/baseline/phase0-baseline-desktop-level1-solved.png`
- `documentation/baseline/phase0-baseline-mobile-level1-solved.png`

## Fase 1 — Tooling profesional

### Objetivo

Migrar la base técnica a Vite + React + TypeScript sin cambiar todavía toda la experiencia.

### Trabajo

- Agregar `package.json`.
- Agregar Vite con React y TypeScript.
- Configurar `tsconfig`.
- Configurar scripts: `dev`, `build`, `preview`, `test`.
- Crear `src/main.tsx`.
- Crear `src/app/App.tsx`.
- Conservar funcionalidad mínima inicial mientras se migra.
- Configurar Vitest.
- Preparar estructura base de carpetas.

### Entregables

- App arranca con Vite.
- Build genera `dist`.
- Estructura `src/` creada.

### Definition of Done

- [x] `npm install` funciona.
- [x] `npm run dev` funciona.
- [x] `npm run build` funciona.
- [x] App se ve en navegador.
- [x] No se implementa aún rediseño completo.
- [x] Engram actualizado.

### Resultado de Fase 1

- Se agregó tooling profesional con Vite + React + TypeScript + Vitest.
- Se agregó `package.json` con scripts `dev`, `build`, `preview`, `test`, `test:watch` y `lint`.
- Se agregó configuración TypeScript (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`).
- Se agregó configuración Vite (`vite.config.ts`) y Vitest (`vitest.config.ts`).
- Se agregó ESLint flat config para el código moderno en `src/` y se excluyó el archivo legacy `Proyecto MD.js` del lint.
- Se creó la estructura base `src/` para futuras fases: `app`, `components`, `core`, `data`, `hooks`, `screens`, `state`, `styles`, `test`.
- Se creó una implementación React baseline en `src/app/App.tsx` que conserva el flujo mínimo de la app actual sin rediseño completo.
- Se migró `index.html` a entrada Vite con `<div id="root">` y `src/main.tsx`.
- Se agregó CSS baseline en `src/styles/baseline.css` para mantener una apariencia cercana a la V1 mientras se prepara la Fase 3.
- Se agregaron tests de humo/interacción con Testing Library para proteger bienvenida y flujo fácil nivel 1.
- Se agregó override de `esbuild` a `^0.28.1` para resolver la vulnerabilidad baja reportada por `npm audit` en Windows.
- Se validó el preview local en navegador: welcome screen visible y flujo básico `Continuar` → `Nivel Bajo` → `A` + `B` → salida `1` funciona.
- La consola del navegador conserva solo el `favicon.ico` 404 conocido; se deja para Fase 9 para no adelantar alcance de presentación/deploy.

Validación ejecutada:

```bash
npm install
npm run test
npm run lint
npm run build
npm audit --audit-level=high
npm run dev -- --host 127.0.0.1 --port 5173
npm run preview -- --host 127.0.0.1 --port 4173
```

Notas:

- `npm run dev` y `npm run preview` se ejecutaron con timeout porque son servidores persistentes. Ambos arrancaron y mostraron URL local.
- En TDD, primero se creó `src/app/App.test.tsx` y se confirmó el fallo por falta de `App.tsx`; luego se implementó el componente y los tests pasaron.
- La separación formal de datos/lógica pura queda para Fase 2; por eso los niveles aún viven temporalmente en `App.tsx`.

## Fase 2 — Modelo de datos y lógica pura

### Objetivo

Separar niveles, compuertas y evaluación lógica del renderizado visual.

### Trabajo

- Crear `data/gates.ts`.
- Crear `data/levels.ts`.
- Crear `core/evaluateGate.ts`.
- Crear `core/evaluateCircuit.ts`.
- Crear `core/truthTable.ts`.
- Crear `core/scoring.ts` básico.
- Migrar los 6 niveles actuales al nuevo formato.
- Agregar tests unitarios de gates.
- Agregar tests de truth table.
- Agregar tests de niveles actuales.

### Entregables

- Lógica testeable sin DOM.
- Niveles actuales preservados.
- Base para agregar más niveles.

### Definition of Done

- [x] AND/OR/XOR/NAND/NOT evaluados por tests.
- [x] Los 6 niveles actuales existen en nuevo modelo.
- [x] Truth tables se generan automáticamente.
- [x] No hay dependencia de React para evaluar lógica.
- [x] Engram actualizado.

### Resultado de Fase 2

La Fase 2 separó la lógica del juego de la UI React:

- Se creó `src/core/gameTypes.ts` como contrato compartido para dificultad, entradas, compuertas, circuitos, niveles y filas de tabla de verdad.
- Se creó `src/data/gates.ts` con metadatos de compuertas y número esperado de entradas.
- Se creó `src/data/levels.ts` con los 6 niveles originales migrados a un modelo declarativo basado en circuitos.
- Se creó `src/core/evaluateGate.ts` para evaluar AND/OR/XOR/NAND/NOT sin DOM ni React.
- Se creó `src/core/evaluateCircuit.ts` para evaluar árboles de circuito usando estados de entrada.
- Se creó `src/core/truthTable.ts` para generar combinaciones y salidas automáticamente.
- Se creó `src/core/scoring.ts` como scoring base para futuras fases de modo reto/progreso.
- `src/app/App.tsx` dejó de guardar lógica inline y ahora usa `levelsByDifficulty` + `evaluateCircuit`.
- Se agregaron tests unitarios para gates, circuitos, niveles, truth table y scoring.

Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check` y preview en navegador.

## Fase 3 — Sistema visual y layout base

### Objetivo

Crear identidad visual V2 y estructura responsive sin implementar todavía todo el gameplay avanzado.

### Trabajo

- Crear `styles/tokens.css`.
- Crear `styles/base.css`.
- Crear `styles/layout.css`.
- Crear `styles/components.css`.
- Definir paleta retro-futuristic digital lab.
- Definir tipografías.
- Definir spacing/radius/shadows.
- Crear shell visual de la app.
- Implementar responsive base.
- Eliminar dependencia de `min-width: 600px`.
- Agregar focus visible.
- Agregar reduced motion base.

### Entregables

- App con layout V2 base.
- Sin overflow móvil.
- Sistema visual reusable.

### Definition of Done

- [x] 375px sin overflow horizontal.
- [x] 768px usable.
- [x] 1024px/1440px con layout profesional.
- [x] Foco visible.
- [x] Reduced motion contemplado.
- [x] No parece plantilla SaaS genérica.
- [x] Engram actualizado.

### Resultado de Fase 3

La Fase 3 estableció el sistema visual base de V2 con dirección **Retro-futuristic Digital Lab**:

- Se reemplazó el CSS baseline por módulos `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/layout.css` y `src/styles/components.css`.
- Se definieron tokens de color, tipografía, spacing, radius, borders, sombras y motion.
- Se creó un shell visual oscuro con grilla técnica, panel de laboratorio, rails luminosos, estados LED y botones tipo control de circuito.
- Se incorporaron tipografías display/mono (`Oxanium` + `Share Tech Mono`) para alejarse del look genérico SaaS.
- Se agregaron estilos responsive mobile-first sin `min-width: 600px`.
- Se agregó foco visible con outline cálido de 3px.
- Se agregó soporte base de `prefers-reduced-motion`.
- `src/app/App.tsx` recibió clases/estructura semántica mínima para usar el nuevo shell, `aria-labelledby`, `aria-pressed`, `aria-live` y `role="status"` sin alterar la lógica de juego.

Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`, diagnostics del editor y prueba real en navegador a 375px, 768px, 1024px y 1440px sin overflow horizontal.

## Fase 4 — Pantallas principales

### Objetivo

Construir el flujo completo de pantallas con la nueva UX.

### Trabajo

- Crear `WelcomeScreen`.
- Crear `ModeSelectScreen`.
- Crear `LevelScreen` base.
- Crear `ResultsScreen`.
- Definir navegación interna sin routing complejo inicialmente.
- Crear componentes `ModeCard`, `LevelHeader`, `ProgressIndicator`.
- Reemplazar `alert()` por pantalla final.

### Entregables

- Flujo completo: Welcome → Mode Select → Level → Results.
- UX clara antes de agregar circuitos SVG complejos.

### Definition of Done

- [x] Usuario puede iniciar práctica.
- [x] Usuario puede iniciar reto.
- [x] Usuario puede volver al menú.
- [x] Usuario puede llegar a resultados.
- [x] No hay `alert()` para finalización.
- [x] Engram actualizado.

### Resultado de Fase 4

La Fase 4 dejó conectado el flujo principal completo de V2:

- `WelcomeScreen`, `ModeSelectScreen`, `LevelScreen` y `ResultsScreen` están implementadas en React.
- La navegación funciona sin router complejo: Welcome → selección de modo → selección/práctica o reto → resultados.
- `ResultsScreen` reemplaza el `window.alert()` final con una pantalla profesional de cierre, resumen educativo y acciones reales.
- Las acciones finales funcionan: `Iniciar reto`, `Practicar otra vez` y `Volver al inicio`.
- La interacción de nivel se mantiene live: inputs, circuito, tabla y feedback se actualizan al activar entradas.

Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`, diagnostics del editor y prueba real en navegador con responsive 320/375/768/1024/1440 sin overflow horizontal.

## Fase 5 — CircuitBoard SVG

### Objetivo

Reemplazar circuitos con `div` absolutos por un renderer SVG responsive y entendible.

### Trabajo

- Crear `components/CircuitBoard`.
- Crear `components/GateNode`.
- Crear `components/SignalWire`.
- Crear `components/OutputNode` si aplica.
- Definir sistema de coordenadas SVG.
- Renderizar inputs, gates, wires y output.
- Adaptar layout del SVG a móvil/desktop.
- Agregar labels accesibles.
- Mantener claridad visual para niveles simples y compuestos.

### Entregables

- Circuitos SVG para los 6 niveles actuales.
- Visualización escalable y responsive.

### Definition of Done

- [x] Los niveles actuales se renderizan con SVG.
- [x] No hay overflow en móvil en la ruta práctica 5A.
- [x] Inputs/gates/output son identificables en la ruta práctica 5A.
- [x] Circuito se entiende visualmente para compuertas simples.
- [x] SVG tiene metadata accesible razonable para compuertas simples y combinadas.
- [x] Engram actualizado al cerrar la fase completa.

### Avance de Fase 5A — práctica guiada y símbolos correctos

- `Modo práctica` ya no pregunta por dificultad: entra directo a la lección AND.
- La ruta práctica ahora enseña 7 compuertas: AND, OR, NOT, XOR, NAND, NOR y XNOR.
- `NOR` y `XNOR` fueron agregadas al modelo de datos, evaluación lógica y tests.
- `LevelScreen` renderiza siluetas SVG distintas y reconocibles para AND, OR, NOT, XOR, NAND, NOR y XNOR.
- `Modo reto` queda separado y sigue usando temporalmente la ruta `hard` hasta Fase 8.
- Pendiente para cerrar toda Fase 5: extraer un `CircuitBoard` formal y representar mejor circuitos combinados del reto.

Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`, diagnostics del editor y prueba real en navegador con responsive 320/375/768/1024/1440 sin overflow horizontal.

### Resultado de Fase 5B — CircuitBoard formal y circuitos combinados

- Open Design se usó como prototipo visual en exactamente 2 iteraciones: `digital-logic-lab-circuit-board-v1.html` y `digital-logic-lab-circuit-board-v2-final.html`.
- `LevelScreen` delega el diagrama en `src/components/CircuitBoard/CircuitBoard.tsx`.
- `CircuitBoard` renderiza inputs, wires, gate nodes y output con SVG accesible.
- La práctica conserva las 7 compuertas: AND, OR, NOT, XOR, NAND, NOR y XNOR.
- El reto ya no muestra `MIX`: `hard-1` renderiza `(A XOR B) AND NOT C` como XOR + NOT + AND; `hard-2` renderiza `(A AND B) XOR NAND(C, D)` como AND + NAND + XOR.
- Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`.
- Validación real en navegador: práctica completa `7/7`; reto hard-1/hard-2 sin `MIX`; responsive 320x720, 375x812, 768x1024, 1024x768, 1365x646 y 1440x900 sin overflow horizontal; botones >= 44px; reduced motion con duración máxima 0.001ms; consola 0 warnings/errors.
- Capturas guardadas: `circuit-board-hard1-react-1440.png`, `circuit-board-hard1-react-375.png`, `circuit-board-hard2-react-1440.png`, `results-after-circuit-board-react-1365x646.png`.

## Fase 6A — Challenge Mode base

### Objetivo

Hacer que el modo reto sea coherente con la promesa de producto antes de añadir más motion: 7 retos, timer, puntos, racha y menos ayudas.

### Trabajo

- Crear 7 niveles de reto usando las 7 compuertas aprendidas.
- Quitar tabla de verdad durante intentos de reto.
- Agregar HUD de timer, puntos, racha y nivel.
- Agregar acción explícita `Enviar respuesta`.
- Calcular puntos con bono de tiempo, racha y penalización por fallos.
- Mostrar score/racha en ResultsScreen de reto.
- Mantener práctica como ruta educativa con tabla de verdad.

### Resultado de Fase 6A — Challenge Mode base

- Open Design se usó como prototipo visual en 2 iteraciones de 3 permitidas: `digital-logic-lab-challenge-mode-v1.html` y `digital-logic-lab-challenge-mode-v2-final.html`.
- Modo reto ahora tiene 7 circuitos progresivos que distribuyen AND, OR, NOT, XOR, NAND, NOR y XNOR.
- Los niveles de reto no arrancan resueltos y evitan soluciones triviales de un solo clic mediante estados iniciales específicos.
- Challenge oculta la tabla de verdad durante el intento y usa `Enviar respuesta`.
- Se agregó scoring puro con timer, puntos, racha y penalización por envíos incorrectos.
- `ResultsScreen` muestra `7/7`, puntos y racha al terminar reto.
- Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`.
- Validación real en navegador: reto completo 7/7; práctica conserva tabla; responsive 320x720, 375x812, 768x1024, 1024x768, 1365x646 y 1440x900 sin overflow horizontal; botones >= 44px; reduced motion con duración máxima 0.001ms; consola 0 warnings/errors.

## Fase 6 — Interacción y motion de señales

### Objetivo

Hacer que el circuito se sienta vivo sin hacerlo pesado.

### Trabajo

- Integrar Motion o Web Animations para señales.
- Animar wire activo.
- Animar pulso de gate al evaluar.
- Animar LED output.
- Crear transiciones de feedback.
- Agregar celebraciones moderadas al completar nivel.
- Implementar reduced motion para desactivar/simplificar animaciones.

### Resultado de Fase 6B — Signal motion polish

- Open Design se usó para un prototipo de dirección motion: `digital-logic-lab-signal-motion-v1-final.html`.
- Los cables activos ahora muestran un paquete de señal sobre el trazo activo para guiar la mirada.
- El tablero dispara un barrido corto en aciertos/fallos, ligado a acción del usuario.
- El envío incorrecto en reto muestra `Pulso de corrección activo` y mantiene al usuario en el nivel.
- Se conservaron SVG + CSS sin nuevas dependencias.
- Se evitó animar layout, scroll o superficies grandes continuamente; la motion continua queda limitada a trazos SVG pequeños.
- `prefers-reduced-motion` reduce la duración a 0.001ms.
- Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`.
- Validación real en navegador: retos completos en desktop 1440x900, tablet 768x1024 y móvil 375x812; práctica conserva tabla; reto oculta tabla; sin overflow horizontal; botones >= 44px; SVG visible en página; sin solapes de compuertas; consola 0 warnings/errors.

### Entregables

- Circuito con señales visuales.
- Motion intencional y performante.

### Definition of Done

- [x] Motion mejora comprensión.
- [x] No hay animaciones decorativas innecesarias.
- [x] Reduced motion funciona.
- [x] No hay lag perceptible en móvil normal.
- [x] Engram actualizado.

## Fase 7 — Feedback educativo y verdad lógica

### Objetivo

Convertir cada intento en aprendizaje.

### Trabajo

- Crear `FeedbackPanel`.
- Crear `TruthTable`.
- Mostrar estado actual: inputs, gate, output.
- Explicar por qué el resultado es `0` o `1`.
- Mostrar hint contextual.
- Mostrar explicación de compuerta.
- En modo práctica, permitir ver tabla de verdad completa.
- En modo reto, mostrar feedback más breve y resultado posterior.

### Resultado de Fase 7

- Open Design se usó para el prototipo de dirección educativa: `digital-logic-lab-feedback-v1-final.html`.
- Se agregó lógica pura y testeable en `src/core/feedback.ts` para generar `Lectura actual`, `Regla lógica`, `Pista` y `Filas objetivo`.
- Modo práctica muestra feedback educativo estructurado y conserva tabla de verdad completa generada desde lógica.
- Modo reto mantiene la tabla de verdad oculta durante intentos y muestra feedback breve no-spoiler tras errores.
- Las descripciones base de compuertas en `src/data/gates.ts` quedaron en español.
- Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`.
- Validación real en navegador: práctica/reto revisados en 320x720, 375x812, 768x1024, 1024x768, 1365x646 y 1440x900; sin overflow horizontal; botones >= 44px; reduced motion 0.001ms; consola 0 warnings/errors.

### Entregables

- Feedback útil para aprender.
- Tabla de verdad accesible.

### Definition of Done

- [x] Error no dice solo “incorrecto”.
- [x] Feedback explica causa.
- [x] Truth table generada desde lógica.
- [x] El usuario puede aprender sin conocimiento previo profundo.
- [x] Engram actualizado.

## Fase 8 — Modo reto, score y progreso

### Objetivo

Agregar replay value y sensación de juego.

### Trabajo

- Implementar score.
- Implementar streak.
- Implementar timer.
- Implementar submit en Challenge Mode.
- Implementar resumen de desempeño.
- Guardar mejor score/progreso en `localStorage`.
- Mostrar progreso recuperado en Mode Select.

### Resultado de Fase 8

- Open Design se usó para el prototipo de progreso/replay: `digital-logic-lab-phase8-progress-v1.html`.
- Se agregó persistencia local versionada y segura en `src/core/progress.ts`.
- `localStorage` ahora guarda progreso de práctica, progreso de reto, mejor score y mejor racha.
- Mode Select muestra `Registro local` con práctica, reto, mejor score y racha récord.
- ResultsScreen de reto muestra `Mejor local` y `Nuevo récord guardado` cuando aplica.
- El reto completo 7/7 actualiza score, streak y progreso local sin backend/login/ranking online.
- Validación ejecutada: `npm run test`, `npm run lint`, `npm run build`, `npm audit --audit-level=high`, `git --no-pager diff --check`.
- Validación real en navegador: 320x720, 375x812, 768x1024, 1024x768, 1365x646 y 1440x900; sin overflow; challenge 7/7 completado; storage guardado; consola 0 warnings/errors; reduced motion 0.001ms.

### Entregables

- Challenge Mode jugable.
- Progreso local básico.

### Definition of Done

- [x] Score se calcula consistentemente.
- [x] Timer no bloquea accesibilidad.
- [x] Streak se actualiza bien.
- [x] ResultsScreen muestra métricas.
- [x] `localStorage` tiene manejo seguro si falla/no está disponible.
- [x] Engram actualizado.

## Fase 9 — Vercel deploy y presentación profesional

### Objetivo

Preparar la app como producto público profesional.

### Trabajo

- Configurar Vercel.
- Confirmar build output `dist`.
- Agregar `vercel.json` si hace falta.
- Agregar favicon.
- Agregar metadata básica.
- Agregar social preview si se crea asset.
- Actualizar README con V2.
- Incluir screenshots actualizados cuando existan.
- Crear preview deployment.

### Entregables

- Preview de Vercel.
- README actualizado.
- App compartible profesionalmente.

### Definition of Done

- [x] Deploy preview existe.
- [x] Build de Vercel pasa.
- [x] README explica cómo correr y desplegar.
- [x] Favicon no da 404.
- [x] Engram actualizado.

## Fase 10 — QA, accesibilidad, performance y PR final

### Objetivo

Cerrar V2 con calidad revisable.

### Trabajo

- Probar desktop/tablet/mobile.
- Probar teclado.
- Probar reduced motion.
- Revisar contraste.
- Ejecutar tests.
- Ejecutar build.
- Revisar Lighthouse si está disponible.
- Revisar consola sin errores.
- Documentar bugs conocidos si existen.
- Preparar PR con descripción clara.

### Entregables

- V2 lista para revisión.
- PR preparado.

### Definition of Done

- [x] Tests pasan.
- [x] Build pasa.
- [x] No overflow móvil.
- [x] No errores de consola relevantes.
- [x] Accesibilidad base verificada.
- [x] PR listo con resumen, screenshots y checklist.
- [x] Engram actualizado.

## 18. Phase tracker

Este tracker debe actualizarse al finalizar cada fase.

| Fase | Nombre | Estado | Resultado |
| --- | --- | --- | --- |
| 0 | Preparación y baseline | Done | Rama `feature/ui-ux-v2` creada; baseline validado; Vercel CLI no disponible localmente; sin cambios de implementación. |
| 1 | Tooling profesional | Done | Vite + React + TypeScript + Vitest configurados; app baseline funcionando; tests/lint/build/audit pasan. |
| 2 | Modelo de datos y lógica pura | Done | Datos, compuertas, circuitos, truth tables y scoring base separados de React; 17 tests pasan. |
| 3 | Sistema visual y layout base | Done | Sistema visual modular V2 aplicado; responsive 375/768/1024/1440 sin overflow; focus/reduced motion validados. |
| 4 | Pantallas principales | Done | Flujo completo Welcome → Mode Select → Level → Results implementado; `alert()` reemplazado por `ResultsScreen`; acciones finales funcionales; tests/lint/build/audit/browser responsive validados. |
| 5 | CircuitBoard SVG | Done | `CircuitBoard` SVG formal extraído; práctica conserva 7 compuertas con símbolos correctos; reto combinado muestra XOR/NOT/AND y AND/NAND/XOR sin `MIX`; tests/lint/build/audit/browser responsive pasan. |
| 6 | Interacción y motion de señales | Done | Fase 6A agregó Challenge Mode base; Fase 6B agregó paquetes de señal SVG, pulsos de tablero/feedback y reduced motion performante sin nuevas dependencias. |
| 7 | Feedback educativo y verdad lógica | Done | Práctica muestra lectura/regla/pista/filas objetivo con lógica pura testeada; reto conserva feedback breve sin tabla de verdad durante intentos. |
| 8 | Modo reto, score y progreso | Done | Timer, score, streak, submit, resultados, progreso local seguro y mejor score/racha con `localStorage` implementados y validados. |
| 9 | Vercel deploy y presentación profesional | Done | Metadata/SEO, README V2, assets públicos, `vercel.json`, Open Design artifact y deployment Vercel completados; preview `https://logis-gates-challenge-game-6fr2amh8d-sam-24-devs-projects.vercel.app`. |
| 10 | QA, accesibilidad, performance y PR final | Done | QA final completado; GitHub Pages desactivado; PR final creado: https://github.com/Sam-24-dev/Logis-Gates-Challenge-Game/pull/1; Engram actualizado. |

Estados permitidos:

- `Not started`
- `In progress`
- `Done`
- `Blocked`
- `Deferred`

## 19. Decision log

| Decisión | Alternativas consideradas | Motivo |
| --- | --- | --- |
| Usar Vite | Mantener HTML/JS puro sin build | Vite da estructura, build, DX y compatibilidad con Vercel. |
| Usar React | Vanilla JS modular | La V2 tendrá más pantallas, estado, modos y componentes; React reduce fragilidad. |
| Usar TypeScript | JavaScript | Mejora mantenibilidad, contratos de niveles y seguridad al escalar. |
| Usar SVG para circuitos | `div`s absolutos, Canvas, Three.js | SVG es responsive, accesible, animable y más claro para circuitos. |
| No usar Three.js en core | WebGL completo | El core debe ser rápido y claro; 2.5D cubre impacto visual sin peso excesivo. |
| Usar CSS propio | Tailwind/shadcn | Evita look genérico y permite identidad visual propia. |
| Deploy en Vercel | GitHub Pages | Vercel ofrece previews, mejor flujo de producto y despliegue profesional. |
| Practice + Challenge | Solo dificultad | Separa aprendizaje de reto y mejora experiencia/replay value. |
| Guardar progreso local | Backend | `localStorage` es suficiente para V2 inicial. |

## 20. Criterios de éxito de V2

La V2 será exitosa si:

- Se siente claramente superior a la versión actual.
- El usuario entiende mejor las compuertas después de jugar.
- La app es entretenida, no solo informativa.
- El circuito visual es memorable.
- La app funciona bien en móvil.
- La app no parece una plantilla genérica.
- El código permite agregar niveles fácilmente.
- El deploy público se ve profesional.
- Performance y accesibilidad no se sacrifican por estética.

## 21. Cómo trabajar cada fase

Para cada fase:

1. Leer este documento.
2. Revisar `AGENTS.md`.
3. Confirmar con el usuario qué fase se va a ejecutar.
4. Implementar solo el alcance de esa fase.
5. Validar con comandos específicos.
6. Actualizar el phase tracker.
7. Guardar resumen en Engram.
8. Entregar resumen claro al usuario.

## 22. Regla final de producto

La V2 debe maximizar experiencia sin volverse lenta.

La decisión guía es:

> **Circuitos vivos, aprendizaje claro, motion con propósito, performance alta y una identidad visual propia.**

Si una idea visual no mejora aprendizaje, claridad o emoción del juego, no entra en V2 inicial.
