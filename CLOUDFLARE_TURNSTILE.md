# Cloudflare Turnstile para Bosich Legal

El formulario ya estÃ¡ preparado para Turnstile. Esto agrega una comprobaciÃ³n anti-spam sin mostrar los desafÃ­os molestos de un CAPTCHA tradicional.

## MaÃ±ana en Cloudflare

1. Entra a [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) con tu cuenta de Cloudflare.
2. Elige **Add widget** y ponle el nombre `Bosich Legal - contacto`.
3. En **Hostnames**, agrega:
   - `bosichlegal.cl`
   - `www.bosichlegal.cl` si vas a usar esa versiÃ³n
   - `localhost` solo si quieres probarlo desde tu computador
4. Elige el modo **Managed** y guarda.
5. Cloudflare mostrarÃ¡ dos valores:
   - **Site key**: pÃºblica. PÃ©gala en Administrador > Contenido > ConfiguraciÃ³n tÃ©cnica > `Cloudflare Turnstile site key pÃºblica`.
   - **Secret key**: privada. AgrÃ©gala en Vercel como `TURNSTILE_SECRET_KEY` para **Production** y **Preview**. Nunca la pongas en el formulario ni en GitHub.
6. Haz un envÃ­o de prueba desde `/contacto`.

## Correos de aviso

El sistema ya guarda cada solicitud y estÃ¡ preparado para enviar una notificaciÃ³n por correo. Cuando tengas el proveedor confirmado, configura en Vercel las claves del proveedor de correo y completa en Administrador > Contenido:

- Correo que recibe solicitudes de contacto.
- Remitente de notificaciones.
- Proveedor corporativo y notas DNS.

Las claves privadas del proveedor de correo no se guardan en el panel ni en el repositorio.
