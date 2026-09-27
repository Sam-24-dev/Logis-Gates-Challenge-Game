# Prototipos V2

Archivo histórico del prototipado V2 (Fase 3.5). La Fase 4 y las fases 0–10 ya están completadas.

Para el producto actual, consulta el [README principal](../../README.md); para el historial y el tracker, el [plan V2](../v2-product-implementation-plan.md).

## Archivos

- `open-design-prompts.md` — prompts de Fase 3.5 conservados como referencia histórica.
- `welcome-screen-implementation-plan.md` — plan histórico para llevar la WelcomeScreen iterada por MCP a React.

## Dirección de prototipo elegida en Fase 3.5 (histórico)

Decisión de entonces:

```text
Base funcional: Open Design v3/v4
Dirección visual: Stitch imagen 1 dark LOGIC_LAB_V1.0
Artifact MCP creado: digital-logic-lab-v4-stitch-refined.html
Welcome recomendado: digital-logic-lab-welcome-v3-mcp.html
```

El artifact `digital-logic-lab-v4-stitch-refined.html` se creó en un proyecto local de Open Design:

```text
Digital Logic Lab — DESIGN.md Design System
```

Los HTML y demás exports de Open Design citados aquí no están versionados en este repositorio. [DESIGN.md](../../DESIGN.md) y las [capturas de baseline](../baseline/) sí lo están, pero no sustituyen esos prototipos.

## Skills consideradas para Fase 4 (histórico)

| Momento | Skill/recurso |
| --- | --- |
| Evitar sobreingeniería | `ponytail` |
| Construir pantallas con identidad | `frontend-design` |
| Animar títulos/readouts puntuales | `animate-text` |
| Pulir microinteracciones | `emilkowalski-motion` |
| Revisar motion/performance | `gsap-performance` solo si aplica |
| Revisar accesibilidad/UX | `web-design-guidelines` |
| Revisar diff antes de cerrar | `ponytail-review` |
| Validar cambios | `lint-and-validate` |

Criterio propuesto entonces: primero claridad funcional; después motion mínimo. No agregar dependencias nuevas solo por estética.

## Flujo propuesto para Fase 3.5 (histórico)

Se propuso instalar Open Design, vincular este repositorio y `DESIGN.md`, generar y refinar prototipos, exportarlos a `open-design-exports/` y luego implementar Fase 4 en React. Es el plan de entonces, no una lista de pasos pendientes para usar la app actual.

## Regla importante

El prototipo es referencia de producto/diseño. La implementación final debe respetar la arquitectura del repo:

- lógica en `src/core`;
- niveles en `src/data`;
- pantallas/componentes en React;
- circuitos en SVG;
- estilos con CSS tokens propios;
- accesibilidad y responsive obligatorios.
