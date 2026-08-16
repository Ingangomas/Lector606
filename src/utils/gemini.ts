import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface InvoiceData {
  id: string;
  fileName: string;
  proveedor: string;
  rncProveedor: string;
  ncf: string;
  subTotal: string;
  itbis: string;
  total: string;
  formaPago: string;
  rncCliente: string;
  ocrError: boolean;
  mismatchRnc: boolean;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
  fileUrl: string;
  errorMsg?: string;
}

export async function processInvoice(file: File, companyRnc: string): Promise<Partial<InvoiceData>> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = error => reject(error);
  });

  const mimeType = file.type;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        }
      },
      {
        text: `
          Actúa como un sistema experto de OCR para facturas de la República Dominicana (DGII).
          Extrae la siguiente información de la factura proporcionada.
          
          REGLA ESTRICTA DE OCR: Si no puedes leer o entender un dígito o carácter con 100% de seguridad, ESTÁ PROHIBIDO inventarlo. Debes colocar una letra "x" minúscula en el lugar del carácter no reconocido.
          
          Busca también el RNC del cliente (a quien se le emite la factura).
          
          Extrae los siguientes campos:
          - proveedor: Nombre del proveedor o emisor de la factura.
          - rncProveedor: RNC del proveedor.
          - ncf: Número de Comprobante Fiscal (NCF).
          - subTotal: Monto sub-total (solo números, sin símbolos de moneda).
          - itbis: Monto de ITBIS o impuestos (solo números).
          - total: Monto total (solo números).
          - formaPago: Forma de pago (Efectivo, Tarjeta, Transferencia, Cheque, Crédito, etc.).
          - rncCliente: RNC del cliente al que se emite la factura.
        `
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          proveedor: { type: Type.STRING },
          rncProveedor: { type: Type.STRING },
          ncf: { type: Type.STRING },
          subTotal: { type: Type.STRING },
          itbis: { type: Type.STRING },
          total: { type: Type.STRING },
          formaPago: { type: Type.STRING },
          rncCliente: { type: Type.STRING },
        },
        required: ["proveedor", "rncProveedor", "ncf", "subTotal", "itbis", "total", "formaPago", "rncCliente"]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  const data = JSON.parse(jsonStr);
  
  const hasOcrError = Object.values(data).some(val => typeof val === 'string' && val.includes('x'));
  
  const cleanExtractedRnc = (data.rncCliente || '').replace(/\D/g, '');
  const cleanCompanyRnc = companyRnc.replace(/\D/g, '');
  
  const mismatchRnc = cleanExtractedRnc !== cleanCompanyRnc && cleanExtractedRnc !== '';

  return {
    proveedor: data.proveedor,
    rncProveedor: data.rncProveedor,
    ncf: data.ncf,
    subTotal: data.subTotal,
    itbis: data.itbis,
    total: data.total,
    formaPago: data.formaPago,
    rncCliente: data.rncCliente,
    ocrError: hasOcrError,
    mismatchRnc: mismatchRnc
  };
}
