# Documento de Requerimientos de Producto (PRD)
## Proyecto: Lector 606
**Versión:** 1.1.0  
**Fecha de Emisión:** Agosto 2026  
**Empresa / Autor:** Dominican AI Studio LLC  
**Estado:** Listo para Implementación / Integración  
**Destinatarios:** Product Managers, Tech Leads, Desarrolladores Frontend/Backend, Ingenieros de IA, QA & DevOps  

---

## 1. Resumen Ejecutivo y Visión del Producto

### 1.1 Objetivo General
**Lector 606** es una solución tecnológica integral de extracción inteligente y auditoría fiscal de facturas diseñada específicamente para las normativas de la **Dirección General de Impuestos Internos (DGII)** de la República Dominicana. Su objetivo principal es transformar comprobantes físicos y digitales (imágenes o PDFs) en datos estructurados y validados para la elaboración y conciliación del **Formato 606** (Reporte de Compras de Bienes y Servicios).

### 1.2 Problema que Resuelve
* **Carga Operativa y Retrasos:** La digitación manual de cientos de facturas mensuales genera cuellos de botella en los departamentos de contabilidad al cierre de cada ciclo fiscal.
* **Alucinaciones y Errores de OCR Convencional:** Los sistemas OCR tradicionales (basados únicamente en reglas ópticas) confunden caracteres clave en facturas térmicas desgastadas (ej. `8` por `B`, `0` por `O`), inventando dígitos y provocando inconsistencias tributarias.
* **Discrepancia de RNC y Rechazos DGII:** Facturas emitidas por error al RNC personal de un empleado o a otra razón social son ingresadas inadvertidamente, provocando multas y rechazos al presentar el 606.
* **Falta de Trazabilidad y Auditoría Previa:** Ausencia de un filtro previo que separe facturas legibles de comprobantes con datos faltantes antes de su incorporación al ERP o software contable.

### 1.3 Propuesta de Valor
* **Flujo en 3 Pasos:** Configuración fiscal, carga masiva arrastrar-y-soltar, y consola de auditoría con exportación directa.
* **Inferencia Visual de Última Generación:** Modelos multimodales que analizan el documento de forma holística (texto, tipografía, sellos, tablas y códigos QR).
* **Política de Cero Invención (Regla de la `"x"`):** Sustitución obligatoria de caracteres dudosos por `"x"` para alertar al auditor humano.
* **Separación Automática de Discrepancias:** Detección en tiempo real de facturas con RNC ajeno (`MISMATCH_RNC`) y resaltado condicional prioritario en reportes Excel y PDF.
* **Estética "Fiberglass" (iOS 26):** Interfaz corporativa con microinteracciones fluidas, fondos translúcidos y desenfoque de fondo (*backdrop blur*).

---

## 2. Glosario de Términos

Para garantizar un entendimiento unificado entre desarrolladores, diseñadores y contadores, se definen los siguientes términos:

### 2.1 Términos Tributarios y Fiscales (República Dominicana / DGII)
* **DGII:** *Dirección General de Impuestos Internos*. Órgano estatal regulador de la administración tributaria en la República Dominicana.
* **Formato 606:** Reporte mensual obligatorio de Compras de Bienes y Servicios que todos los contribuyentes deben remitir a la DGII detallando las operaciones que sustentan costos y gastos deducibles de Impuesto Sobre la Renta (ISR) y créditos de ITBIS.
* **RNC (Registro Nacional de Contribuyentes):** Número único de identificación tributaria asignado por la DGII a personas jurídicas (9 dígitos) o personas físicas (cédula de 11 dígitos).
* **NCF (Número de Comprobante Fiscal):** Secuencia alfanumérica regulada por la DGII que autoriza la emisión de facturas válidas para crédito fiscal (ej. `B0100000045`, `E3100000012` para e-CF).
* **e-CF (Comprobante Fiscal Electrónico):** Modalidad de facturación electrónica regulada bajo la Ley 32-23 en República Dominicana.
* **ITBIS:** *Impuesto sobre Transferencias de Bienes Industrializados y Servicios*. Impuesto al valor agregado con tasas generales del 18% o reducidas del 16% (o exento 0%).
* **Subtotal / Base Imponible:** Monto neto de la factura antes de aplicar impuestos y retenciones.
* **Forma de Pago:** Clasificación del medio financiero utilizado para liquidar la factura (Efectivo, Tarjeta de Crédito/Débito, Transferencia Bancaria, Cheque, Crédito, Permuta).
* **Proveedor / Emisor:** Persona física o moral que vende el bien/servicio y emite la factura con su RNC y NCF.
* **Cliente / Receptor:** Persona física o moral a nombre de quien se expide la factura con derecho a deducir el gasto.

### 2.2 Términos Técnicos, IA y Arquitectura
* **OCR (Optical Character Recognition):** Tecnología de reconocimiento óptico encargada de transformar caracteres contenidos en imágenes a cadenas de texto digital.
* **Multimodal LLM (Large Language Model con Visión):** Modelo de inteligencia artificial (ej. Gemini 2.5/3.0 Flash) entrenado simultáneamente en lenguaje y visión por computadora, capaz de interpretar documentos complejos respetando contexto espacial y gramatical sin requerir pipelines rígidos de preprocesamiento.
* **Prompt Engineering & System Prompt:** Instrucciones estructuradas inmutables que guían al modelo de IA para extraer datos exclusivamente bajo un esquema estricto y respetar restricciones operativas (como la regla de la `"x"`).
* **Structured Output (JSON Schema):** Garantía del motor de IA que fuerza a la respuesta a cumplir con un esquema tipado de TypeScript/JSON sin texto introductorio ni decoradores markdown.
* **MISMATCH_RNC:** Estado crítico asignado a una factura procesada cuando el RNC del cliente receptor identificado en el documento difiere del RNC de la empresa configurada en la sesión activa.
* **ERROR_OCR:** Estado de advertencia asignado cuando uno o más campos extraídos contienen el carácter comodín `"x"`, evidenciando caracteres borrosos, cortados o desgastados.
* **Batch Ingestion (Procesamiento por Lotes):** Capacidad de recibir múltiples archivos en paralelo o en secuencia para su análisis desasistido.
* **Base64 Encoding:** Codificación de archivos binarios (imágenes/PDFs) a cadenas ASCII para su transmisión directa e inocua mediante payloads JSON / HTTP.

### 2.3 Términos de Diseño y Experiencia de Usuario
* **Fiberglass / Glassmorphism (Estilo iOS 26):** Lenguaje de diseño visual basado en superficies de vidrio esmerilado translúcido (`backdrop-blur-2xl`), bordes finos hiper-reflejantes (`border-white/50`), sombras multicapa profundas pero suaves (`shadow-xl`) y paletas cromáticas orgánicas de alto contraste.
* **Dropzone:** Componente interactivo de interfaz que permite arrastrar archivos desde el explorador del sistema operativo y soltarlos directamente en el navegador.
* **State Pill / Badge:** Elemento visual compacto que comunica el estado de una factura (`Pendiente`, `Procesando`, `OK`, `ERROR_OCR`, `MISMATCH_RNC`, `Error`).

---

## 3. Descripción Detallada del Funcionamiento de la Aplicación

El sistema opera a través de un ciclo continuo de 5 fases modulares:

```
┌─────────────────┐     ┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   1. Contexto   │ ──> │  2. Ingestión   │ ──> │   3. Inferencia   │ ──> │  4. Validación  │ ──> │ 5. Consolidación│
│     Fiscal      │     │  y Conversión   │     │      Visual       │     │   y Auditoría   │     │  y Exportación  │
└─────────────────┘     └─────────────────┘     └───────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3.1 Fase 1: Contexto Fiscal y Configuración Inicial
1. El usuario inicia en la pantalla de bienvenida donde debe ingresar obligatoriamente:
   * **Nombre de la Compañía:** Razón social completa para encabezados de reportes.
   * **RNC de la Compañía:** Número tributario de 9 u 11 dígitos.
2. El sistema valida sintácticamente que el RNC posea solo caracteres numéricos (o guiones que se limpian) y no permite avanzar al siguiente paso hasta que ambos campos sean válidos.
3. Este contexto queda almacenado en el estado de la sesión para servir como pivote de validación cruzada.

### 3.2 Fase 2: Ingestión, Validación de Archivos y Codificación
1. El usuario accede a la zona de carga donde puede arrastrar múltiples archivos simultáneamente o usar el explorador nativo.
2. Se admiten formatos: `.jpg`, `.jpeg`, `.png`, `.webp` y `.pdf`.
3. El frontend inicializa cada archivo en una cola de trabajo con estado reactivo `PENDING` y genera un `ObjectURL` temporal para permitir previsualizaciones locales.
4. Antes de enviar cada archivo al motor de inferencia, se transforma el binario a `base64` en el hilo del navegador utilizando un `FileReader` optimizado para evitar saturación de memoria.

### 3.3 Fase 3: Inferencia Visual y Extracción Estructurada con IA
1. Para cada archivo de la cola (procesamiento secuencial con actualización visual en tiempo real del estado `PROCESSING`):
   * Se envía el payload multimodal al modelo **Gemini Flash Vision** (`@google/genai`).
   * Se inyecta el **System Prompt Especializado en DGII** que impone:
     * Extracción obligatoria de los campos fiscales estándar.
     * Lectura directa de códigos QR impresos si están presentes en la imagen.
     * Detección del RNC del cliente receptor.
     * **REGLA DE TOLERANCIA CERO A LA INVENCIÓN:** Prohibición estricta de inferir números no legibles; el modelo debe sustituir exactamente los caracteres dudosos por `"x"`.
   * Se fuerza la respuesta bajo un esquema formal JSON (`Type.OBJECT` con propiedades obligatorias).

### 3.4 Fase 4: Validación Cruzada, Clasificación y Enrutamiento a Paneles
Una vez recibido el objeto JSON estructurado:
1. **Detección de Error OCR:** Se evalúa si alguno de los campos de texto (`proveedor`, `rncProveedor`, `ncf`, `subTotal`, `itbis`, `total`, `formaPago`, `rncCliente`) contiene el carácter `"x"`. Si es afirmativo, se activa la bandera `ocrError = true`.
2. **Validación Cruzada de RNC Cliente:**
   * Se extraen únicamente los dígitos numéricos del RNC del cliente detectado en la factura: `cleanExtractedRnc = (data.rncCliente || '').replace(/\D/g, '')`.
   * Se extraen los dígitos del RNC de la empresa configurado en el Paso 1: `cleanCompanyRnc = companyRnc.replace(/\D/g, '')`.
   * Si `cleanExtractedRnc` existe, tiene longitud válida y `cleanExtractedRnc !== cleanCompanyRnc`, se activa la bandera `mismatchRnc = true`.
3. **Clasificación y Actualización de Estado:**
   * La factura pasa a estado `SUCCESS`.
   * Si `mismatchRnc === true`, se enruta visualmente al **Box de Alerta de Discrepancia de RNC** y se etiqueta con el badge rojo `MISMATCH_RNC`.
   * Si `ocrError === true`, se enruta visualmente al **Box de Alerta de Errores OCR** y se etiqueta con el badge naranja `ERROR_OCR`.
   * Si no presenta ninguna anomalía, se etiqueta con el badge verde `OK`.

### 3.5 Fase 5: Consolidación, Exportación y Auditoría
El usuario dispone de acciones inmediatas en la barra de herramientas:
1. **Exportar a Excel (.xlsx):**
   * Convierte la matriz de facturas procesadas en una hoja de cálculo limpia con cabeceras formalizadas y columna de `Estado`.
2. **Exportar a PDF (.pdf):**
   * Genera un documento en orientación horizontal (*landscape*).
   * **Algoritmo de Priorización de Auditoría:** Ordena las filas para que todas las facturas con `MISMATCH_RNC` se desplacen automáticamente al final del reporte y se pinten con fondo amarillo suave (`#FFF3CD`), facilitando que el auditor fiscal las identifique al instante sin tener que buscar página por página.
   * Las facturas con `ERROR_OCR` se resaltan con fondo rojo/rosado tenue (`#F8D7DA`).

---

## 4. Workflow Detallado del Sistema (Diagrama y Flujo de Control)

### 4.1 Diagrama de Secuencia y Workflow Completo

```
┌────────┐               ┌────────────┐               ┌─────────────────┐               ┌─────────────────┐
│ Usuario│               │ Frontend UI│               │ Motor Inferencia│               │ Generador Report│
└───┬────┘               └─────┬──────┘               └────────┬────────┘               └────────┬────────┘
    │                          │                               │                                 │
    │ 1. Ingresa Razón Social  │                               │                                 │
    │    y RNC de la Empresa   │                               │                                 │
    │─────────────────────────>│                               │                                 │
    │                          │ Valida sintaxis RNC           │                                 │
    │                          │─────────────────────┐         │                                 │
    │                          │                     │         │                                 │
    │                          │<────────────────────┘         │                                 │
    │ 2. Habilita Paso 2       │                               │                                 │
    │<─────────────────────────│                               │                                 │
    │                          │                               │                                 │
    │ 3. Arrastra lote de      │                               │                                 │
    │    facturas (JPG/PDF)    │                               │                                 │
    │─────────────────────────>│                               │                                 │
    │                          │ Crea cola de archivos         │                                 │
    │                          │ Muestra lista & previews      │                                 │
    │                          │                               │                                 │
    │ 4. Clic "Procesar"       │                               │                                 │
    │─────────────────────────>│                               │                                 │
    │                          │                               │                                 │
    │                          │ ── BUCLE POR CADA FACTURA ──  │                                 │
    │                          │ Estado -> PROCESSING          │                                 │
    │                          │ Convierte File a Base64       │                                 │
    │                          │                               │                                 │
    │                          │ 5. POST payload multimodal    │                                 │
    │                          │    + Prompt DGII + JSON Schema│                                 │
    │                          │──────────────────────────────>│                                 │
    │                          │                               │ Aplica Visión Multimodal        │
    │                          │                               │ Lee QR / OCR / RNC Receptor     │
    │                          │                               │ Si duda carácter -> inserta "x" │
    │                          │                               │ Estructura JSON                 │
    │                          │ 6. Retorna JSON Estricto      │                                 │
    │                          │<──────────────────────────────│                                 │
    │                          │                               │                                 │
    │                          │ Normaliza & Compara RNCs      │                                 │
    │                          │ Verifica presencia de "x"     │                                 │
    │                          │ Clasifica: OK / OCR / MISMATCH│                                 │
    │                          │ Actualiza fila en tabla UI    │                                 │
    │                          │ ────────────────────────────  │                                 │
    │                          │                               │                                 │
    │ 7. Visualiza Consola de  │                               │                                 │
    │    Auditoría & Alertas   │                               │                                 │
    │<─────────────────────────│                               │                                 │
    │                          │                               │                                 │
    │ 8. Clic "Descargar Excel"│                               │                                 │
    │─────────────────────────>│                               │ 9. Genera libro XLSX            │
    │                          │────────────────────────────────────────────────────────────────>│
    │                          │                               │ Descarga binaria inmediata      │
    │<───────────────────────────────────────────────────────────────────────────────────────────│
    │                          │                               │                                 │
    │ 10. Clic "Descargar PDF" │                               │                                 │
    │─────────────────────────>│                               │ 11. Ordena MISMATCH_RNC al final│
    │                          │                               │     Aplica fondo #FFF3CD        │
    │                          │────────────────────────────────────────────────────────────────>│
    │                          │                               │ Descarga PDF auditado           │
    │<───────────────────────────────────────────────────────────────────────────────────────────│
```

### 4.2 Matriz de Decisiones y Clasificación de Facturas

```
                                  ┌───────────────────────────────┐
                                  │ Factura Procesada por la IA   │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                      ¿RNC Cliente Extraído?
                                      /                    \
                                    SÍ                      NO
                                    /                        \
           ┌───────────────────────┴──────┐            ┌──────┴──────────────────────┐
           │ ¿cleanExtracted !== cleanCompany? │   │ Asume RNC no impreso / B02  │
           └──────────────┬───────────────┘            └──────────────┬──────────────┘
                         / \                                          │
                       SÍ   NO                                        │
                      /       \                                       │
                     /         └────────────────────────┐             │
                    ▼                                   ▼             ▼
       ┌─────────────────────────┐             ┌─────────────────────────────┐
       │ Estado: MISMATCH_RNC    │             │ ¿Contiene carácter "x"?     │
       │                         │             └──────────────┬──────────────┘
       │ • Alert Box Discrepancia│                           / \
       │ • Badge Rojo            │                         SÍ   NO
       │ • Al final del PDF      │                        /       \
       │ • Resaltado en Amarillo │                       ▼         ▼
       └─────────────────────────┘          ┌─────────────────┐ ┌─────────────┐
                                            │Estado: ERROR_OCR│ │ Estado: OK  │
                                            │• Alert Box OCR  │ │ • Badge     │
                                            │• Badge Naranja  │ │   Verde     │
                                            │• Resaltado Rosa │ │ • Fila      │
                                            │  en PDF         │ │   Estándar  │
                                            └─────────────────┘ └─────────────┘
```

---

## 5. Especificación de Datos y Estructura Fiscal DGII

### 5.1 Campos Extraídos por Factura

| Campo | Tipo de Dato | Obligatorio | Descripción | Formato / Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `proveedor` | `String` | Sí | Razón social o nombre comercial del emisor | "Ferretería Americana S.A.S." |
| `rncProveedor` | `String` | Sí | Identificación tributaria del emisor | "101010101" / "00100000000" |
| `ncf` | `String` | Sí | Número de Comprobante Fiscal | "B0100000045" / "E3100000012" |
| `subTotal` | `String / Number` | Sí | Base imponible sin impuestos | "15000.00" |
| `itbis` | `String / Number` | Sí | Monto liquidado de ITBIS | "2700.00" |
| `total` | `String / Number` | Sí | Monto total a pagar | "17700.00" |
| `formaPago` | `String` | Sí | Medio de pago registrado | "Efectivo", "Tarjeta", "Transferencia", "Crédito" |
| `rncCliente` | `String` | Condicional | RNC receptor impreso en la factura | "132621468" |

---

## 6. Arquitectura Técnica e Integraciones

### 6.1 Arquitectura Actual en Producción (Frontend-Heavy + Gemini Vision API)
* **Frontend Core:** React 19 + TypeScript + Vite.
* **Estilos:** Tailwind CSS con variables de diseño iOS Glassmorphism.
* **Motor de Inferencia Visual:** Google Gemini 2.5 Flash (`@google/genai`), configurado con `responseMimeType: "application/json"` y `responseSchema` estricto.
* **Procesamiento de Archivos:** `react-dropzone` para captura de archivos y `FileReader` para codificación Base64 en memoria.
* **Generación de Reportes:** `xlsx` (SheetJS) para libros de cálculo y `jspdf` + `jspdf-autotable` para PDFs vectoriales con formateo condicional de celdas.

### 6.2 Especificación para Microservicio Backend Alternativo (FastAPI / Express)
Si el equipo de desarrollo decide trasladar la inferencia a un microservicio backend desacoplado, este debe implementar los siguientes contratos de API RESTful:

#### Endpoint 1: Procesar Factura Individual o Lote
* **Ruta:** `POST /api/v1/invoices/process`
* **Content-Type:** `multipart/form-data`
* **Headers:** `Authorization: Bearer <token>`
* **Payload:**
  * `file`: Archivo binario (PDF o Imagen).
  * `company_rnc`: RNC configurado de la empresa (String).
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "status": "SUCCESS",
  "data": {
    "proveedor": "Distribuidora Corripio SAS",
    "rncProveedor": "101555555",
    "ncf": "B0100001234",
    "subTotal": "8450.00",
    "itbis": "1521.00",
    "total": "9971.00",
    "formaPago": "Transferencia",
    "rncCliente": "132621468",
    "ocrError": false,
    "mismatchRnc": false
  }
}
```

#### Endpoint 2: Exportar Reporte Consolidado
* **Ruta:** `POST /api/v1/export/report`
* **Content-Type:** `application/json`
* **Payload:**
```json
{
  "company_name": "Constructora Angomas Tejeda S.R.L.",
  "company_rnc": "132621468",
  "format": "pdf", // o "xlsx"
  "invoices": [ /* Arreglo de facturas procesadas */ ]
}
```
* **Respuesta Exitosa (`200 OK`):** Retorna el flujo binario descargable (`application/pdf` o `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

---

## 7. Diseño de Interfaz y Experiencia de Usuario (UI/UX)

### 7.1 Principios Estéticos: "Fiberglass" (iOS 26)
* **Superficies Translúcidas:** `bg-white/70`, `backdrop-blur-2xl`, `border border-white/50`.
* **Profundidad y Elevación:** `shadow-xl`, `shadow-sm` con radios de curvatura suaves (`rounded-3xl` en tarjetas principales y `rounded-xl` en controles interactivos).
* **Gama Cromática Funcional:**
  * Fondo General: Gris neutro iOS `#f2f2f7`.
  * Acentos Primarios: Azul iOS `#2563eb` / `#1d4ed8`.
  * Estados OK: Verde esmeralda `#059669` / `#d1fae5`.
  * Estados Alerta OCR: Naranja ámbar `#d97706` / `#fef3c7`.
  * Estados Discrepancia RNC: Rojo carmesí `#dc2626` / `#fee2e2`.
* **Identidad Visual Corporativa:**
  * **Header:** Centrado con título `"Lector 606"` e isotipo `FileText`.
  * **Footer:** Centrado con texto `"Developed by Dominican AI Studio LLC"`.

---

## 8. Configuración de Entorno, Docker y Despliegue

### 8.1 Variables de Entorno Requeridas
Crear archivo `.env` o inyectar en variables del contenedor:
```env
# Clave de API de Google Gemini para procesamiento visual
GEMINI_API_KEY="tu_gemini_api_key_aqui"

# URL base del servicio
APP_URL="http://localhost:3000"
```

### 8.2 Dockerfile Multi-Stage para Producción
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### 8.3 Ejecución con Docker Compose
```bash
# Iniciar contenedor en segundo plano
docker-compose up -d --build

# Monitorear logs en tiempo real
docker-compose logs -f
```

---

## 9. Plan de Pruebas y Criterios de Aceptación (QA)

| ID | Escenario de Prueba | Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-01** | Subida de factura térmica nítida con RNC correcto | Imagen JPG con RNC receptor `132621468` | Estado `OK`, badge verde, valores numéricos limpios y RNC validado. |
| **TC-02** | Factura con NCF borroso o roto en un dígito | Factura con NCF parcialmente ilegible | Campo NCF con `"x"` en la posición dudosa (ej. `B01000xx34`), estado `ERROR_OCR`, inclusión en Alert Box de OCR. |
| **TC-03** | Factura emitida a otro RNC (ej. RNC personal) | Factura con RNC receptor `40200000000` | Estado `MISMATCH_RNC`, inclusión en Alert Box de discrepancias y ubicación al final del PDF con fondo amarillo `#FFF3CD`. |
| **TC-04** | Carga masiva por lotes (Batch) | 20 archivos combinados (JPG, PNG, PDF) | Procesamiento secuencial sin congelar UI, barra de estado reactiva y reporte de totales. |
| **TC-05** | Descarga de Reportes | Clic en "Excel" y "PDF" | Generación inmediata de `Reporte_606_[NombreEmpresa].xlsx` y `.pdf` respetando el formato visual y ordenamiento condicional. |

---

## 10. Consideraciones de Seguridad y Privacidad

1. **Privacidad y Retención de Documentos:** Los comprobantes se procesan en la memoria volátil del navegador durante la sesión activa. No se persisten imágenes en discos públicos sin autenticación.
2. **Protección de Credenciales:** La variable `GEMINI_API_KEY` se inyecta mediante variables de entorno seguras de Cloud Run o del contenedor Docker.
3. **Resguardo Fiscal:** Los reportes generados actúan como pre-auditoría para garantizar que la remisión formal a la plataforma DGII sea 100% conforme a la normativa.

---
*Documento elaborado y auditado por Dominican AI Studio LLC.*
