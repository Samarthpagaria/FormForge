import QRCode from "qrcode";

export async function generateQRCode(url: string): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#7c3aed",  // purple dots
      light: "#ffffff", // white background
    },
    errorCorrectionLevel: "H",
  });

  return qrDataUrl; // base64 data URL
}