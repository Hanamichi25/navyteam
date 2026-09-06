import { RESPONSABLE } from './responsable';

/**
 * Política de Tratamiento de Datos Personales — NavyTeam.
 *
 * Estructura basada en la Ley 1581 de 2012 y el Decreto 1074 de 2015 (Colombia).
 *
 * ⚠️ BORRADOR. Debe revisarlo un abogado antes de publicar en producción, y
 * hay que rellenar `responsable.ts` con los datos reales del Responsable.
 *
 * Al cambiar el contenido de forma material, subir `PRIVACY_POLICY_VERSION`:
 * los usuarios volverán a ver el gate de aceptación en su próximo ingreso.
 */
export const PRIVACY_POLICY_VERSION = '2026-09';

export interface PolicySection {
  heading: string;
  paragraphs: string[];
}

export const PRIVACY_POLICY_TITLE = 'Política de Tratamiento de Datos Personales';
export const PRIVACY_POLICY_UPDATED = 'Septiembre de 2026';

export const PRIVACY_POLICY: PolicySection[] = [
  {
    heading: '1. Responsable del Tratamiento',
    paragraphs: [
      `${RESPONSABLE.nombre} (${RESPONSABLE.idFiscal}), con domicilio en ${RESPONSABLE.direccion}, ${RESPONSABLE.ciudad}, es el Responsable del Tratamiento de los datos personales recolectados a través de la aplicación NavyTeam.`,
      `Contacto para asuntos de protección de datos: ${RESPONSABLE.email} · ${RESPONSABLE.telefono}.`,
    ],
  },
  {
    heading: '2. Definiciones',
    paragraphs: [
      'Titular: persona natural cuyos datos personales son objeto de Tratamiento (el cliente o el entrenador).',
      'Dato personal: cualquier información vinculada o que pueda asociarse a una persona natural determinada o determinable.',
      'Dato sensible: aquel que afecta la intimidad del Titular o cuyo uso indebido puede generar discriminación, como los datos relacionados con la salud. Las medidas corporales, el peso y los objetivos físicos se tratan como datos sensibles.',
      'Tratamiento: cualquier operación sobre datos personales, como la recolección, almacenamiento, uso, circulación o supresión.',
      'Encargado del Tratamiento: quien realiza el Tratamiento por cuenta del Responsable (el proveedor de infraestructura).',
      'Autorización: consentimiento previo, expreso e informado del Titular para llevar a cabo el Tratamiento.',
    ],
  },
  {
    heading: '3. Finalidad del Tratamiento',
    paragraphs: [
      'Los datos se tratan únicamente para prestar y gestionar el servicio de entrenamiento personal, en particular para:',
      '• Identificar al Titular y gestionar su cuenta de acceso.',
      '• Diseñar, asignar y hacer seguimiento de rutinas de entrenamiento y planes de alimentación.',
      '• Registrar y analizar el progreso físico (mediciones, cargas, adherencia).',
      '• Permitir la comunicación entre el cliente y su entrenador.',
      '• Gestionar el cobro y la vigencia de la suscripción.',
    ],
  },
  {
    heading: '4. Datos que se recolectan',
    paragraphs: [
      'Datos de identificación y contacto: nombre, correo electrónico, teléfono, fecha de nacimiento.',
      'Datos sensibles de salud y estado físico: peso, medidas corporales (cintura, pecho, cadera, brazo), objetivo de entrenamiento.',
      'Datos de la actividad en la app: rutinas y planes asignados, sesiones de entrenamiento registradas (series, repeticiones, cargas), mensajes intercambiados con el entrenador.',
      'Datos de la suscripción: cuota, pagos registrados y fecha de vigencia.',
      'No se recolectan datos de menores de edad. No se recolecta información de ubicación, contactos del dispositivo ni datos biométricos de autenticación.',
    ],
  },
  {
    heading: '5. Autorización del Titular',
    paragraphs: [
      'Al aceptar esta política dentro de la aplicación, el Titular autoriza de forma previa, expresa e informada el Tratamiento de sus datos personales —incluidos los datos sensibles descritos— para las finalidades del numeral 3.',
      'El suministro de datos sensibles es facultativo; sin ellos, el servicio de seguimiento físico no puede prestarse adecuadamente.',
      'La autorización puede revocarse en cualquier momento, sin efecto retroactivo, solicitándolo por los canales del numeral 8.',
    ],
  },
  {
    heading: '6. Derechos del Titular',
    paragraphs: [
      'Conforme al artículo 8 de la Ley 1581 de 2012, el Titular tiene derecho a:',
      '• Conocer, actualizar y rectificar sus datos personales.',
      '• Solicitar prueba de la autorización otorgada.',
      '• Ser informado sobre el uso que se ha dado a sus datos.',
      '• Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.',
      '• Revocar la autorización y/o solicitar la supresión de sus datos cuando no exista un deber legal o contractual de conservarlos.',
      '• Acceder de forma gratuita a sus datos personales que hayan sido objeto de Tratamiento.',
    ],
  },
  {
    heading: '7. Deberes del Responsable',
    paragraphs: [
      'El Responsable garantiza el ejercicio pleno de los derechos del Titular, conserva la información bajo condiciones de seguridad, tramita las consultas y reclamos en los términos legales, y utiliza los datos únicamente para las finalidades autorizadas.',
    ],
  },
  {
    heading: '8. Consultas y reclamos',
    paragraphs: [
      `El Titular puede ejercer sus derechos escribiendo a ${RESPONSABLE.email}, indicando su nombre y la solicitud concreta.`,
      'Consultas: se atienden en un término máximo de diez (10) días hábiles. Reclamos: se atienden en un término máximo de quince (15) días hábiles, prorrogables por ocho (8) días hábiles más.',
      'El cliente también puede pedir a su entrenador la actualización o eliminación de sus datos directamente desde la relación de servicio.',
    ],
  },
  {
    heading: '9. Encargado y transferencia de datos',
    paragraphs: [
      'La aplicación se apoya en Supabase Inc. como Encargado del Tratamiento para el alojamiento de la base de datos y la autenticación. Supabase trata los datos siguiendo las instrucciones del Responsable y sus propias medidas de seguridad.',
      'NavyTeam NO vende, cede ni comparte los datos personales de los Titulares con terceros para fines de marketing ni de ningún otro tipo ajeno a la prestación del servicio.',
    ],
  },
  {
    heading: '10. Seguridad',
    paragraphs: [
      'El acceso a los datos está restringido por autenticación y por reglas de autorización a nivel de base de datos: cada cliente solo accede a su propia información y cada entrenador solo a la de sus clientes. Las comunicaciones con el servidor viajan cifradas (HTTPS).',
    ],
  },
  {
    heading: '11. Conservación y supresión',
    paragraphs: [
      'Los datos se conservan mientras exista la relación de servicio entre el cliente y su entrenador.',
      'Cuando el entrenador elimina a un cliente, o cuando el Titular solicita la supresión, se borran de forma permanente todos sus datos: cuenta de acceso, mediciones, rutinas asignadas, registros de entrenamiento, mensajes y pagos.',
    ],
  },
  {
    heading: '12. Vigencia',
    paragraphs: [
      `Esta política rige a partir de ${PRIVACY_POLICY_UPDATED}. Cualquier cambio material será informado dentro de la aplicación y requerirá una nueva aceptación para seguir usando el servicio.`,
    ],
  },
];
