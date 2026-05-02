const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "taskenginembw@gmail.com",
    pass: "rgxi vkao aqli pafs",
  },
});

const sendOrderConfirmation = async (order, customer, items, isNewCustomer = false) => {
  const mailOptions = {
    from: '"Gallatin Design Studio" <taskenginembw@gmail.com>',
    to: order.customer_email,
    subject: `Order Confirmation: #${order.id.split('-')[0].toUpperCase()}`,
    html: `
      <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 32px; color: #1e293b;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; padding: 12px 24px; background: #7c3aed10; border-radius: 16px; margin-bottom: 16px;">
             <span style="color: #7c3aed; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em;">Gallatin Archive</span>
          </div>
          <h1 style="color: #1e293b; font-size: 32px; margin: 0; font-family: serif; font-style: italic;">Order Success!</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">A botanical masterpiece is now in the making.</p>
        </div>

        <p style="color: #1e293b; font-size: 16px; font-weight: 500;">Hello ${customer.first_name || 'Valued Client'},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Your recent acquisition <strong>#${order.id.split('-')[0].toUpperCase()}</strong> has been successfully registered. We'll send another transmission once your order transitions to transit.
        </p>

        <!-- Amazon Style: Action Links -->
        <div style="margin: 24px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 12px 0; display: flex; justify-content: space-between;">
           <a href="${process.env.FRONTEND_URL}/account" style="color: #7c3aed; font-size: 12px; font-weight: 600; text-decoration: none;">View Order Status</a>
           <span style="color: #cbd5e1;">|</span>
           <a href="${process.env.FRONTEND_URL}/terms-conditions" style="color: #7c3aed; font-size: 12px; font-weight: 600; text-decoration: none;">Returns & Replacements</a>
        </div>

        <!-- Line Items -->
        <div style="margin: 32px 0;">
          <h3 style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 16px;">Botanical Selection</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <th style="text-align: left; padding: 12px 0; font-size: 12px; color: #64748b; font-weight: 500;">Item</th>
                <th style="text-align: center; padding: 12px 0; font-size: 12px; color: #64748b; font-weight: 500;">Qty</th>
                <th style="text-align: right; padding: 12px 0; font-size: 12px; color: #64748b; font-weight: 500;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 16px 0; font-size: 14px; font-weight: 500; color: #1e293b;">${item.name}</td>
                  <td style="padding: 16px 0; font-size: 14px; text-align: center; color: #64748b;">${item.quantity}</td>
                  <td style="padding: 16px 0; font-size: 14px; text-align: right; font-weight: 600; color: #1e293b;">$${parseFloat(item.price || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Financial Dossier -->
        <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 24px; padding: 24px; margin: 32px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            ${order.discount_code ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Promo Code Applied (${order.discount_code})</td>
              <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 600; text-align: right;">-$${parseFloat(order.discount_amount || 0).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Final Valuation</td>
              <td style="padding: 6px 0; color: #7c3aed; font-size: 16px; font-weight: 800; text-align: right;">$${parseFloat(order.total_amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Delivery Scheduled</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 12px; font-weight: 600; text-align: right;">${order.delivery_date}</td>
            </tr>
          </table>
        </div>

        <!-- Amazon Style: Rating Section -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Tell us how we did!</p>
          <a href="${process.env.FRONTEND_URL}/account" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: #ffffff; border-radius: 12px; font-size: 13px; font-weight: 600; text-decoration: none;">Rate your Experience</a>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b;">Rate your delivery and review your items in Your Orders</p>
        </div>

        ${isNewCustomer ? `
        <!-- New Customer Credentials -->
        <div style="background: #1e1b4b; color: #ffffff; border-radius: 24px; padding: 32px; margin: 32px 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <h3 style="margin-top: 0; font-size: 18px; font-family: serif; color: #ffffff;">Welcome to the Inner Circle</h3>
          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 24px;">To facilitate your future botanical explorations, we have automatically initialized your personal archival account.</p>
          
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em;">Access Email (Username)</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff !important;">
                <a href="javascript:void(0);" style="color: #ffffff !important; text-decoration: none !important; cursor: text;">${customer.email}</a>
              </p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em;">Security Token (Password)</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">BotanicalGuest123!</p>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid #f1f5f9; margin-top: 40px; padding-top: 32px; text-align: center;">
          <p style="color: #64748b; font-size: 11px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Gallatin Master Design Studio</p>
          <p style="color: #cbd5e1; font-size: 9px; margin-top: 16px;">© 2026 Boutique Archive. This is an automated secure transmission.</p>
        </div>
      </div>
    `
  };



  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Order confirmation sent to ${order.customer_email}`);
  } catch (error) {
    console.error('[Email] Failed to send order confirmation:', error);
  }
};

module.exports = { sendOrderConfirmation };
