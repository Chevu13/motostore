import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface OrderItem {
  productName: string
  variantInfo?: string | null
  quantity: number
  unitPrice: number | string
  totalPrice: number | string
}

interface Order {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  note?: string | null
  total: number | string
  items: OrderItem[]
}

function baseEmailLayout(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0B0B10; color: #e5e7eb; font-family: 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF4B1F, #E5484D); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; font-weight: 800; letter-spacing: 2px; }
    .header p { color: rgba(255,255,255,0.8); margin-top: 5px; }
    .body { background: #111118; padding: 30px; border: 1px solid rgba(255,255,255,0.1); }
    .footer { background: #0B0B10; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.05); border-top: none; }
    .footer p { color: #6b7280; font-size: 12px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #FF4B1F, #E5484D); color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 20px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { background: rgba(255,75,31,0.2); color: #FF4B1F; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
    .total-row td { font-weight: 700; color: #FF4B1F; font-size: 16px; border-top: 2px solid rgba(255,75,31,0.3); }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; }
    .info-box label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .info-box p { color: #e5e7eb; margin-top: 4px; font-weight: 500; }
    .status-badge { display: inline-block; background: rgba(255,75,31,0.2); color: #FF4B1F; border: 1px solid rgba(255,75,31,0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    h2 { color: #fff; font-size: 18px; margin: 20px 0 10px; }
    p { color: #9ca3af; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏍️ MOTOSTORE.RS</h1>
      <p>Premium moto oprema za srpske vozače</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2024 MotoStore.rs · Beograd, Srbija</p>
      <p style="margin-top:5px;">info@motostore.rs · +381 11 123 4567</p>
    </div>
  </div>
</body>
</html>
  `
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.productName}${item.variantInfo ? ` (${item.variantInfo})` : ''}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.unitPrice)}</td>
      <td>${formatPrice(item.totalPrice)}</td>
    </tr>
  `).join('')

  const content = `
    <h2>✅ Porudžbina primljena!</h2>
    <p>Poštovani ${order.firstName}, hvala na porudžbini! Vaša narudžbina je uspešno zabeležena i uskoro ćemo je potvrditi.</p>
    
    <div style="background: rgba(255,75,31,0.1); border: 1px solid rgba(255,75,31,0.3); border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #FF4B1F; font-weight: 700; font-size: 18px;">Broj narudžbine: ${order.orderNumber}</p>
      <span class="status-badge">Naručeno</span>
    </div>

    <h2>📦 Artikli</h2>
    <table class="table">
      <tr>
        <th>Artikal</th>
        <th>Kol.</th>
        <th>Cena</th>
        <th>Ukupno</th>
      </tr>
      ${itemsHtml}
      <tr class="total-row">
        <td colspan="3">UKUPNO ZA UPLATU:</td>
        <td>${formatPrice(order.total)}</td>
      </tr>
    </table>

    <h2>📍 Podaci za dostavu</h2>
    <div class="info-grid">
      <div class="info-box">
        <label>Ime i prezime</label>
        <p>${order.firstName} ${order.lastName}</p>
      </div>
      <div class="info-box">
        <label>Telefon</label>
        <p>${order.phone}</p>
      </div>
      <div class="info-box">
        <label>Adresa</label>
        <p>${order.address}, ${order.city} ${order.postalCode}</p>
      </div>
      <div class="info-box">
        <label>Plaćanje</label>
        <p>💵 Pouzećem (gotovinom kuriru)</p>
      </div>
    </div>

    ${order.note ? `
    <div class="info-box" style="margin: 15px 0;">
      <label>Napomena</label>
      <p>${order.note}</p>
    </div>
    ` : ''}

    <p style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #FF4B1F;">
      Dostava se vrši putem kurirske službe. Rok isporuke je 7-14 radnih dana. 
      Pratite status vaše narudžbine na našem sajtu pomoću broja narudžbine i email adrese.
    </p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'MotoStore.rs <noreply@motostore.rs>',
    to: order.email,
    subject: `✅ Potvrda narudžbine ${order.orderNumber} - MotoStore.rs`,
    html: baseEmailLayout(content, `Potvrda narudžbine ${order.orderNumber}`),
  })
}

export async function sendAdminOrderNotificationEmail(order: Order): Promise<void> {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.productName}${item.variantInfo ? ` (${item.variantInfo})` : ''}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.totalPrice)}</td>
    </tr>
  `).join('')

  const content = `
    <h2>🔔 Nova narudžbina!</h2>
    <p>Stigla je nova narudžbina. Proverite admin panel i potvrdite je.</p>
    
    <div style="background: rgba(255,75,31,0.1); border: 1px solid rgba(255,75,31,0.3); border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #FF4B1F; font-weight: 700; font-size: 20px;">${order.orderNumber}</p>
      <p style="color: #e5e7eb; font-size: 24px; font-weight: 800; margin-top: 5px;">${formatPrice(order.total)}</p>
    </div>

    <h2>👤 Kupac</h2>
    <div class="info-grid">
      <div class="info-box">
        <label>Ime</label>
        <p>${order.firstName} ${order.lastName}</p>
      </div>
      <div class="info-box">
        <label>Telefon</label>
        <p>${order.phone}</p>
      </div>
      <div class="info-box">
        <label>Email</label>
        <p>${order.email}</p>
      </div>
      <div class="info-box">
        <label>Adresa</label>
        <p>${order.address}, ${order.city} ${order.postalCode}</p>
      </div>
    </div>

    <h2>📦 Artikli</h2>
    <table class="table">
      <tr><th>Artikal</th><th>Kol.</th><th>Ukupno</th></tr>
      ${itemsHtml}
      <tr class="total-row">
        <td colspan="2">UKUPNO:</td>
        <td>${formatPrice(order.total)}</td>
      </tr>
    </table>

    ${order.note ? `<p><strong>Napomena:</strong> ${order.note}</p>` : ''}
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'MotoStore.rs <noreply@motostore.rs>',
    to: process.env.ADMIN_EMAIL || 'admin@motostore.rs',
    subject: `🔔 Nova narudžbina: ${order.orderNumber} (${formatPrice(order.total)})`,
    html: baseEmailLayout(content, `Nova narudžbina: ${order.orderNumber}`),
  })
}

export async function sendOrderStatusUpdateEmail(
  order: { orderNumber: string; email: string; firstName: string; status: string },
): Promise<void> {
  const statusLabel = {
    ORDERED: 'Naručeno',
    CONFIRMED: 'Potvrđeno',
    PURCHASED: 'Kupljeno',
    IN_TRANSIT: 'U tranzitu',
    ARRIVED: 'Stiglo',
    DELIVERED: 'Predato',
  }[order.status] || order.status

  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Vaša narudžbina je potvrđena! Uskoro kreće sa pripremom.',
    PURCHASED: 'Artikli su poručeni od dobavljača i u pripremi su za slanje.',
    IN_TRANSIT: 'Vaša narudžbina je predana kurirskoj službi i na putu je do vas!',
    ARRIVED: 'Pakovanje je stiglo u Srbiju i biće dostavljeno uskoro.',
    DELIVERED: 'Vaša narudžbina je uspešno isporučena! Hvala na poverenju! 🏍️',
  }

  const message = statusMessages[order.status] || 'Status vaše narudžbine je ažuriran.'

  const content = `
    <h2>📬 Ažuriranje statusa narudžbine</h2>
    <p>Poštovani ${order.firstName}, ažurirali smo status vaše narudžbine.</p>

    <div style="background: rgba(255,75,31,0.1); border: 1px solid rgba(255,75,31,0.3); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #9ca3af; margin-bottom: 5px;">Broj narudžbine</p>
      <p style="color: #FF4B1F; font-weight: 800; font-size: 20px;">${order.orderNumber}</p>
      <p style="color: #9ca3af; margin: 10px 0 5px;">Novi status</p>
      <span class="status-badge" style="font-size: 16px; padding: 8px 20px;">${statusLabel}</span>
    </div>

    <p style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #FF4B1F;">
      ${message}
    </p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'MotoStore.rs <noreply@motostore.rs>',
    to: order.email,
    subject: `📬 Status narudžbine ${order.orderNumber}: ${statusLabel}`,
    html: baseEmailLayout(content, `Status narudžbine: ${statusLabel}`),
  })
}

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('sr-RS').format(num) + ' RSD'
}
