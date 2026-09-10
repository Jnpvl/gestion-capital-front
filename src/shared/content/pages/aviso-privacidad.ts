export const AVISO_PRIVACIDAD_PATH = "/aviso-de-privacidad";

export const avisoPrivacidadContent = {
  meta: {
    title: "Aviso de privacidad",
    description:
      "Aviso de privacidad de Gestiona Capital Humano: cómo recabamos, usamos y protegemos tus datos personales conforme a la legislación mexicana.",
  },
  hero: {
    label: "Legal",
    title: "Aviso de privacidad",
    description:
      "En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, te informamos cómo tratamos tus datos personales.",
  },
  lastUpdated: "7 de septiembre de 2026",
  gate: {
    title: "Aviso de privacidad",
    intro:
      "Para entrar a tus cursos debes leer y aceptar este aviso. Si no lo aceptas, no podrás usar tu cuenta de alumno.",
    acceptLabel: "He leído y acepto el aviso de privacidad",
    confirmLabel: "Aceptar y continuar",
    declineLabel: "No aceptar y salir",
    readFullLabel: "Leer el aviso completo",
  },
  sections: [
    {
      title: "1. Identidad y domicilio del responsable",
      paragraphs: [
        "Gestiona Capital Humano (en adelante, “Gestiona”, “nosotros” o el “Responsable”), con domicilio en Guaymas, Sonora, México, y correo de contacto hola@gestionach.com, es responsable del tratamiento de tus datos personales.",
      ],
    },
    {
      title: "2. Datos personales que recabamos",
      paragraphs: [
        "Según el servicio que utilices, podemos recabar:",
      ],
      bullets: [
        "Datos de identificación y contacto: nombre, apellidos, correo electrónico, teléfono y empresa.",
        "Datos de alumnos: CURP, sexo, edad, lugar de residencia, escolaridad, ocupación, puesto, sector y datos requeridos para constancias y DC-3 ante la STPS.",
        "Datos de cuenta: correo, contraseña (almacenada de forma cifrada) y progreso en cursos.",
        "Datos de instructores y staff: perfil profesional, registros STPS/CONOCER, fotografía y logotipo, cuando aplique.",
        "Datos de empresas cliente: razón social, RFC y datos de contacto para emisiones y reportes.",
        "Datos técnicos de sesión necesarios para autenticarte y operar la plataforma.",
      ],
    },
    {
      title: "3. Finalidades del tratamiento",
      paragraphs: [
        "Tratamos tus datos para las siguientes finalidades primarias, necesarias para la relación contigo:",
      ],
      bullets: [
        "Atender solicitudes de información, contacto y suscripción a eventos.",
        "Crear y administrar tu cuenta de alumno, instructor o administrador.",
        "Impartir capacitación, registrar avances, evaluar y emitir constancias o DC-3.",
        "Cumplir obligaciones legales, fiscales y de capacitación ante autoridades como la STPS.",
        "Comunicarnos contigo sobre el servicio contratado (accesos, recordatorios y documentos).",
      ],
    },
    {
      title: "4. Finalidades secundarias",
      paragraphs: [
        "Con tu consentimiento, también podemos usar tus datos para enviarte información sobre cursos, eventos o servicios relacionados. Puedes oponerte en cualquier momento escribiendo a hola@gestionach.com.",
      ],
    },
    {
      title: "5. Transferencias",
      paragraphs: [
        "Podemos compartir datos únicamente cuando sea necesario para:",
      ],
      bullets: [
        "La empresa que contrató tu capacitación, para evidencias de avance, constancias o DC-3.",
        "Autoridades competentes, cuando exista un mandato legal (por ejemplo, STPS).",
        "Proveedores que nos auxilian a operar la plataforma (hospedaje, correo), bajo obligaciones de confidencialidad.",
      ],
      closing:
        "No vendemos tus datos personales. Cualquier transferencia no prevista se realizará con tu consentimiento o conforme a la ley.",
    },
    {
      title: "6. Derechos ARCO y revocación del consentimiento",
      paragraphs: [
        "Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos, así como a revocar el consentimiento que nos hayas otorgado, en la medida en que la ley lo permita y no exista una obligación legal o contractual que lo impida.",
        "Para ejercer estos derechos, envía una solicitud a hola@gestionach.com indicando tu nombre, el derecho que deseas ejercer y los documentos que acrediten tu identidad. Te responderemos en los plazos previstos por la ley.",
      ],
    },
    {
      title: "7. Uso de la plataforma y consentimiento",
      paragraphs: [
        "El acceso a “Mis cursos” requiere que aceptes este aviso en tu primer inicio de sesión. Si no lo aceptas, no podrás entrar a tus cursos. El sitio público y el panel interno permanecen disponibles sin esta aceptación.",
        "Puedes consultar este aviso en cualquier momento en esta página.",
      ],
    },
    {
      title: "8. Medidas de seguridad",
      paragraphs: [
        "Implementamos medidas administrativas y técnicas razonables para proteger tus datos, incluyendo acceso autenticado y almacenamiento cifrado de contraseñas. Ningún sistema es infalible; si detectas un incidente, escríbenos de inmediato.",
      ],
    },
    {
      title: "9. Cambios a este aviso",
      paragraphs: [
        "Podemos actualizar este aviso para reflejar cambios legales u operativos. La versión vigente se publicará en esta página, con la fecha de última actualización. El uso continuado de la plataforma después de un cambio sustancial podrá requerir una nueva aceptación.",
      ],
    },
  ],
} as const;
