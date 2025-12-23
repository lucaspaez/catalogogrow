# REGLAS MAESTRAS DE DESARROLLO PARA AGENTES DE IA

Este documento define los estándares OBLIGATORIOS para cualquier desarrollo, refactorización o corrección de código realizada por agentes de Inteligencia Artificial en este repositorio o contexto general.

## 1. Principios Fundamentales de Ingeniería de Software (Universales)

Independientemente del lenguaje o framework, estas reglas son inviolables:

*   **Principios SOLID**: Aplicación estricta en cualquier paradigma Orientado a Objetos:
    *   **S**ingle Responsibility Principle (Responsabilidad Única).
    *   **O**pen/Closed Principle (Abierto a extensión, cerrado a modificación).
    *   **L**iskov Substitution Principle (Sustitución de Liskov).
    *   **I**nterface Segregation Principle (Segregación de Interfaces).
    *   **D**ependency Inversion Principle (Inversión de Dependencias).
*   **Clean Code**:
    *   **DRY (Don't Repeat Yourself)**: Evitar duplicación de lógica de negocio o validaciones. Centralizar constantes y funciones utilitarias.
    *   Nombres de variables y funciones autodescriptivos (preferiblemente en inglés o siguiendo la convención del proyecto).
    *   Funciones pequeñas y atómicas.
    *   Evitar "Code Smells" y código muerto.
*   **Manejo de Errores**:
    *   **Fallo**: LANZAR una excepción/error con un mensaje descriptivo del problema exacto. NUNCA retornar `false`, `null` o códigos de error silenciosos.
    *   **Éxito**: Retornar el resultado esperado y/o confirmar la persistencia.

## 2. Adaptabilidad Tecnológica y Contexto

El agente debe analizar el entorno del proyecto antes de escribir código y adherirse a las herramientas estándar del stack detectado.

### Contexto Actual (Node.js / TypeScript / Next.js)
*   **Herramientas**: Usar `Prisma` (ORM), `Next.js` (Framework), `Jest`/`Vitest` (Testing), `Zod` (Validación).
*   **Estilo**:
    *   `camelCase` para variables y funciones.
    *   **TypeScript Estricto**: Tipos explícitos, prohibido el uso de `any`.
    *   Usar métodos de array modernos (`.map`, `.reduce`, `.find`, `.filter`) evitando bucles `for` imperativos.

### Contexto Java (Ejemplo / Backend Corporativo)
*   **Herramientas**: Usar `Spring Boot`, `Hibernate`/`JPA`, `JUnit` (Testing), `Maven`/`Gradle`.
*   **Estilo**:
    *   `PascalCase` para Clases e Interfaces.
    *   `camelCase` para métodos y variables.
    *   Uso correcto de Genéricos y Streams API.

### Contexto General
*   Adaptarse a las convenciones idiomáticas del lenguaje detectado (ej. Python `snake_case`, Go `PascalCase` exportado).

## 3. Reglas de Validación de Negocio (ESTRICTO)

Se deben aplicar validaciones en todas las capas (Inputs, Outputs, Parámetros, Estado, Objetos, Arrays, etc.):

1.  **Email**:
    *   Formato válido comprobado con Regex estricto.
    *   No puede estar vacío.
2.  **Password / Seguridad**:
    *   Mínimo 8 caracteres.
    *   Debe contener: 1 Mayúscula, 1 Minúscula, 1 Número, 1 Carácter Especial.
3.  **Edad y Fechas**:
    *   **Edad**: Mayor de 18 años y menor de 120 años.
    *   **Fechas**: Validar coherencia temporal (ej. fechas de nacimiento no futuras).
4.  **Generales**:
    *   Validar integridad de tipos (Strings, Numbers, Booleans, Dates).
    *   Validar existencia de Archivos antes de leer.
    *   Validar Formularios completos.

## 4. Estándares de Calidad y Testing

*   **Cobertura de Tests (Coverage)**:
    *   **Funciones Core / Críticas**: **100%** (Obligatorio).
    *   **Lógica de Negocio General**: **80%**.
    *   **Infraestructura / Configuración**: 0% - 10%.
*   **Estrategia**:
    *   Unitarios para lógica aislada.
    *   Mocks para dependencias externas (APIs, DBs).
    *   Cubrir **Happy Path**, **Casos de Error** y **Edge Cases** (nulos, vacíos, límites).

## 5. Seguridad y Performance

*   **Seguridad**:
    *   Prevenir **Inyección SQL/NoSQL** (usar ORMs o parámetros vinculados).
    *   Prevenir **XSS** y **CSRF**.
    *   Validación estricta de inputs.
*   **Performance**:
    *   Evitar consultas **N+1** en bases de datos.
    *   Usar índices apropiados.
    *   Optimizar algoritmos (preferir O(n)).

## 6. Reglas de Refactorización

1.  **Inmutabilidad Funcional**: No cambiar el comportamiento del negocio salvo solicitud explícita.
2.  **Early Returns**: Usar retornos tempranos para reducir anidamiento (nesting).
3.  **Claridad**: Nombres descriptivos que revelen la intención.

## 7. Versionado (Git)

Seguir **Conventional Commits**:
*   `feat`: Nueva característica.
*   `fix`: Corrección de error.
*   `refactor`: Cambio de código sin cambio de funcionalidad.
*   `test`: Añadir o corregir tests.
*   `docs`: Documentación.
