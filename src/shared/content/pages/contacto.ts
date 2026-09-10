export const contactoContent = {
  meta: {
    title: "Contacto",
    description:
      "Contáctanos para agendar una asesoría en capital humano, capacitación o cumplimiento normativo en Guaymas, Sonora.",
  },
  hero: {
    label: "Contacto",
    title: "Hablemos sobre tu empresa",
    description:
      "Cuéntanos qué necesitas y te responderemos a la brevedad con una propuesta adaptada a tu organización.",
  },
  channels: [
    {
      title: "Correo electrónico",
      value: "hola@gestionach.com",
      href: "mailto:hola@gestionach.com",
      description: "Escríbenos para cotizaciones, dudas o información general.",
    },
    {
      title: "WhatsApp",
      value: "+52 622 179 2472",
      href: "https://wa.me/526221792472",
      description: "Mensaje directo para consultas rápidas y agendar citas.",
    },
    {
      title: "Ubicación",
      value: "Guaymas, Sonora, México",
      description: "Atendemos empresas en Guaymas y la región noroeste del país.",
    },
  ],
  form: {
    title: "Envíanos un mensaje",
    description:
      "Completa el formulario y nos pondremos en contacto contigo. Los campos marcados con * son obligatorios.",
    submitLabel: "Enviar mensaje",
    successMessage: "Gracias por tu mensaje. Te contactaremos pronto.",
  },
  schedule: {
    title: "Horario de atención",
    items: [
      "Lunes a viernes: 9:00 — 18:00 hrs",
      "Sábados: Con cita previa",
      "Domingos y festivos: Cerrado",
    ],
  },
} as const;
