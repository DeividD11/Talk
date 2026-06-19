# Auth MVC con Supabase

Proyecto frontend estático para autenticación de usuarios con **HTML, CSS y JavaScript puro**, organizado con una arquitectura MVC pragmática.

## Funcionalidades

- Registro de usuario
- Inicio de sesión
- Cierre de sesión
- Persistencia de sesión
- Protección básica de la vista privada
- Validaciones y mensajes de error claros
- Reenvío de correo de confirmación cuando el usuario aún no verificó su email

## Estructura

```text
index.html
assets/
  css/styles.css
  js/
    app.js
    config/supabase.js
    controllers/authController.js
    models/authModel.js
    utils/validators.js
    views/authView.js
```

## Configuración de Supabase

Edita `assets/js/config/supabase.js` y reemplaza:

- `SUPABASE_URL` por tu URL del proyecto
- `SUPABASE_PUBLISHABLE_KEY` por tu publishable key

No coloques `service_role` ni secret keys en el frontend.

## Importante sobre "Email not confirmed"

Si en Supabase está activada la confirmación de correo, un usuario puede registrarse y aun así no poder iniciar sesión hasta confirmar su email.  
Este proyecto detecta ese caso y muestra una acción para reenviar el enlace de confirmación desde la interfaz.

## Ejecutar en local

Como usa módulos ES y un import remoto de Supabase, sirve el proyecto con un servidor estático. Por ejemplo:

```bash
python -m http.server 5173
```

Luego abre:

```text
http://localhost:5173
```

## Despliegue

Puedes subir la carpeta completa a cualquier hosting estático:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

## Nota de seguridad

Este proyecto usa solo credenciales públicas de cliente. Supabase documenta que la publishable key puede exponerse en navegador para flujos de auth del cliente, mientras que la `service_role` nunca debe ir en el navegador. Mantén RLS habilitado en tablas y revisa las políticas.
