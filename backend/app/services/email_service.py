import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_PASS = os.getenv("GMAIL_PASS", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _html_confirmacion(datos: dict) -> str:
    cancel_url = f"{FRONTEND_URL}/cancelar/{datos['cancel_token']}"
    mesa_txt = f"Mesa Nº {datos['mesa']}" if datos.get('mesa') else "Por asignar"
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#fdf6ec;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(180,100,0,0.1);">
            <tr>
              <td style="background:linear-gradient(135deg,#b45309,#92400e);padding:32px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;">🍽️ Restaurante Reservas</h1>
                <p style="color:#fde68a;margin:6px 0 0;font-size:14px;">Confirmación de reserva</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px;">
                <h2 style="color:#92400e;font-size:20px;margin:0 0 8px;">¡Hola, {datos['cliente_nombre']}! 👋</h2>
                <p style="color:#64748b;margin:0 0 28px;font-size:15px;">Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:12px;">
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #fde68a;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Mozo asignado</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['mozo']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #fde68a;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Fecha</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['fecha']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #fde68a;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Hora</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['hora']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #fde68a;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Personas</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['num_personas']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #fde68a;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Mesa</span>
                    <strong style="color:#1e293b;font-size:15px;">{mesa_txt}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Duración estimada</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['duracion']} minutos</strong>
                  </td></tr>
                </table>
                <p style="color:#64748b;font-size:14px;margin:28px 0 16px;">¿No puedes asistir? Cancela tu reserva aquí:</p>
                <div style="text-align:center;margin:0 0 28px;">
                  <a href="{cancel_url}" style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                    ❌ Cancelar mi reserva
                  </a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Si no hiciste esta reserva, ignora este correo.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#fffbeb;padding:20px 40px;text-align:center;border-top:1px solid #fde68a;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Restaurante Reservas</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """


def enviar_confirmacion(destinatario: str, datos: dict):
    if not GMAIL_USER or not GMAIL_PASS:
        print(f"[EMAIL] Sin GMAIL_USER/GMAIL_PASS. Correo para {destinatario} NO enviado.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🍽️ Confirmación de reserva — Restaurante"
        msg["From"] = f"Restaurante Reservas <{GMAIL_USER}>"
        msg["To"] = destinatario

        msg.attach(MIMEText(_html_confirmacion(datos), "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASS)
            server.sendmail(GMAIL_USER, destinatario, msg.as_string())

        print(f"[EMAIL] Confirmación enviada a {destinatario}")

    except Exception as e:
        print(f"[EMAIL] Error al enviar: {e}")
