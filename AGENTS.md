# AGENTS.md — Logic Gates Challenge Game

Este archivo guía a cualquier agente o sesión futura que trabaje en este repositorio. El objetivo es mantener continuidad, avanzar por fases y proteger la visión de producto de la V2.

## 1. Fuente principal de verdad

Antes de hacer cualquier cambio, leer:

1. `documentation/v2-product-implementation-plan.md`
2. `documentation/repository-analysis.md`
3. Este `AGENTS.md`
4. Memorias de Engram del proyecto `logis-gates-challenge-game`

El plan maestro de V2 vive en:

```text
documentation/v2-product-implementation-plan.md
```

## 2. Visión de producto

La V2 debe convertir la app básica actual en un producto educativo interactivo y profesional:

> **Digital Logic Lab**: un laboratorio/juego educativo donde el usuario aprende compuertas lógicas resolviendo circuitos, viendo señales moverse y recibiendo feedback útil.

La experiencia debe ser entretenida, clara, rápida y memorable.

## 3. Stack aprobado

Usar:

- Vite
- React
- TypeScript
- SVG para circuitos
- Motion + CSS/Web Animations controladas
- CSS propio con tokens
- Vercel para deploy
- Vitest para lógica
- `localStorage` para progreso local

No usar en V2 inicial:

- Backend
- Login
- Ranking online
- Three.js en el core del juego
- Tailwind/shadcn como base visual
- UI genérica de SaaS o plantilla AI

## 4. Reglas de diseño

La dirección visual aprobada es:

```text
Retro-futuristic Digital Lab
```

Debe sentirse como:

- laboratorio digital
- circuito vivo
- experiencia educativa moderna
- producto serio de portafolio

Evitar:

- look SaaS genérico
- gradientes AI genéricos
- neon excesivo
- glassmorphism sin propósito
- animaciones decorativas constantes
- emojis como iconos principales
- diseño que sacrifique claridad por estética

Regla central:

> La V2 debe maximizar experiencia sin volverse lenta.

## 5. Cómo trabajar por fases

Cada sesión debe trabajar solo una fase o un subalcance claro de una fase.

Flujo obligatorio:

1. Leer `documentation/v2-product-implementation-plan.md`.
2. Revisar el `Phase tracker` del plan.
3. Identificar la fase solicitada por el usuario.
4. No adelantar fases salvo que sea necesario y se explique.
5. Hacer cambios mínimos y enfocados.
6. Validar con comandos adecuados.
7. Actualizar el `Phase tracker` si una fase cambia de estado.
8. Guardar resumen en Engram.
9. Reportar archivos modificados, validación y próximos pasos.

## 6. Phase tracker actual

La fuente editable principal está en `documentation/v2-product-implementation-plan.md`.

Estado actualizado tras Fase 10:

| Fase | Nombre | Estado |
| --- | --- | --- |
| 0 | Preparación y baseline | Done |
| 1 | Tooling profesional | Done |
| 2 | Modelo de datos y lógica pura | Done |
| 3 | Sistema visual y layout base | Done |
| 4 | Pantallas principales | Done |
| 5 | CircuitBoard SVG | Done |
| 6 | Interacción y motion de señales | Done |
| 7 | Feedback educativo y verdad lógica | Done |
| 8 | Modo reto, score y progreso | Done |
| 9 | Vercel deploy y presentación profesional | Done |
| 10 | QA, accesibilidad, performance y PR final | Done |

## 7. Rama y PR

Cuando el usuario autorice implementación:

- Para trabajo posterior a V2, crear una rama nueva y enfocada desde la base `main` confirmada; proteger cualquier checkout con cambios previos.
- La rama `feature/ui-ux-v2` pertenece al historial de Fase 0; no reutilizarla para nuevos cambios.
- No hacer merge directo a `main`.
- Preferir PR revisable.
- Mantener commits descriptivos.
- No borrar funcionalidad existente sin reemplazo claro.

## 8. Validación esperada

Según la fase, usar:

- `npm run build`
- `npm run test`
- `npm run preview`
- pruebas manuales en navegador
- responsive: 375px, 768px, 1024px, 1440px
- consola sin errores relevantes
- teclado/focus
- reduced motion

No afirmar que algo pasó si no se ejecutó.

## 9. Engram

Después de cada fase o avance importante, guardar memoria en Engram con:

- qué se hizo
- por qué
- dónde
- qué se aprendió
- fase actualizada
- comandos de validación
- pendientes

Proyecto Engram:

```text
logis-gates-challenge-game
```

## 10. Reglas de implementación

- Mantener cambios pequeños por fase.
- No mezclar rediseño visual con migración técnica si la fase no lo pide.
- Separar lógica pura de UI.
- Tests primero para lógica crítica cuando sea razonable.
- Usar componentes claros.
- No introducir dependencias pesadas sin justificar.
- SVG para circuitos; no canvas ni Three.js en core.
- Motion solo si aporta comprensión, emoción o feedback.
- Accesibilidad no es opcional.

## 11. Criterio de calidad final

La V2 debe cumplir:

- Se ve profesional y memorable.
- No parece genérica.
- Enseña mejor que la V1.
- Es entretenida.
- Es rápida.
- Es responsive real.
- Tiene arquitectura escalable.
- Puede desplegarse en Vercel.
- Permite agregar niveles sin reescribir todo.

## 12. Uso de agentes, MCP y prototipos

Flujo preferido para ahorrar tokens y mantener control:

1. Usar Stitch/screenshots como referencia visual.
2. Usar Open Design vía MCP para prototipos y artifacts cuando esté disponible.
3. Implementar el resultado final manualmente en el repo React/Vite.
4. Evitar usar otro agente generativo dentro de Open Design si el MCP directo basta.

Regla de subagentes:

- No delegar por defecto.
- Delegar solo si la tarea es muy compleja o riesgosa y la división ahorra retrabajo real.
- Máximo 2 subagentes adicionales en casos extremos.
- Cada subagente debe tener alcance concreto y no solaparse con otro.

## 13. Regla Ponytail

Usar enfoque **ponytail** por defecto en implementación: elegir la solución senior más simple que funcione, evitar sobreingeniería, no agregar dependencias ni abstracciones sin necesidad, y preferir CSS/SVG/native platform antes que librerías pesadas. La experiencia debe verse profesional, pero cada efecto debe justificar su costo en UX, aprendizaje o feedback.

## 14. Si hay duda

Si una decisión no está clara:

1. Revisar el plan maestro.
2. Revisar Engram.
3. Elegir la opción más simple que preserve la visión.
4. Preguntar al usuario si la decisión cambia alcance, stack, diseño o fase.

No improvisar cambios grandes sin confirmación.
