import jsPDF from "jspdf";
import "jspdf-autotable";
import FlowerLogo from '../assets/FlowerLogo.png';
import { getImageUrl } from "./imageHelper";

// Robust image loader with timeout
const loadImage = (url) => {
   return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const timer = setTimeout(() => {
         console.warn("Image load timeout for:", url);
         resolve(null);
      }, 3000);

      img.onload = () => {
         clearTimeout(timer);
         resolve(img);
      };
      img.onerror = () => {
         clearTimeout(timer);
         console.warn("Image load error for:", url);
         resolve(null);
      };
      img.src = url;
   });
};

export const generateInvoice = async (order, settings = {}) => {
   console.log("Starting universal invoice generation...");
   
   try {
      if (!order) throw new Error("Order data is missing");

      // Initialize doc using the alternative constructor for better compatibility
      const doc = new jsPDF();
      
      // Branding
      const indigo = [79, 70, 229];
      const slate900 = [15, 23, 42];
      const slate600 = [71, 85, 105];
      const slate400 = [148, 163, 184];

      // --- LOGO HANDLING ---
      try {
         const logoUrl = settings.logo ? getImageUrl(settings.logo) : FlowerLogo;
         const img = await loadImage(logoUrl);
         if (img) {
            doc.addImage(img, 'JPEG', 14, 12, 18, 18);
         } else {
            const staticImg = await loadImage(FlowerLogo);
            if (staticImg) doc.addImage(staticImg, 'JPEG', 14, 12, 18, 18);
            else {
               doc.setFillColor(...indigo);
               doc.rect(14, 15, 12, 12, "F");
            }
         }
      } catch (logoErr) {
         console.warn("Logo failed", logoErr);
         doc.setFillColor(...indigo);
         doc.rect(14, 15, 12, 12, "F");
      }

      // --- HEADER TEXT ---
      const companyName = (settings.site_name || settings.company_name || "MBW FLOWER SHOPPE").toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...slate900);
      doc.text(companyName, 32, 22);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate600);
      doc.text("Premium Botanical Design Studio", 32, 27);
      doc.text("Nashville, Tennessee", 32, 31);
      doc.text(`GSTIN: ${settings.gst_no || '33AAAAA0000A1Z5'} | Contact: ${settings.phone || '(615) 555-FLOWERS'}`, 32, 35);

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate900);
      doc.text("INVOICE", 196, 25, { align: "right" });

      const displayId = order.id?.toString().toUpperCase() || "N/A";
      doc.setFontSize(10);
      doc.text(`Invoice #: MBW-${displayId.split('-')[0]}`, 196, 32, { align: "right" });

      // --- SUMMARY BAR ---
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 45, 182, 15, 2, 2, "FD");

      doc.setFontSize(8);
      doc.setTextColor(...slate400);
      doc.text("DATE", 20, 51);
      doc.text("PAYMENT", 80, 51);
      doc.text("STATUS", 140, 51);

      doc.setFontSize(9);
      doc.setTextColor(...slate900);
      doc.text(new Date().toLocaleDateString(), 20, 56);
      doc.text((order.payment_method || "ONLINE").toUpperCase(), 80, 56);
      doc.setTextColor(...indigo);
      doc.text("PAID", 140, 56);

      // --- CUSTOMER DETAILS ---
      doc.setFontSize(8);
      doc.setTextColor(...slate400);
      doc.text("BILL TO", 14, 78);
      doc.text("SHIP TO", 110, 78);

      doc.setFontSize(10);
      doc.setTextColor(...slate900);
      doc.setFont("helvetica", "bold");
      doc.text(order.customer_name || "Valued Customer", 14, 84);
      doc.text(order.customer_name || "Valued Customer", 110, 84);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate600);
      doc.text(order.customer_email || "N/A", 14, 89);
      doc.text(order.shipping_address || "Standard Shipping", 110, 89);
      doc.text(`${order.shipping_city || ""}, ${order.shipping_zip || ""}`, 110, 94);

      // --- ITEMS TABLE ---
      const items = order.items || [];
      const tableBody = items.map(item => {
         const p = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : (item.price || 0);
         const q = item.quantity || 1;
         return [
            item.name || "Botanical Arrangement",
            q,
            `$${p.toFixed(2)}`,
            `$${(p * q).toFixed(2)}`
         ];
      });

      // Use the doc.autoTable property which is safer for many configurations
      if (typeof doc.autoTable !== 'function') {
         throw new Error("autoTable plugin is not attached to jsPDF instance.");
      }

      doc.autoTable({
         startY: 105,
         head: [["DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
         body: tableBody,
         theme: "striped",
         headStyles: { fillColor: slate900, fontSize: 8 },
         styles: { fontSize: 9 },
         columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
      });

      // --- TOTALS ---
      let finalY = doc.lastAutoTable.finalY + 10;
      const subtotal = tableBody.reduce((acc, row) => acc + parseFloat(row[3].replace('$', '')), 0);
      const discount = parseFloat(order.discountAmount || 0);
      const shipping = subtotal > 99 ? 0 : 15;
      const tax = (subtotal - discount) * 0.08;
      const grandTotal = subtotal - discount + shipping + tax;

      doc.setFontSize(9);
      doc.setTextColor(...slate600);
      doc.text("Subtotal:", 140, finalY);
      doc.text(`$${subtotal.toFixed(2)}`, 196, finalY, { align: "right" });
      finalY += 6;

      if (discount > 0) {
         doc.text("Discount:", 140, finalY);
         doc.text(`-$${discount.toFixed(2)}`, 196, finalY, { align: "right" });
         finalY += 6;
      }

      doc.text("Shipping:", 140, finalY);
      doc.text(`$${shipping.toFixed(2)}`, 196, finalY, { align: "right" });
      finalY += 6;

      doc.text("Tax (8%):", 140, finalY);
      doc.text(`$${tax.toFixed(2)}`, 196, finalY, { align: "right" });
      finalY += 10;

      doc.setFillColor(...slate900);
      doc.rect(135, finalY - 5, 61, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("GRAND TOTAL", 140, finalY + 2);
      doc.text(`$${grandTotal.toFixed(2)}`, 196, finalY + 2, { align: "right" });

      // Save using a more manual trigger if doc.save is blocked
      const fileName = `MBW_Invoice_${displayId.split('-')[0]}.pdf`;
      try {
         doc.save(fileName);
      } catch (saveErr) {
         console.warn("Standard save failed, trying fallback blob method", saveErr);
         const blob = doc.output('blob');
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = fileName;
         link.click();
         URL.revokeObjectURL(url);
      }
      
      console.log("Invoice generation process completed.");

   } catch (error) {
      console.error("Invoice System Error:", error);
      throw error;
   }
};
