export const POLITICAS_PATH = "/politicas";

type PoliticasSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  closing?: string;
};

export const politicasContent: {
  meta: { title: string; description: string };
  hero: { label: string; title: string; description: string };
  lastUpdated: string;
  sections: PoliticasSection[];
} = {
  meta: {
    title: "Políticas, términos y condiciones",
    description:
      "Políticas, términos y condiciones de los servicios de Gestiona Capital Humano: capacitación, constancias, asesoría y cumplimiento normativo.",
  },
  hero: {
    label: "Legal",
    title: "Políticas, términos y condiciones de servicios",
    description:
      "Condiciones aplicables a la contratación y prestación de los servicios de GESTIONA CAPITAL HUMANO.",
  },
  lastUpdated: "10 de septiembre de 2026",
  sections: [
    {
      title: "Introducción",
      paragraphs: [
        "El presente documento establece las políticas, términos y condiciones aplicables a los servicios proporcionados por GESTIONA CAPITAL HUMANO (en adelante, “GESTIONA”), incluyendo, de manera enunciativa mas no limitativa, servicios de capacitación laboral, emisión de constancias y documentación de capacitación, asesoría en capital humano, seguridad e higiene, cumplimiento normativo, diagnósticos, consultoría y servicios relacionados.",
        "La contratación, aceptación de una cotización, orden de servicio, propuesta comercial, contrato, pago o confirmación de cualquiera de nuestros servicios implica que el cliente ha leído y acepta las presentes políticas, términos y condiciones, sin perjuicio de las condiciones particulares que puedan establecerse por escrito para cada servicio.",
      ],
    },
    {
      title: "1. Política de contratación y prestación de servicios",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO prestará los servicios que hayan sido expresamente contratados y aceptados por el cliente mediante cotización, propuesta comercial, contrato, orden de servicio o cualquier otro documento que permita acreditar la contratación.",
        "El alcance de cada servicio será determinado por la propuesta comercial o documento correspondiente. Cualquier actividad, entregable, visita, capacitación, documento, trámite, seguimiento o servicio que no se encuentre expresamente incluido podrá considerarse un servicio adicional y, en su caso, generar un costo adicional.",
        "Para iniciar un servicio, GESTIONA CAPITAL HUMANO podrá requerir al cliente información, documentación, accesos, instalaciones, personal, equipos, materiales o cualquier otro recurso necesario para la adecuada prestación del servicio.",
        "El cliente será responsable de proporcionar información completa, correcta, actualizada y veraz.",
        "Cuando la prestación del servicio dependa de información, documentación, autorizaciones o acciones que correspondan al cliente, los tiempos de entrega podrán modificarse cuando el cliente no proporcione oportunamente dichos elementos.",
        "GESTIONA CAPITAL HUMANO podrá suspender temporalmente la prestación de un servicio cuando exista incumplimiento de pago, falta de información indispensable, imposibilidad material para prestar el servicio, condiciones inseguras o cualquier otra circunstancia que impida razonablemente su ejecución.",
      ],
    },
    {
      title: "2. Obligaciones del cliente",
      paragraphs: [
        "El cliente se obliga a:",
        "GESTIONA CAPITAL HUMANO no será responsable por consecuencias derivadas de información incorrecta, incompleta, desactualizada o falsa proporcionada por el cliente.",
      ],
      bullets: [
        "Proporcionar información veraz, completa y actualizada",
        "Entregar oportunamente la documentación necesaria para la prestación del servicio",
        "Informar cualquier circunstancia que pueda afectar la ejecución del servicio",
        "Permitir, cuando corresponda, el acceso a las instalaciones necesarias para realizar diagnósticos, capacitaciones, evaluaciones o asesorías",
        "Garantizar condiciones adecuadas y seguras para la realización de las actividades",
        "Designar, cuando sea necesario, a una persona responsable de coordinar el servicio",
        "Cumplir con los pagos establecidos",
        "Revisar oportunamente los documentos, reportes y entregables proporcionados",
        "Informar cualquier error u omisión detectado en la documentación",
        "No proporcionar información falsa, alterada o obtenida de manera ilícita",
      ],
    },
    {
      title: "3. Política de pagos, cancelaciones y reprogramaciones",
      paragraphs: [
        "Las condiciones económicas de cada servicio serán las establecidas en la cotización, propuesta comercial, contrato u orden de servicio correspondiente.",
        "Salvo que se establezca algo diferente por escrito, el servicio podrá estar sujeto a un anticipo o pago previo para confirmar la fecha y disponibilidad.",
        "La falta de pago podrá ocasionar la suspensión o cancelación del servicio, sin responsabilidad para GESTIONA CAPITAL HUMANO.",
        "En el caso de capacitaciones, cursos, talleres, evaluaciones o eventos programados, las solicitudes de cancelación o reprogramación deberán realizarse con la anticipación establecida en la cotización o propuesta comercial o con un mínimo de 48 horas.",
        "Cuando no se haya establecido un plazo específico, GESTIONA podrá establecer condiciones de reprogramación de acuerdo con la naturaleza del servicio, los costos incurridos y la disponibilidad de instructores, instalaciones y recursos.",
        "Los gastos que GESTIONA CAPITAL HUMANO haya realizado previamente para la prestación del servicio, incluyendo materiales, traslados, reservaciones, viáticos, personal, plataformas u otros conceptos no recuperables, podrán ser considerados en caso de cancelación o reprogramación.",
        "Las condiciones específicas de devolución de anticipos serán determinadas en la propuesta comercial o contrato correspondiente.",
      ],
    },
    {
      title: "4. Política de capacitación",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO podrá proporcionar cursos, talleres, seminarios, programas de formación y otras actividades de capacitación en modalidad presencial, virtual o híbrida.",
        "Cada capacitación podrá contar con objetivos, contenidos, duración, modalidad, requisitos de participación y mecanismos de evaluación previamente determinados.",
        "El cliente deberá proporcionar oportunamente la información necesaria para registrar a los participantes y elaborar la documentación correspondiente.",
        "La participación en una capacitación no implica automáticamente la acreditación del participante ni la emisión de cualquier documento específico.",
        "Cuando el curso contemple evaluación, el participante deberá cumplir con los criterios de acreditación establecidos para dicho curso.",
        "GESTIONA CAPITAL HUMANO podrá modificar aspectos operativos de una capacitación cuando resulte necesario, procurando mantener los objetivos y contenidos contratados.",
      ],
    },
    {
      title: "5. Política de asistencia y acreditación",
      paragraphs: [
        "La emisión de constancias, diplomas, certificados o documentación relacionada con la capacitación estará sujeta al cumplimiento de los requisitos previamente establecidos.",
        "Dependiendo de la naturaleza del curso, los requisitos podrán incluir:",
        "La inscripción o pago de un curso no garantiza por sí mismo la acreditación ni la emisión de una constancia.",
        "En caso de inasistencia, abandono o incumplimiento de los requisitos de acreditación, GESTIONA CAPITAL HUMANO podrá negar la emisión de la documentación que requiera haber cumplido dichos requisitos.",
      ],
      bullets: [
        "Registro correcto del participante",
        "Asistencia mínima requerida",
        "Participación durante las actividades",
        "Cumplimiento de ejercicios o actividades",
        "Presentación de evaluaciones",
        "Obtención de la calificación mínima establecida",
        "Cumplimiento de los requisitos específicos del programa",
      ],
    },
    {
      title: "6. Política de evaluación",
      paragraphs: [
        "Cuando un curso contemple evaluación, GESTIONA CAPITAL HUMANO establecerá previamente los mecanismos y criterios correspondientes.",
        "Las evaluaciones podrán realizarse mediante exámenes escritos, electrónicos, prácticos, ejercicios, demostraciones, entrevistas, participación u otros mecanismos apropiados para determinar el cumplimiento de los objetivos del curso.",
        "El resultado de la evaluación será determinado con base en los criterios establecidos para la capacitación.",
        "Cuando el participante no acredite una evaluación, podrá existir la posibilidad de una evaluación adicional únicamente cuando ésta haya sido contemplada por GESTIONA CAPITAL HUMANO y las condiciones del servicio lo permitan.",
      ],
    },
    {
      title: "7. Política de emisión de constancias",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO podrá emitir constancias de participación, asistencia, aprovechamiento, aprobación u otros documentos relacionados con los servicios de capacitación, según corresponda.",
        "El tipo de documento que se emita dependerá de la naturaleza del servicio y del cumplimiento de los requisitos establecidos.",
        "Las constancias deberán contener información veraz y correspondiente al servicio efectivamente prestado.",
        "El cliente y/o participante será responsable de revisar los datos contenidos en las constancias y comunicar cualquier error a GESTIONA dentro del plazo de 7 días.",
        "Las solicitudes de corrección derivadas de información incorrecta proporcionada por el cliente o participante podrán estar sujetas a un proceso de reposición y, cuando corresponda, a un costo administrativo.",
      ],
    },
    {
      title: "8. Política de emisión y control de DC-3",
      paragraphs: [
        "Cuando GESTIONA CAPITAL HUMANO o sus instructores operen como Agente Capacitador Externo y el servicio contratado corresponda a capacitación que permita la emisión de una Constancia de Competencias o Habilidades Laborales (DC-3), su emisión estará sujeta al cumplimiento de los requisitos legales y administrativos aplicables por la STPS.",
        "La contratación o pago de una capacitación no constituye por sí misma una garantía de emisión de una DC-3.",
        "Para la emisión de la documentación correspondiente, el participante deberá cumplir con los requisitos establecidos para el curso, incluyendo, cuando corresponda, asistencia, participación, evaluación y acreditación.",
        "El cliente será responsable de proporcionar correctamente los datos de la empresa y de los trabajadores participantes.",
        "GESTIONA CAPITAL HUMANO no será responsable por errores derivados de información incorrecta, incompleta o desactualizada proporcionada por el cliente.",
        "La emisión, corrección, reposición y entrega de las DC-3 se realizará conforme a los procedimientos internos de GESTIONA CAPITAL HUMANO y a las disposiciones aplicables de la Secretaría del Trabajo y Previsión Social.",
        "La DC-3 constituye una constancia relacionada con la capacitación recibida y/o acreditada en los términos aplicables y no deberá interpretarse como una certificación general de competencias profesionales, licencia profesional, autorización gubernamental o garantía de cumplimiento integral de las obligaciones laborales de la empresa.",
        "GESTIONA CAPITAL HUMANO no garantiza que la emisión de una DC-3 implique por sí misma el cumplimiento de todas las obligaciones de capacitación de una empresa frente a una autoridad.",
      ],
    },
    {
      title: "9. Corrección y reposición de documentos",
      paragraphs: [
        "Cuando un documento contenga errores atribuibles a GESTIONA CAPITAL HUMANO, ésta realizará la corrección correspondiente sin costo, siempre que se confirme el error.",
        "Cuando el error provenga de información incorrecta proporcionada por el cliente o participante, la corrección o reposición podrá generar un costo administrativo.",
        "Las solicitudes deberán realizarse mediante los canales oficiales de GESTIONA CAPITAL HUMANO y proporcionar la información necesaria para localizar el documento original.",
        "No se realizarán modificaciones que alteren la información real de la capacitación, evaluación, asistencia o acreditación del participante.",
      ],
    },
    {
      title: "10. Política de asesoría de capital humano",
      paragraphs: [
        "Los servicios de asesoría en capital humano podrán incluir, dependiendo del servicio contratado:",
        "Las recomendaciones de GESTIONA CAPITAL HUMANO estarán basadas en la información proporcionada por el cliente y en las condiciones identificadas durante la prestación del servicio.",
        "La implementación de las recomendaciones corresponderá al cliente, salvo que expresamente se haya contratado a GESTIONA CAPITAL HUMANO para realizar dicha implementación.",
      ],
      bullets: [
        "Diagnósticos organizacionales",
        "Análisis de puestos",
        "Procesos de recursos humanos",
        "Evaluación y desarrollo de talento",
        "Capacitación",
        "Implementación y actualización de leyes, normativas, estándares y certificaciones",
        "Clima organizacional",
        "Desarrollo de políticas y procedimientos",
        "Elaboración de perfiles y descripciones de puesto",
        "Orientación en procesos de reclutamiento y selección",
        "Desarrollo organizacional",
        "Otros servicios relacionados con la gestión de capital humano",
        "El alcance específico será el establecido en la propuesta comercial correspondiente",
      ],
    },
    {
      title: "11. Política de seguridad e higiene",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO podrá proporcionar servicios de diagnóstico, asesoría, capacitación, acompañamiento y elaboración de documentación relacionada con seguridad y salud en el trabajo, de acuerdo con el alcance contratado.",
        "Los servicios podrán comprender, entre otros:",
        "Los servicios de GESTIONA CAPITAL HUMANO constituyen asesoría y acompañamiento profesional y no sustituyen las obligaciones legales que correspondan al patrón, empresa, centro de trabajo, responsables internos o terceros.",
        "El cliente será responsable de implementar las medidas, recomendaciones y acciones necesarias dentro de su centro de trabajo.",
        "GESTIONA CAPITAL HUMANO no garantiza la inexistencia de accidentes, incidentes, inspecciones, observaciones, multas, sanciones o cualquier otra consecuencia derivada de las condiciones reales del centro de trabajo.",
      ],
      bullets: [
        "Diagnósticos",
        "Identificación de áreas de oportunidad",
        "Recomendaciones",
        "Programas de seguridad y salud",
        "Capacitación",
        "Apoyo documental",
        "Orientación en materia de cumplimiento de las Normas Oficiales Mexicanas aplicables",
        "Seguimiento de acciones correctivas",
      ],
    },
    {
      title: "12. Política de asesoría normativa y cumplimiento",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO podrá brindar asesoría relacionada con legislación laboral, seguridad y salud en el trabajo, capacitación y otras disposiciones aplicables al alcance del servicio contratado.",
        "Las recomendaciones se realizarán con base en la información proporcionada por el cliente, las condiciones observadas y la normativa aplicable al momento de prestar el servicio.",
        "Debido a que las disposiciones legales y normativas pueden modificarse, el cumplimiento deberá revisarse y actualizarse periódicamente.",
        "La asesoría proporcionada por GESTIONA CAPITAL HUMANO no constituye una resolución, autorización, certificación o garantía emitida por una autoridad.",
        "GESTIONA CAPITAL HUMANO no garantiza que una empresa estará exenta de inspecciones, multas, sanciones, requerimientos u observaciones de cualquier autoridad.",
        "La responsabilidad final de implementar y mantener las obligaciones legales y normativas aplicables corresponde al cliente en su carácter de patrón, empresa, centro de trabajo o responsable correspondiente.",
      ],
    },
    {
      title: "13. Política de diagnósticos y auditorías",
      paragraphs: [
        "Cuando se realicen diagnósticos, revisiones o auditorías, éstos tendrán como finalidad identificar condiciones, riesgos, incumplimientos o áreas de oportunidad dentro del alcance contratado.",
        "Los resultados estarán basados en la información, documentos, instalaciones y condiciones disponibles al momento de la revisión.",
        "La imposibilidad de acceder a determinadas áreas, documentos o información podrá limitar el alcance de las conclusiones.",
        "GESTIONA CAPITAL HUMANO podrá informar las limitaciones identificadas en el diagnóstico o auditoría.",
        "Un diagnóstico o auditoría no constituye una garantía de que no existan otras condiciones, riesgos o incumplimientos no identificados durante la revisión.",
      ],
    },
    {
      title: "14. Política de responsabilidad del cliente",
      paragraphs: [
        "El cliente será responsable de:",
        "La contratación de GESTIONA CAPITAL HUMANO no transfiere a ésta las obligaciones legales que correspondan al cliente.",
      ],
      bullets: [
        "Cumplir las obligaciones legales que le correspondan",
        "Implementar las recomendaciones recibidas",
        "Mantener actualizada su documentación",
        "Proporcionar información veraz",
        "Capacitar a su personal cuando legalmente corresponda",
        "Mantener condiciones seguras de trabajo",
        "Realizar las acciones correctivas necesarias",
        "Dar seguimiento a los resultados de los diagnósticos y asesorías",
      ],
    },
    {
      title: "15. Política de no garantía de resultados",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO se compromete a prestar los servicios contratados con diligencia y profesionalismo.",
        "Sin embargo, debido a que los resultados de determinados servicios dependen de factores externos y de las decisiones y acciones del cliente, GESTIONA CAPITAL HUMANO no garantiza resultados específicos en materia de:",
        "GESTIONA CAPITAL HUMANO responderá por la adecuada prestación de los servicios expresamente contratados dentro del alcance acordado.",
      ],
      bullets: [
        "Reducción de accidentes",
        "Reducción de rotación de personal",
        "Mejora del clima laboral",
        "Obtención de certificaciones",
        "Resultado de inspecciones",
        "Ausencia de multas o sanciones",
        "Aprobación por parte de autoridades",
        "Cumplimiento integral de obligaciones no incluidas en el servicio",
        "Resultados derivados de decisiones tomadas por el cliente",
      ],
    },
    {
      title: "16. Política de confidencialidad",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO se compromete a mantener la confidencialidad respecto de la información que reciba del cliente con motivo de la prestación de los servicios.",
        "La información confidencial podrá incluir:",
        "GESTIONA utilizará dicha información únicamente para las finalidades relacionadas con los servicios contratados y de conformidad con el Aviso de Privacidad y las obligaciones legales aplicables.",
        "La obligación de confidencialidad continuará después de terminada la relación contractual, salvo cuando la información deba ser revelada por disposición legal o requerimiento de autoridad competente.",
      ],
      bullets: [
        "Información de empleados",
        "Expedientes laborales",
        "Información salarial",
        "Organigramas",
        "Información financiera",
        "Procesos internos",
        "Información comercial",
        "Procedimientos",
        "Diagnósticos",
        "Información de seguridad",
        "Información relacionada con accidentes o riesgos",
        "Información estratégica",
        "Documentación proporcionada por el cliente",
      ],
    },
    {
      title: "17. Política de propiedad intelectual",
      paragraphs: [
        "Los materiales, metodologías, formatos, presentaciones, manuales, evaluaciones, diseños, procedimientos, contenidos, herramientas, plantillas y demás materiales desarrollados previamente o de manera independiente por GESTIONA CAPITAL HUMANO seguirán siendo propiedad de ésta, salvo pacto escrito en contrario.",
        "La contratación de un servicio no implica la transferencia automática de los derechos de propiedad intelectual sobre dichos materiales.",
        "Salvo autorización expresa, el cliente no podrá:",
        "El cliente podrá utilizar los materiales entregados para los fines internos relacionados con el servicio contratado, salvo que se haya establecido una condición diferente por escrito.",
      ],
      bullets: [
        "Revender los materiales",
        "Comercializarlos",
        "Distribuirlos a terceros",
        "Reproducirlos con fines comerciales",
        "Modificarlos para crear productos derivados",
        "Publicarlos",
        "Utilizarlos para prestar servicios a terceros",
      ],
    },
    {
      title: "18. Política de uso de materiales de capacitación",
      paragraphs: [
        "Los materiales entregados durante cursos y capacitaciones están destinados al uso de los participantes y/o del cliente conforme al servicio contratado.",
        "Salvo autorización expresa, queda prohibida la reproducción, distribución, comercialización o publicación de los materiales.",
        "Las capacitaciones podrán incluir materiales sujetos a derechos de autor de GESTIONA CAPITAL HUMANO o de terceros.",
        "El cliente deberá respetar los derechos de propiedad intelectual correspondientes.",
      ],
    },
    {
      title: "19. Política de fotografía, video y grabaciones",
      paragraphs: [
        "Cuando durante cursos, capacitaciones, eventos o actividades se realicen fotografías, videos, grabaciones de audio u otros registros audiovisuales, su utilización estará sujeta al Aviso de Privacidad y, cuando corresponda, al consentimiento del titular.",
        "El uso de material audiovisual para fines publicitarios, institucionales o promocionales deberá realizarse de conformidad con las autorizaciones y condiciones aplicables.",
        "Cuando una persona no autorice el uso de su imagen, voz o material audiovisual para finalidades que requieran consentimiento, GESTIONA CAPITAL HUMANO respetará dicha negativa conforme a la legislación aplicable.",
      ],
    },
    {
      title: "20. Política de seguridad de la información",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO implementará medidas administrativas, técnicas y físicas razonables para proteger la información que se encuentre bajo su responsabilidad.",
        "El acceso a información confidencial y datos personales estará limitado a las personas que requieran acceder a ellos para cumplir con sus funciones.",
        "GESTIONA CAPITAL HUMANO podrá utilizar herramientas digitales, plataformas de almacenamiento, correo electrónico y otros sistemas tecnológicos necesarios para prestar los servicios.",
        "Los usuarios y colaboradores deberán evitar compartir contraseñas, documentos confidenciales o información sensible mediante medios no autorizados.",
        "Cualquier incidente de seguridad que pueda comprometer información deberá ser reportado internamente para su evaluación y atención.",
      ],
    },
    {
      title: "21. Política de conservación de información y expedientes",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO conservará la información y documentación durante el tiempo necesario para cumplir con las finalidades para las cuales fue obtenida y, cuando corresponda, durante los periodos requeridos por obligaciones contractuales, administrativas, contables, fiscales, legales o para atender posibles reclamaciones.",
        "La información relacionada con servicios contratados podrá conservarse durante la vigencia de la relación contractual y posteriormente durante el periodo que resulte necesario conforme a las obligaciones aplicables.",
        "Los documentos sujetos a obligaciones fiscales, contables o legales serán conservados durante los plazos establecidos por la legislación correspondiente.",
        "Una vez que la información haya dejado de ser necesaria y no exista obligación legal o causa legítima para conservarla, GESTIONA CAPITAL HUMANO podrá proceder a su eliminación, supresión, bloqueo o anonimización, según corresponda.",
        "El tratamiento y conservación de datos personales se realizará adicionalmente conforme al Aviso de Privacidad de GESTIONA CAPITAL HUMANO.",
      ],
    },
    {
      title: "22. Política de conflictos de interés",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO procurará identificar y prevenir situaciones que puedan afectar la objetividad, independencia o calidad de sus servicios.",
        "Cuando exista un conflicto de interés real o potencial que pueda afectar de manera significativa la prestación del servicio, GESTIONA CAPITAL HUMANO podrá comunicarlo al cliente y establecer las medidas correspondientes.",
      ],
    },
    {
      title: "23. Código de ética y conducta",
      paragraphs: [
        "GESTIONA desarrollará sus actividades bajo principios de:",
        "GESTIONA CAPITAL HUMANO no ofrecerá ni solicitará pagos indebidos, dádivas o beneficios destinados a obtener ventajas ilícitas frente a clientes, proveedores, participantes o autoridades.",
      ],
      bullets: [
        "Compromiso",
        "Excelencia",
        "Cercania",
        "Integridad",
        "Honestidad",
        "Profesionalismo",
        "Confidencialidad",
        "Respeto",
        "Responsabilidad",
        "Transparencia",
        "Igualdad",
        "No discriminación",
        "Cumplimiento de la legislación aplicable",
      ],
    },
    {
      title: "24. Política de igualdad y no discriminación",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO promoverá un ambiente basado en el respeto, igualdad de oportunidades y trato digno.",
        "No se tolerarán conductas discriminatorias por motivos de origen étnico, género, edad, discapacidad, condición social, salud, religión, opiniones, preferencias sexuales, estado civil o cualquier otra condición protegida por la legislación aplicable.",
        "Los servicios de capacitación y asesoría serán prestados procurando condiciones de respeto e inclusión.",
      ],
    },
    {
      title: "25. Política de quejas y reclamaciones",
      paragraphs: [
        "Los clientes podrán presentar quejas, comentarios o reclamaciones relacionadas con nuestros servicios mediante:",
        "La reclamación deberá indicar, en la medida de lo posible:",
        "GESTIONA CAPITAL HUMANO analizará la reclamación y proporcionará respuesta dentro de un plazo razonable, dependiendo de la naturaleza y complejidad del asunto.",
        "Cuando corresponda, podrán proponerse acciones correctivas, aclaraciones, reposiciones o soluciones relacionadas con el servicio contratado.",
      ],
      bullets: [
        "Correo electrónico: hola@gestionach.com",
        "Teléfono: 6221792472",
        "Domicilio: Guaymas, Sonora",
        "Nombre del cliente",
        "Servicio contratado",
        "Fecha del servicio",
        "Descripción de la situación",
        "Evidencia relacionada, cuando exista",
        "Medio de contacto para recibir respuesta",
      ],
    },
    {
      title: "26. Integridad de la información proporcionada por el cliente",
      paragraphs: [
        "El cliente garantiza que la información proporcionada a GESTIONA CAPITAL HUMANO para la prestación de los servicios es verdadera, completa y obtenida de manera legítima.",
        "GESTIONA CAPITAL HUMANO podrá basar sus diagnósticos, recomendaciones, documentos, evaluaciones y entregables en dicha información.",
        "Si posteriormente se determina que la información proporcionada era incorrecta, incompleta o falsa, GESTIONA CAPITAL HUMANO podrá modificar sus conclusiones o recomendaciones y no será responsable por las consecuencias derivadas de dicha información.",
      ],
    },
    {
      title: "27. Modificaciones a las políticas",
      paragraphs: [
        "GESTIONA CAPITAL HUMANO podrá modificar o actualizar las presentes políticas cuando resulte necesario por cambios en sus servicios, procedimientos internos, legislación aplicable o cualquier otra circunstancia.",
        "La versión vigente estará disponible a través de los medios oficiales de GESTIONA CAPITAL HUMANO",
        "Sitio web: www.gestionach.com",
      ],
    },
    {
      title: "28. Aceptación de las políticas",
      paragraphs: [
        "La contratación de servicios, aceptación de una propuesta, cotización, orden de servicio, contrato, pago, confirmación electrónica o aceptación mediante medios digitales podrá constituir manifestación de conocimiento y aceptación de las presentes políticas, según corresponda.",
        "Cuando sea necesario obtener un consentimiento específico, éste será solicitado de manera independiente.",
        "El cliente manifiesta que ha tenido acceso a las presentes políticas y que conoce las condiciones aplicables a los servicios contratados.",
      ],
    },
  ],
};
