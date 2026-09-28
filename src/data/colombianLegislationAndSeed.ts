import {
  AjusteRazonableItem,
  CategoriaSimatCatalogItem,
  CursoAnioCatalogItem,
  NeedCategory,
  PlantillaPIAR,
  RoleProfile,
  StudentPIAR,
  UserRole,
  UsuarioPerfilCatalogItem,
} from '../types/piar';

export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  administrador: {
    id: 'administrador',
    title: 'Administrador Institucional',
    subtitle: 'Rectoría y Coordinación Académica — Auditoría MEN / SIMAT',
    userName: 'Mg. Esteban Bolaños Rodríguez',
    badgeColor: 'bg-teal-800 text-white',
    canEditClinicalDiagnosis: true,
    canSignAuditReport: true,
    canManageSheetsConfig: true,
    canEditSubjectAdaptations: true,
    canEditPeriodTracking: true,
  },
  psicologa: {
    id: 'psicologa',
    title: 'Profesional Psicóloga / Orientación',
    subtitle: 'Psicorientación Escolar y Apoyo Pedagógico (Decreto 1421)',
    userName: 'Dra. Valentina Morales Pineda (T.P. 148920-COL)',
    badgeColor: 'bg-indigo-700 text-white',
    canEditClinicalDiagnosis: true,
    canSignAuditReport: true,
    canManageSheetsConfig: false,
    canEditSubjectAdaptations: true,
    canEditPeriodTracking: true,
  },
  profesor: {
    id: 'profesor',
    title: 'Profesor de Aula / Área',
    subtitle: 'Diseño DUA, Adecuaciones por Asignatura y Seguimiento por Periodo',
    userName: 'Lic. Carlos Andrés Restrepo (Matemáticas y Ciencias)',
    badgeColor: 'bg-amber-700 text-white',
    canEditClinicalDiagnosis: false,
    canSignAuditReport: false,
    canManageSheetsConfig: false,
    canEditSubjectAdaptations: true,
    canEditPeriodTracking: true,
  },
};

export const TABLA_USUARIOS_PERFILES_INICIAL: UsuarioPerfilCatalogItem[] = [
  {
    id: 'usr-01',
    correoInstitucional: 'mebolanos@cem.edu.co',
    username: 'mebolanos',
    nombresApellidos: 'Mg. Esteban Bolaños Rodríguez',
    rol: 'administrador',
    cargoArea: 'Rectoría y Coordinación Académica — Administrador General SIEDES / SIMAT',
    tarjetaProfesional: 'DIR-MEN-2026-CEM',
    claveAcceso: 'Ekiraya2026*',
    cursosAsignados: 'Todos los grados (Transición a 11° Media Académica)',
    permisosResumen:
      'Acceso total: Diagnóstico clínico Ley 1581, Firma Auditoría PDF, Configuración Google Sheets, Tablas Maestras y Usuarios',
    activo: true,
    ultimoAcceso: '2026-09-28',
  },
  {
    id: 'usr-02',
    correoInstitucional: 'psicorientacion@cem.edu.co',
    username: 'vmorales',
    nombresApellidos: 'Dra. Valentina Morales Pineda',
    rol: 'psicologa',
    cargoArea: 'Psicóloga Orientadora Escolar — Líder de Inclusión y Equidad (Decreto 1421)',
    tarjetaProfesional: 'T.P. 148920 COLPSIC',
    claveAcceso: 'Psico2026*',
    cursosAsignados: 'Todos los grados (Preescolar, Primaria, Secundaria y Media)',
    permisosResumen:
      'Valoración y Diagnóstico Clínico (AES-256), Firma Profesional PDF Oficial, Adecuaciones DUA y Seguimiento Periodos I-IV',
    activo: true,
    ultimoAcceso: '2026-09-28',
  },
  {
    id: 'usr-03',
    correoInstitucional: 'crestrepo@cem.edu.co',
    username: 'crestrepo',
    nombresApellidos: 'Lic. Carlos Andrés Restrepo',
    rol: 'profesor',
    cargoArea: 'Docente Titular Matemáticas, Física y Pensamiento Lógico',
    tarjetaProfesional: 'Escalafón 2AE — MEN',
    claveAcceso: 'Profe2026*',
    cursosAsignados: '7°B Bachillerato, 8°A Bachillerato, 10°A Media Académica',
    permisosResumen:
      'Diseño de Adecuaciones por Asignatura (Anexo 2), Banco DUA y Seguimiento por Periodos (Diagnóstico clínico protegido)',
    activo: true,
    ultimoAcceso: '2026-09-28',
  },
  {
    id: 'usr-04',
    correoInstitucional: 'lgaviria@cem.edu.co',
    username: 'lgaviria',
    nombresApellidos: 'Esp. Laura Sofía Gaviria',
    rol: 'profesor',
    cargoArea: 'Docente Lengua Castellana, Literatura y Comprensión Lectora',
    tarjetaProfesional: 'Escalafón 3AM — MEN',
    claveAcceso: 'Profe2026*',
    cursosAsignados: '3°A Primaria, 6°A Bachillerato',
    permisosResumen:
      'Diseño de Adecuaciones por Asignatura (Anexo 2), Banco DUA y Seguimiento por Periodos (Diagnóstico clínico protegido)',
    activo: true,
    ultimoAcceso: '2026-09-27',
  },
  {
    id: 'usr-05',
    correoInstitucional: 'dquintero@cem.edu.co',
    username: 'dquintero',
    nombresApellidos: 'Mg. Diana Marcela Quintero',
    rol: 'profesor',
    cargoArea: 'Docente Ciencias Naturales, Biología y Educación Ambiental',
    tarjetaProfesional: 'Escalafón 3BM — MEN',
    claveAcceso: 'Profe2026*',
    cursosAsignados: '8°A Bachillerato, 9°B Bachillerato',
    permisosResumen:
      'Diseño de Adecuaciones por Asignatura (Anexo 2), Banco DUA y Seguimiento por Periodos (Diagnóstico clínico protegido)',
    activo: true,
    ultimoAcceso: '2026-09-26',
  },
  {
    id: 'usr-06',
    correoInstitucional: 'crojas@cem.edu.co',
    username: 'crojas',
    nombresApellidos: 'Lic. Claudia Patricia Rojas',
    rol: 'profesor',
    cargoArea: 'Directora de Grupo Transición — Guía Montessori Primera Infancia',
    tarjetaProfesional: 'Escalafón 2A — MEN',
    claveAcceso: 'Profe2026*',
    cursosAsignados: 'Transición, 1° Primaria',
    permisosResumen:
      'Diseño de Adecuaciones DUA Preescolar, Observación Pedagógica y Seguimiento por Periodos',
    activo: true,
    ultimoAcceso: '2026-09-25',
  },
];

export const ASIGNATURAS_COLOMBIA: string[] = [
  'Matemáticas',
  'Lengua Castellana y Literatura',
  'Ciencias Naturales y Educación Ambiental',
  'Ciencias Sociales, Historia y Geografía',
  'Inglés (Lengua Extranjera)',
  'Tecnología e Informática',
  'Educación Artística y Cultural',
  'Educación Física, Recreación y Deporte',
  'Ética y Valores Humanos',
  'Filosofía y Pensamiento Crítico',
  'Física',
  'Química',
];

export const CURSOS_COLOMBIA: string[] = [
  'Transición',
  '1° Primaria',
  '2° Primaria',
  '3°A Primaria',
  '4°B Primaria',
  '5°A Primaria',
  '6°A Bachillerato',
  '7°B Bachillerato',
  '8°A Bachillerato',
  '9°B Bachillerato',
  '10°A Media Académica',
  '11°A Media Académica',
];

export const CATEGORIAS_SIMAT: NeedCategory[] = [
  'TEA (Trastorno del Espectro Autista)',
  'TDAH (Déficit de Atención e Hiperactividad)',
  'Trastorno Específico del Aprendizaje (Lectoescritura / Dislexia)',
  'Trastorno Específico del Aprendizaje (Cálculo / Discalculia)',
  'Discapacidad Intelectual / Cognitiva',
  'Discapacidad Sensorial Visual',
  'Discapacidad Sensorial Auditiva',
  'Discapacidad Física / Motora',
  'Desempeño Superior — Capacidad Excepcional Global',
  'Desempeño Superior — Talento Excepcional en Ciencias y Tecnología',
  'Desempeño Superior — Talento Excepcional en Artes y Humanidades',
  'Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)',
  'Apoyo Pedagógico Transitorio / DUA Preventivo',
];

export const ANIOS_LECTIVOS_COLOMBIA: string[] = [
  '2026-2027',
  '2026',
  '2025-2026',
  '2025',
  '2024-2025',
  '2024',
  '2027-2028',
  '2027',
];

export const TABLA_CURSOS_ANIOS_INICIAL: CursoAnioCatalogItem[] = [
  {
    id: 'ca-01',
    codigoCurso: 'CUR-TRANS-00',
    curso: 'Transición',
    nivelEducativo: 'Preescolar',
    anioLectivo: '2026-2027',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Lic. Claudia Patricia Rojas',
  },
  {
    id: 'ca-02',
    codigoCurso: 'CUR-PRI-01',
    curso: '1° Primaria',
    nivelEducativo: 'Básica Primaria',
    anioLectivo: '2026-2027',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Lic. Martha Lucía Benavides',
  },
  {
    id: 'ca-03',
    codigoCurso: 'CUR-PRI-02',
    curso: '2° Primaria',
    nivelEducativo: 'Básica Primaria',
    anioLectivo: '2026-2027',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Lic. Natalia Andrea Gómez',
  },
  {
    id: 'ca-04',
    codigoCurso: 'CUR-PRI-03A',
    curso: '3°A Primaria',
    nivelEducativo: 'Básica Primaria',
    anioLectivo: '2026',
    calendarioEscolar: 'Calendario A (Feb-Nov)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Esp. Laura Sofía Gaviria',
  },
  {
    id: 'ca-05',
    codigoCurso: 'CUR-PRI-04B',
    curso: '4°B Primaria',
    nivelEducativo: 'Básica Primaria',
    anioLectivo: '2026-2027',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Lic. Jorge Eliécer Monsalve',
  },
  {
    id: 'ca-06',
    codigoCurso: 'CUR-PRI-05A',
    curso: '5°A Primaria',
    nivelEducativo: 'Básica Primaria',
    anioLectivo: '2025-2026',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Histórico Cerrado',
    directorGrupo: 'Lic. Adriana María Soto',
  },
  {
    id: 'ca-07',
    codigoCurso: 'CUR-SEC-06A',
    curso: '6°A Bachillerato',
    nivelEducativo: 'Básica Secundaria',
    anioLectivo: '2026',
    calendarioEscolar: 'Calendario A (Feb-Nov)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Esp. Laura Sofía Gaviria',
  },
  {
    id: 'ca-08',
    codigoCurso: 'CUR-SEC-07B',
    curso: '7°B Bachillerato',
    nivelEducativo: 'Básica Secundaria',
    anioLectivo: '2026',
    calendarioEscolar: 'Calendario A (Feb-Nov)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Lic. Carlos Andrés Restrepo',
  },
  {
    id: 'ca-09',
    codigoCurso: 'CUR-SEC-08A',
    curso: '8°A Bachillerato',
    nivelEducativo: 'Básica Secundaria',
    anioLectivo: '2026-2027',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Mg. Diana Marcela Quintero',
  },
  {
    id: 'ca-10',
    codigoCurso: 'CUR-SEC-09B',
    curso: '9°B Bachillerato',
    nivelEducativo: 'Básica Secundaria',
    anioLectivo: '2026-2027',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Ing. Camilo Andrés Pardo',
  },
  {
    id: 'ca-11',
    codigoCurso: 'CUR-MED-10A',
    curso: '10°A Media Académica',
    nivelEducativo: 'Media Académica',
    anioLectivo: '2026',
    calendarioEscolar: 'Calendario A (Feb-Nov)',
    estadoAnio: 'Año Lectivo Activo',
    directorGrupo: 'Lic. Carlos Andrés Restrepo',
  },
  {
    id: 'ca-12',
    codigoCurso: 'CUR-MED-11A',
    curso: '11°A Media Académica',
    nivelEducativo: 'Media Académica',
    anioLectivo: '2027-2028',
    calendarioEscolar: 'Calendario B (Sep-Jun)',
    estadoAnio: 'Proyección Matrícula',
    directorGrupo: 'Mg. Esteban Bolaños Rodríguez',
  },
];

export const TABLA_CATEGORIAS_SIMAT_INICIAL: CategoriaSimatCatalogItem[] = [
  {
    id: 'simat-01',
    codigoSimatMen: 'SIMAT-NEE-01',
    categoriaSimat: 'TEA (Trastorno del Espectro Autista)',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio II: Múltiples formas de Representación',
    requisitoSoporteAuditor: 'Diagnóstico clínico CIE-11 / DSM-5 + Anexo 1, 2 y 3 PIAR firmado.',
  },
  {
    id: 'simat-02',
    codigoSimatMen: 'SIMAT-NEE-02',
    categoriaSimat: 'TDAH (Déficit de Atención e Hiperactividad)',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio I: Múltiples formas de Implicación y Motivación',
    requisitoSoporteAuditor: 'Concepto neuropsicológico + Segmentación ejecutiva en Anexo 2.',
  },
  {
    id: 'simat-03',
    codigoSimatMen: 'SIMAT-APR-03',
    categoriaSimat: 'Trastorno Específico del Aprendizaje (Lectoescritura / Dislexia)',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Evaluación Diferenciada y Flexibilizada',
    requisitoSoporteAuditor: 'Valoración psicopedagógica / fonoaudiológica + Evaluación bimodal.',
  },
  {
    id: 'simat-04',
    codigoSimatMen: 'SIMAT-APR-04',
    categoriaSimat: 'Trastorno Específico del Aprendizaje (Cálculo / Discalculia)',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio II: Múltiples formas de Representación',
    requisitoSoporteAuditor: 'Valoración neuropsicológica + Apoyos concretos / Tabla Pitagórica.',
  },
  {
    id: 'simat-05',
    codigoSimatMen: 'SIMAT-DIS-05',
    categoriaSimat: 'Discapacidad Intelectual / Cognitiva',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio II: Múltiples formas de Representación',
    requisitoSoporteAuditor: 'Certificado de discapacidad (Res. 113/2020) o historia clínica + PIAR.',
  },
  {
    id: 'simat-06',
    codigoSimatMen: 'SIMAT-VIS-06',
    categoriaSimat: 'Discapacidad Sensorial Visual',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio II: Múltiples formas de Representación',
    requisitoSoporteAuditor: 'Lineamientos INCI + Macrotipos / Lector de pantalla en Anexo 2.',
  },
  {
    id: 'simat-07',
    codigoSimatMen: 'SIMAT-AUD-07',
    categoriaSimat: 'Discapacidad Sensorial Auditiva',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio II: Múltiples formas de Representación',
    requisitoSoporteAuditor: 'Lineamientos INSOR + Subtitulado / LSC / Apoyo visual en aula.',
  },
  {
    id: 'simat-08',
    codigoSimatMen: 'SIMAT-MOT-08',
    categoriaSimat: 'Discapacidad Física / Motora',
    tipoRuta: 'PIAR — Ajuste Razonable (Decreto 1421/2017)',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio III: Múltiples formas de Acción y Expresión',
    requisitoSoporteAuditor: 'Accesibilidad física, tecnologías de asistencia y flexibilización motriz.',
  },
  {
    id: 'simat-09',
    codigoSimatMen: 'SIMAT-EXC-09',
    categoriaSimat: 'Desempeño Superior — Capacidad Excepcional Global',
    tipoRuta: 'Desempeño Superior / Talento Excepcional (MEN Doc. 19)',
    esDesempenoSuperior: true,
    principioDuaPrioritario: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
    requisitoSoporteAuditor: 'Portafolio de caracterización + Plan de Enriquecimiento / Compactación.',
  },
  {
    id: 'simat-10',
    codigoSimatMen: 'SIMAT-EXC-10',
    categoriaSimat: 'Desempeño Superior — Talento Excepcional en Ciencias y Tecnología',
    tipoRuta: 'Desempeño Superior / Talento Excepcional (MEN Doc. 19)',
    esDesempenoSuperior: true,
    principioDuaPrioritario: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
    requisitoSoporteAuditor: 'Caracterización STEM MEN Doc. 19 + Mentoría o Proyecto Investigativo.',
  },
  {
    id: 'simat-11',
    codigoSimatMen: 'SIMAT-EXC-11',
    categoriaSimat: 'Desempeño Superior — Talento Excepcional en Artes y Humanidades',
    tipoRuta: 'Desempeño Superior / Talento Excepcional (MEN Doc. 19)',
    esDesempenoSuperior: true,
    principioDuaPrioritario: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
    requisitoSoporteAuditor: 'Portafolio de creación artística/literaria + Aceleración horizontal.',
  },
  {
    id: 'simat-12',
    codigoSimatMen: 'SIMAT-2EX-12',
    categoriaSimat: 'Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)',
    tipoRuta: 'Doble Excepcionalidad (Talento + Ajuste Razonable)',
    esDesempenoSuperior: true,
    principioDuaPrioritario: 'Principio III: Múltiples formas de Acción y Expresión',
    requisitoSoporteAuditor: 'Articulación dual: Ajuste razonable para la barrera + Reto de talento.',
  },
  {
    id: 'simat-13',
    codigoSimatMen: 'SIMAT-DUA-13',
    categoriaSimat: 'Apoyo Pedagógico Transitorio / DUA Preventivo',
    tipoRuta: 'DUA Preventivo / Apoyo Pedagógico',
    esDesempenoSuperior: false,
    principioDuaPrioritario: 'Principio I: Múltiples formas de Implicación y Motivación',
    requisitoSoporteAuditor: 'Seguimiento preventivo de Psicorientación y flexibilización en aula.',
  },
];

export const PLANTILLAS_PIAR: PlantillaPIAR[] = [
  {
    id: 'tpl-1421-neuro',
    nombre: 'PIAR Estándar Decreto 1421 — Neurodesarrollo (TEA / TDAH)',
    normativaReferencia: 'Decreto 1421 de 2017 (Anexos 1, 2 y 3 MEN) + Ley 1618 de 2013',
    descripcionPlantilla:
      'Plantilla estructurada para estudiantes con diagnóstico de TEA o TDAH. Incluye anticipación visual, segmentación ejecutiva, tiempos extendidos y regulación sensorial bajo enfoque DUA.',
    esDesempenoSuperior: false,
    categoriaSugerida: 'TEA (Trastorno del Espectro Autista)',
    diagnosticoGuia:
      'Valoración neuropsicológica clínica (CIE-11 / DSM-5) que reporta condición del espectro autista nivel 1 / TDAH con requerimiento de apoyos en funciones ejecutivas, flexibilidad cognitiva y procesamiento sensorial en aula.',
    descripcionGuia:
      'Estudiante con alta memoria visual y pensamiento lógico-sistemático. Comprende mejor las instrucciones cuando se presentan de forma secuencial, concreta y apoyada en organizadores gráficos. Requiere anticipación ante cambios de rutina escolar.',
    barrerasGuia:
      'Sobrecarga auditiva en actividades grupales no estructuradas; instrucciones verbales extensas o ambiguas; evaluaciones escritas extensas sin pausas activas.',
    recomendacionesFamiliaGuia:
      'Mantener rutinas visuales sincronizadas entre casa y colegio; emplear agenda de anticipación semanal y reforzar logros mediante intereses particulares del estudiante.',
    adecuacionesIniciales: [
      {
        asignatura: 'Matemáticas',
        indicador:
          'Resuelve problemas aditivos y multiplicativos de varias etapas utilizando diferentes estrategias de cálculo mental y escrito.',
        indicadorAjustado:
          'Resuelve problemas matemáticos de hasta dos etapas empleando material concreto, plantillas paso a paso y representación visual de datos.',
        ajusteProceso:
          'Dividir la guía en bloques de máximo 3 ejercicios por página; suministrar lista de chequeo visual de pasos (Leer - Subrayar datos - Operar - Verificar); permitir 25% de tiempo adicional en pruebas.',
        nombreDocente: 'Lic. Carlos Andrés Restrepo',
        principioDua: 'Principio II: Múltiples formas de Representación',
        barreraIdentificada: 'Saturación de memoria de trabajo ante enunciados largos.',
      },
      {
        asignatura: 'Lengua Castellana y Literatura',
        indicador:
          'Comprende textos narrativos y expositivos identificando intenciones comunicativas, sentido figurado e inferencias globales.',
        indicadorAjustado:
          'Identifica ideas principales, secuencias de eventos y relaciones causa-efecto en textos narrativos y expositivos con apoyo de mapas de historia y claves explícitas.',
        ajusteProceso:
          'Acompañar metáforas o lenguaje figurado con glosario explícito; permitir entrega de producciones mediante organizadores gráficos, infografías o sustentación oral guiada.',
        nombreDocente: 'Esp. Laura Sofía Gaviria',
        principioDua: 'Principio III: Múltiples formas de Acción y Expresión',
        barreraIdentificada: 'Literalidad en la interpretación de modismos y textos extensos.',
      },
    ],
  },
  {
    id: 'tpl-men-superior',
    nombre: 'Plan de Enriquecimiento — Desempeño Superior y Talentos Excepcionales',
    normativaReferencia:
      'Orientaciones Técnicas MEN (Doc. No. 19) + Decreto 1421 de 2017 + Decreto 1290 de 2009',
    descripcionPlantilla:
      'Diseñada para estudiantes con Capacidades o Talentos Excepcionales (SIMAT). Implementa compactación curricular, proyectos de investigación autónoma, retos de complejidad superior y mentoría académica.',
    esDesempenoSuperior: true,
    categoriaSugerida: 'Desempeño Superior — Talento Excepcional en Ciencias y Tecnología',
    diagnosticoGuia:
      'Caracterización psicopedagógica institucional y portafolio de evidencias que acredita Desempeño Superior sostenido y Talento Excepcional en el área Científica-Tecnológica (Percentil >95 en razonamiento abstracto y creatividad resolutiva).',
    descripcionGuia:
      'Estudiante con velocidad de aprendizaje acelerada, pensamiento divergente, alta curiosidad epistémica y capacidad para conectar conceptos interdisciplinarios de grados superiores.',
    barrerasGuia:
      'Desmotivación o aburrimiento por repetición mecánica de contenidos ya dominados; falta de retos de pensamiento crítico e investigativo en el currículo estándar.',
    recomendacionesFamiliaGuia:
      'Vincular a semilleros de investigación, olimpiadas académicas o clubes STEM sin descuidar el equilibrio socioemocional y la tolerancia a la frustración.',
    adecuacionesIniciales: [
      {
        asignatura: 'Matemáticas',
        indicador:
          'Modela situaciones de variación lineal utilizando expresiones algebraicas y representaciones cartesianas.',
        indicadorAjustado:
          'Formula y valida modelos matemáticos de variación lineal y cuadrática aplicados a problemas reales de optimización y simulación computacional.',
        ajusteProceso:
          'Compactación curricular (eximir de ejercicios repetitivos una vez demostrado el dominio del 90% en pre-test) e introducir retos de Olimpiadas Colombianas de Matemáticas y modelado con código/GeoGebra.',
        nombreDocente: 'Lic. Carlos Andrés Restrepo',
        principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
        barreraIdentificada: 'Repetición de algoritmos básicos ya dominados.',
      },
      {
        asignatura: 'Ciencias Naturales y Educación Ambiental',
        indicador:
          'Explica las relaciones ecológicas y los flujos de materia y energía en los ecosistemas locales.',
        indicadorAjustado:
          'Diseña y ejecuta un proyecto de indagación científica cuantitativa sobre bioindicadores y sostenibilidad en el entorno local con rigor metodológico.',
        ajusteProceso:
          'Aprendizaje Basado en Proyectos (ABP) con rol de investigador líder; acceso a bibliografía de nivel preuniversitario y socialización en feria científica institucional.',
        nombreDocente: 'Mg. Diana Marcela Quintero',
        principioDua: 'Principio I: Múltiples formas de Implicación y Motivación',
        barreraIdentificada: 'Falta de profundidad experimental en guías convencionales.',
      },
    ],
  },
  {
    id: 'tpl-doble-excepcionalidad',
    nombre: 'Plantilla Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)',
    normativaReferencia: 'Lineamientos MEN Doble Excepcionalidad + Decreto 1421 de 2017',
    descripcionPlantilla:
      'Articula simultáneamente el potenciamiento del talento o capacidad superior del estudiante con los ajustes razonables requeridos para mitigar barreras asociadas a TEA, TDAH o Dislexia.',
    esDesempenoSuperior: true,
    categoriaSugerida: 'Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)',
    diagnosticoGuia:
      'Perfil de Doble Excepcionalidad: Altas capacidades intelectuales en razonamiento lógico-espacial coexistentes con TDAH / Disgrafía motora que impacta la velocidad de escritura manual.',
    descripcionGuia:
      'Estudiante con brillante capacidad analítica y argumentativa oral, pero cuya producción escrita manuscrita no refleja su nivel real de comprensión debido a fatiga grafomotora y dispersión atencional.',
    barrerasGuia:
      'Evaluaciones basadas exclusivamente en copia extensiva del tablero o escritura manual cronometrada; subestimación de su potencial por desorden en cuadernos.',
    recomendacionesFamiliaGuia:
      'Permitir el uso de herramientas digitales de producción textual y potenciar sus proyectos de diseño y ciencia en casa.',
    adecuacionesIniciales: [
      {
        asignatura: 'Tecnología e Informática',
        indicador:
          'Utiliza herramientas ofimáticas y algoritmos básicos para resolver problemas del entorno.',
        indicadorAjustado:
          'Desarrolla prototipos funcionales de programación y lidera la arquitectura lógica de proyectos tecnológicos de su grado.',
        ajusteProceso:
          'Asignar retos de programación avanzada y permitir que las entregas escritas de otras áreas se apoyen en procesadores de texto, mapas mentales digitales o sustentación oral.',
        nombreDocente: 'Ing. Camilo Andrés Pardo',
        principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
        barreraIdentificada: 'Exigencia de transcripción manual extensa.',
      },
    ],
  },
  {
    id: 'tpl-1421-aprendizaje',
    nombre: 'PIAR Decreto 1421 — Trastornos Específicos del Aprendizaje (Dislexia / Discalculia)',
    normativaReferencia: 'Decreto 1421 de 2017 + Diseño Universal para el Aprendizaje (DUA)',
    descripcionPlantilla:
      'Enfocada en accesibilidad tipográfica, conciencia fonológica, conversión texto-a-voz, evaluación oral complementaria y apoyos multisensoriales.',
    esDesempenoSuperior: false,
    categoriaSugerida: 'Trastorno Específico del Aprendizaje (Lectoescritura / Dislexia)',
    diagnosticoGuia:
      'Diagnóstico neuropsicológico de Trastorno Específico del Aprendizaje con dificultad en la lectura (precisión y fluidez lectora) y expresión escrita.',
    descripcionGuia:
      'Estudiante participativo, empático y con excelente comprensión auditiva y expresión oral. Presenta inversión silábica y fatiga visual ante textos densos con tipografías pequeñas.',
    barrerasGuia:
      'Textos impresos con fuente menor a 12pt, sin interlineado amplio; penalización califícatoria por ortografía literal en áreas no lingüísticas.',
    recomendacionesFamiliaGuia:
      'Lectura compartida en voz alta 15 minutos diarios sin presión punitiva; uso de audiolibros y juegos fonológicos.',
    adecuacionesIniciales: [
      {
        asignatura: 'Lengua Castellana y Literatura',
        indicador:
          'Lee con fluidez y produce textos argumentativos aplicando normas ortográficas y gramaticales.',
        indicadorAjustado:
          'Comprende textos mediante lectura asistida o bimodal (audio + texto) y estructura argumentos coherentes de forma oral o con corrector digital.',
        ajusteProceso:
          'Entregar lecturas en fuente sin serifa (Arial/Verdana 14pt, interlineado 1.5); no descontar puntaje por errores de disortografía en evaluaciones de comprensión; verificar lectura de enunciados.',
        nombreDocente: 'Esp. Laura Sofía Gaviria',
        principioDua: 'Principio II: Múltiples formas de Representación',
        barreraIdentificada: 'Barrera de decodificación grafema-fonema en textos densos.',
      },
    ],
  },
];

export const BANCO_AJUSTES_INICIAL: AjusteRazonableItem[] = [
  {
    id: 'aj-01',
    titulo: 'Segmentación Ejecutiva y Lista de Chequeo Visual Paso a Paso',
    categoriaNecesidad: 'TEA (Trastorno del Espectro Autista)',
    principioDua: 'Principio III: Múltiples formas de Acción y Expresión',
    asignaturaSugerida: 'Matemáticas',
    barreraQueMitiga: 'Bloqueo en funciones ejecutivas ante problemas matemáticos multietapa.',
    indicadorBaseEjemplo: 'Resuelve problemas de aplicación con ecuaciones e interpretación de datos.',
    indicadorAjustadoSugerido:
      'Resuelve problemas matemáticos estructurados siguiendo una ruta visual de 4 pasos con apoyo de organizador gráfico.',
    ajusteProcesoDetallado:
      '1. Fragmentar talleres largos en entregas parciales de 3 ejercicios. 2. Incluir recuadro visual: [Datos] -> [Operación] -> [Resultado]. 3. Anticipar el cambio de actividad 5 minutos antes.',
    fundamentoNormativo: 'Decreto 1421 de 2017 Art. 2.3.3.5.1.4 (Ajustes Razonables) / Pauta DUA 6',
  },
  {
    id: 'aj-02',
    titulo: 'Evaluación Bimodal (Sustentación Oral + Mapa Conceptual)',
    categoriaNecesidad: 'Trastorno Específico del Aprendizaje (Lectoescritura / Dislexia)',
    principioDua: 'Evaluación Diferenciada y Flexibilizada',
    asignaturaSugerida: 'Ciencias Sociales, Historia y Geografía',
    barreraQueMitiga: 'Barrera lectoescritora que impide demostrar el dominio conceptual en pruebas escritas.',
    indicadorBaseEjemplo: 'Analiza procesos históricos de Colombia mediante ensayos escritos.',
    indicadorAjustadoSugerido:
      'Explica procesos históricos de Colombia mediante mapas conceptuales visuales, líneas de tiempo ilustradas o sustentación oral estructurada.',
    ajusteProcesoDetallado:
      'Permitir que el estudiante grabe un podcast corto, exponga oralmente o construya una línea de tiempo gráfica en lugar de redactar ensayos extensos a mano. Leer en voz alta las preguntas del examen.',
    fundamentoNormativo: 'Decreto 1421 de 2017 + Decreto 1290 de 2009 (SIEE Inclusivo)',
  },
  {
    id: 'aj-03',
    titulo: 'Compactación Curricular y Reto de Investigación STEM (Mentorías)',
    categoriaNecesidad: 'Desempeño Superior — Talento Excepcional en Ciencias y Tecnología',
    principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
    asignaturaSugerida: 'Ciencias Naturales y Educación Ambiental',
    barreraQueMitiga: 'Desmotivación escolar por repetición de contenidos básicos ya dominados.',
    indicadorBaseEjemplo: 'Identifica las propiedades físicas y químicas de la materia en guías de clase.',
    indicadorAjustadoSugerido:
      'Diseña y documenta un experimento aplicado sobre propiedades fisicoquímicas de materiales, formulando hipótesis y análisis estadístico de datos.',
    ajusteProcesoDetallado:
      'Aplicar evaluación diagnóstica al inicio de la unidad; al superar el 90%, sustituir los talleres rutinarios por un Proyecto de Investigación Guiada con rúbrica de nivel avanzado y socialización ante pares.',
    fundamentoNormativo: 'Orientaciones Técnicas MEN Documento No. 19 (Talentos Excepcionales)',
  },
  {
    id: 'aj-04',
    titulo: 'Ubicación Estratégica, Pausas Kinestésicas y Tiempos Fraccionados',
    categoriaNecesidad: 'TDAH (Déficit de Atención e Hiperactividad)',
    principioDua: 'Principio I: Múltiples formas de Implicación y Motivación',
    asignaturaSugerida: 'Lengua Castellana y Literatura',
    barreraQueMitiga: 'Dispersión atencional por estímulos periféricos y fatiga en tareas sedentarias prolongadas.',
    indicadorBaseEjemplo: 'Participa en sesiones de lectura silenciosa y análisis gramatical de 60 minutos.',
    indicadorAjustadoSugerido:
      'Realiza lecturas comentadas en bloques de 15 minutos con metas cortas verificables y rol activo en el aula.',
    ajusteProcesoDetallado:
      'Ubicar cerca al docente y lejos de puertas/ventanas; asignar responsabilidades motoras positivas (entregar material, borrar tablero); dividir evaluaciones en dos sesiones de 25 minutos.',
    fundamentoNormativo: 'Decreto 1421 de 2017 / Pauta DUA 7 y 8 (Autorregulación)',
  },
  {
    id: 'aj-05',
    titulo: 'Apoyo Multisensorial, Ábaco / Regletas de Cuisenaire y Tabla Pitagórica',
    categoriaNecesidad: 'Trastorno Específico del Aprendizaje (Cálculo / Discalculia)',
    principioDua: 'Principio II: Múltiples formas de Representación',
    asignaturaSugerida: 'Matemáticas',
    barreraQueMitiga: 'Dificultad en el sentido numérico abstracto y memorización mecánica de tablas.',
    indicadorBaseEjemplo: 'Efectúa divisiones y multiplicaciones de varias cifras de memoria.',
    indicadorAjustadoSugerido:
      'Comprende y resuelve situaciones multiplicativas y de reparto utilizando Tabla Pitagórica de consulta, regletas o calculadora básica para verificar procesos.',
    ajusteProcesoDetallado:
      'Autorizar el uso permanente de ficha de fórmulas y Tabla Pitagórica en clase y en evaluaciones; usar hojas cuadriculadas con código de color para unidades, decenas y centenas.',
    fundamentoNormativo: 'Decreto 1421 de 2017 Anexo 2 / Pauta DUA 1 y 3',
  },
  {
    id: 'aj-06',
    titulo: 'Aceleración Horizontal y Creación Literaria / Filosófica Interdisciplinar',
    categoriaNecesidad: 'Desempeño Superior — Talento Excepcional en Artes y Humanidades',
    principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
    asignaturaSugerida: 'Filosofía y Pensamiento Crítico',
    barreraQueMitiga: 'Currículo rígido que limita la producción creativa y el pensamiento crítico divergente.',
    indicadorBaseEjemplo: 'Resume las corrientes filosóficas de la modernidad a partir del libro de texto.',
    indicadorAjustadoSugerido:
      'Produce ensayos críticos, crónicas o piezas hipermediales que contrastan dilemas éticos contemporáneos con escuelas filosóficas clásicas y modernas.',
    ajusteProcesoDetallado:
      'Habilitar electivas de profundización humanística, liderazgo en el periódico o emisora escolar y evaluación por portafolio de creación original.',
    fundamentoNormativo: 'Lineamientos MEN Capacidades y Talentos Excepcionales (2015/2017)',
  },
  {
    id: 'aj-07',
    titulo: 'Doble Excepcionalidad: Exención de Copia Manual + Reto de Complejidad Alta',
    categoriaNecesidad: 'Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)',
    principioDua: 'Principio III: Múltiples formas de Acción y Expresión',
    asignaturaSugerida: 'Tecnología e Informática',
    barreraQueMitiga: 'Penalización del talento intelectual por disgrafía, dispraxia o rigidez comunicativa.',
    indicadorBaseEjemplo: 'Presenta cuaderno manuscrito al día y desarrolla talleres básicos de informática.',
    indicadorAjustadoSugerido:
      'Documenta sus proyectos en repositorio digital / portafolio electrónico y resuelve retos de automatización y diseño lógico de nivel superior.',
    ajusteProcesoDetallado:
      'Sustituir toma de apuntes manuscrita por mapas digitales o fotografías del tablero; evaluar la profundidad analítica y la solución de problemas complejos sin penalizar caligrafía.',
    fundamentoNormativo: 'Orientaciones MEN Doble Excepcionalidad + Decreto 1421 de 2017',
  },
  {
    id: 'aj-08',
    titulo: 'Lectura Fácil, Pictogramas ARASAAC y Concreción de Conceptos Clave',
    categoriaNecesidad: 'Discapacidad Intelectual / Cognitiva',
    principioDua: 'Principio II: Múltiples formas de Representación',
    asignaturaSugerida: 'Ciencias Naturales y Educación Ambiental',
    barreraQueMitiga: 'Nivel de abstracción teórica desajustado frente al repertorio funcional del estudiante.',
    indicadorBaseEjemplo: 'Explica la estructura bioquímica celular y la síntesis de proteínas.',
    indicadorAjustadoSugerido:
      'Reconoce las partes principales de los seres vivos y hábitos de cuidado de la salud mediante maquetas, láminas ilustradas y experiencias prácticas.',
    ajusteProcesoDetallado:
      'Adaptar guías a formato de Lectura Fácil (frases cortas Sujeto-Verbo-Predicado, apoyo de imagen por concepto); priorizar aprendizajes funcionales para la vida diaria y ciudadanía.',
    fundamentoNormativo: 'Decreto 1421 de 2017 Art. 2.3.3.5.2.3.5 (PIAR y Currículo Flexible)',
  },
  {
    id: 'aj-09',
    titulo: 'Macrotipos, Alto Contraste y Descripción Verbal de Gráficos / Pizarrón',
    categoriaNecesidad: 'Discapacidad Sensorial Visual',
    principioDua: 'Principio II: Múltiples formas de Representación',
    asignaturaSugerida: 'Inglés (Lengua Extranjera)',
    barreraQueMitiga: 'Material visual impreso sin contraste ni verbalización de lo escrito en el tablero.',
    indicadorBaseEjemplo: 'Completa ejercicios de vocabulario e interpretación de láminas en el workbook.',
    indicadorAjustadoSugerido:
      'Comprende y produce vocabulario y diálogos en inglés mediante recursos auditivos, material en macrotipo (18-20pt) alto contraste o lector de pantalla.',
    ajusteProcesoDetallado:
      'Verbalizar siempre lo que se escribe en el tablero; entregar guías digitales accesibles para lector de pantalla o impresas en fuente Arial 18pt sobre fondo mate sin reflejos.',
    fundamentoNormativo: 'Decreto 1421 de 2017 + Lineamientos INCI Colombia',
  },
  {
    id: 'aj-10',
    titulo: 'Subtitulado, Apoyo Visual Gestual y Ubicación Frontal para Lectura Labiofacial',
    categoriaNecesidad: 'Discapacidad Sensorial Auditiva',
    principioDua: 'Principio II: Múltiples formas de Representación',
    asignaturaSugerida: 'Ciencias Sociales, Historia y Geografía',
    barreraQueMitiga: 'Explicaciones exclusivamente orales de espaldas al grupo o videos sin subtítulos.',
    indicadorBaseEjemplo: 'Participa en debates orales sobre organización política y derechos ciudadanos.',
    indicadorAjustadoSugerido:
      'Participa en debates ciudadanos utilizando apoyos visuales escritos, LSC (Lengua de Señas Colombiana) o tableros colaborativos en tiempo real.',
    ajusteProcesoDetallado:
      'Hablar siempre de frente al estudiante sin cubrirse la boca; activar subtítulos en todo material audiovisual; entregar vocabulario nuevo por escrito antes de iniciar el tema.',
    fundamentoNormativo: 'Decreto 1421 de 2017 + Lineamientos INSOR Colombia',
  },
];

export const INITIAL_STUDENTS_PIAR: StudentPIAR[] = [
  {
    id: 'piar-2026-001',
    codigoSimat: 'SIMAT-2026-84920',
    nombresApellidos: 'Mateo Alejandro Cárdenas Gómez',
    documentoIdentidad: 'TI 1.098.452.110',
    edad: 12,
    curso: '7°B Bachillerato',
    anioLectivo: '2026',
    categoriaSimat: 'TEA (Trastorno del Espectro Autista)',
    esDesempenoSuperior: false,
    diagnostico:
      'Trastorno del Espectro Autista (TEA Nivel 1 - CIE-11 6A02.0). Sin deterioro intelectual acompañante; requiere apoyos en reciprocidad socioemocional, anticipación de cambios de rutina y regulación ante hipersensibilidad auditiva en espacios escolares masivos.',
    diagnosticoCifrado:
      'ENC:AES256GCM:cGlhci0yMDI2LTAw:VHJhc3Rvcm5vIGRlbCBFc3BlY3RybyBBdXRpc3RhIChURUEgTml2ZWwgMSAtIENJRS0xMSA2QTAyLjAp...',
    descripcion:
      'Mateo se destaca por su sobresaliente memoria visual, honestidad, interés profundo por la astronomía y la cartografía, y excelente capacidad para identificar patrones lógicos. Aprende con gran eficacia mediante diagramas de flujo, mapas conceptuales y secuencias numeradas.',
    barrerasContexto:
      'Ruido ambiental elevado en cambios de clase; instrucciones grupales con doble sentido o ironía; trabajos en grupo sin asignación explícita de roles individuales.',
    recomendacionesFamilia:
      'Continuar con el calendario visual anticipatorio en casa y fortalecer la autonomía en la organización de su maleta escolar por código de colores.',
    plantillaBaseId: 'tpl-1421-neuro',
    adecuaciones: [
      {
        id: 'ad-101',
        asignatura: 'Matemáticas',
        indicador:
          'Resuelve y formula problemas que involucran números racionales (fracciones y decimales) en diversos contextos.',
        indicadorAjustado:
          'Resuelve problemas con números racionales estructurados en pasos secuenciales explícitos y representaciones gráficas de fracción.',
        ajusteProceso:
          'Entregar talleres con máximo 4 ejercicios por página; incluir ejemplo resuelto paso a paso al inicio de la guía; permitir el uso de audífonos atenuadores de ruido durante pruebas individuales.',
        nombreDocente: 'Lic. Carlos Andrés Restrepo',
        principioDua: 'Principio II: Múltiples formas de Representación',
        barreraIdentificada: 'Sobrecarga sensorial y enunciados extensos con distractores narrativos.',
      },
      {
        id: 'ad-102',
        asignatura: 'Lengua Castellana y Literatura',
        indicador:
          'Interpreta textos literarios reconociendo figuras retóricas, intenciones pragmáticas y posturas críticas en mesas redondas.',
        indicadorAjustado:
          'Analiza textos narrativos e informativos identificando estructura argumental y significado de expresiones figuradas mediante glosario de apoyo.',
        ajusteProceso:
          'Explicitar metáforas y modismos; en actividades grupales, asignarle un rol concreto (ej. Relator gráfico o Documentador de datos) en parejas de confianza; permitir sustentación escrita o infográfica.',
        nombreDocente: 'Esp. Laura Sofía Gaviria',
        principioDua: 'Principio III: Múltiples formas de Acción y Expresión',
        barreraIdentificada: 'Exigencia de debate oral improvisado en grupo grande.',
      },
      {
        id: 'ad-103',
        asignatura: 'Ciencias Naturales y Educación Ambiental',
        indicador:
          'Explica el funcionamiento de los sistemas periódicos y las transformaciones fisicoquímicas de la materia.',
        indicadorAjustado:
          'Explica y modela las propiedades de la tabla periódica conectándolas con la composición química de cuerpos celestes (interés en astronomía).',
        ajusteProceso:
          'Conectar los ejemplos de clase con su centro de interés (astronomía y astrofísica); anticipar las prácticas de laboratorio 24 horas antes con protocolo visual de seguridad.',
        nombreDocente: 'Mg. Diana Marcela Quintero',
        principioDua: 'Principio I: Múltiples formas de Implicación y Motivación',
        barreraIdentificada: 'Ansiedad ante cambios de espacio al laboratorio sin anticipación.',
      },
    ],
    seguimientos: [
      {
        periodo: 1,
        logros:
          'Alcanzó el 95% de los indicadores ajustados en Matemáticas y Ciencias Naturales. Excelente adaptación al uso de guías segmentadas por pasos.',
        evidencias:
          'Portafolio de guías de números racionales resueltas; infografía digital sobre elementos químicos estelares; acta de reunión con acudientes (Marzo 2026).',
        observaciones:
          'El uso de audífonos atenuadores en evaluaciones redujo notablemente la fatiga sensorial. Se recomienda mantener las parejas estables de trabajo en Lengua Castellana.',
        estado: 'Alcanzado',
        responsable: 'Dra. Valentina Morales Pineda / Lic. Carlos Andrés Restrepo',
        fechaActualizacion: '2026-04-10',
      },
      {
        periodo: 2,
        logros:
          'Participó voluntariamente en la exposición de Ciencias apoyado en presentación visual estructurada. Mejoró la comprensión de textos expositivos.',
        evidencias:
          'Rúbrica de exposición bimodal de Ciencias; registro de observación de aula de Psicorientación.',
        observaciones:
          'Continuar fortaleciendo la autorregulación emocional cuando ocurren modificaciones imprevistas de horario institucional (actos cívicos).',
        estado: 'Alcanzado',
        responsable: 'Esp. Laura Sofía Gaviria',
        fechaActualizacion: '2026-06-18',
      },
      {
        periodo: 3,
        logros:
          'En progreso satisfactorio en la resolución de ecuaciones de primer grado y lectura crítica guiada.',
        evidencias: 'Talleres parciales del tercer periodo y bitácora de acompañamiento docente.',
        observaciones: 'Se incorporó autoevaluación visual al cierre de cada semana con resultados positivos.',
        estado: 'En Proceso',
        responsable: 'Lic. Carlos Andrés Restrepo',
        fechaActualizacion: '2026-09-15',
      },
      {
        periodo: 4,
        logros: 'Pendiente cierre del cuarto periodo lectivo 2026.',
        evidencias: 'Por consolidar en comisión de evaluación final.',
        observaciones: 'Preparar acta de transición pedagógica hacia grado 8° para el año 2027.',
        estado: 'Pendiente',
        responsable: 'Coordinación de Inclusión',
        fechaActualizacion: '2026-09-28',
      },
    ],
    historial: [
      {
        id: 'hist-m-2024',
        anioLectivo: '2024',
        curso: '5°A Primaria',
        resumenDiagnosticoYContexto:
          'Apertura de expediente PIAR en cierre de primaria. Identificación de barreras sensoriales en comedor y patio escolar.',
        logrosConsolidados:
          'Consolidación de operaciones básicas y comprensión lectora literal e inferencial con apoyos gráficos.',
        ajustesMasEfectivos:
          'Agenda visual diaria en pupitre, ubicación en primera fila y anticipación de eventos.',
        recomendacionesPromocion:
          'Articular empalme con docentes de bachillerato (grado 6°) por transición de un solo director de grupo a rotación docente.',
        estadoPromocion: 'Promovido con Continuidad PIAR',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
      {
        id: 'hist-m-2025',
        anioLectivo: '2025',
        curso: '6°A Bachillerato',
        resumenDiagnosticoYContexto:
          'Adaptación exitosa al cambio a bachillerato. Se implementó tutor par y carpeta organizadora por colores de asignatura.',
        logrosConsolidados:
          'Desempeño Alto en Matemáticas, Ciencias e Informática; Básico-Alto en Lengua Castellana y Sociales.',
        ajustesMasEfectivos:
          'Fragmentación de talleres extensos, glosario de lenguaje figurado y evaluación bimodal.',
        recomendacionesPromocion:
          'Mantener la estructura de guías segmentadas en 7° y potenciar su talento en ciencias espaciales.',
        estadoPromocion: 'Promovido con Continuidad PIAR',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
      {
        id: 'hist-m-2026',
        anioLectivo: '2026',
        curso: '7°B Bachillerato',
        resumenDiagnosticoYContexto:
          'Mayor autonomía en el manejo de su agenda académica y participación destacada en el club de astronomía.',
        logrosConsolidados:
          'Periodos I y II aprobados en su totalidad sin pérdida de asignaturas.',
        ajustesMasEfectivos:
          'Aprendizaje vinculado a intereses (astronomía) y listas de chequeo de pasos ejecutivos.',
        recomendacionesPromocion: 'Continuar fortaleciendo trabajo colaborativo en grupos de 3 integrantes.',
        estadoPromocion: 'Año Lectivo en Curso',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
    ],
    firmaProfesional: {
      nombreProfesional: 'Dra. Valentina Morales Pineda',
      cargo: 'Psicóloga Orientadora Escolar — Líder de Inclusión',
      tarjetaProfesional: 'T.P. 148920 COLPSIC',
      institucion: 'Institución Educativa Ekirayá — Resolución MEN 1421',
      firmaDataUrl: '',
      fechaFirma: '2026-09-20',
      hashAuditoria: 'SHA256-9F8A4C12-7E3B1109-4D2C88A1',
    },
    estadoPiar: 'Vigente — Firmado para Auditoría',
    updatedAt: '2026-09-28T08:20:00.000Z',
    lastModifiedBy: 'Dra. Valentina Morales Pineda',
  },
  {
    id: 'piar-2026-002',
    codigoSimat: 'SIMAT-2026-91045',
    nombresApellidos: 'Mariana Sofía Velásquez Ochoa',
    documentoIdentidad: 'TI 1.095.812.340',
    edad: 15,
    curso: '10°A Media Académica',
    anioLectivo: '2026',
    categoriaSimat: 'Desempeño Superior — Talento Excepcional en Ciencias y Tecnología',
    esDesempenoSuperior: true,
    diagnostico:
      'Caracterización de Capacidades y Talentos Excepcionales (Orientaciones Técnicas MEN Doc. 19): Talento Excepcional Específico en Ciencias Exactas, Física y Programación Algorítmica. Razonamiento lógico-matemático superior al percentil 98.',
    diagnosticoCifrado:
      'ENC:AES256GCM:cGlhci0yMDI2LTAw:Q2FyYWN0ZXJpemFjacOzbiBkZSBDYXBhY2lkYWRlcyB5IFRhbGVudG9zIEV4Y2VwY2lvbmFsZXMgKE9yaWVudGFjaW9uZXM=...',
    descripcion:
      'Mariana demuestra dominio anticipado de cálculo diferencial, programación en Python y modelado físico. Posee alta motivación intrínseca hacia la resolución de problemas complejos de sostenibilidad energética y liderazgo en semilleros de robótica.',
    barrerasContexto:
      'Riesgo de desmotivación y desconexión en aula cuando las sesiones se centran en ejercicios mecánicos repetitivos que ya domina; necesidad de retos de investigación real.',
    recomendacionesFamilia:
      'Apoyar su participación en Olimpiadas Nacionales de Física y Matemáticas y mantener espacios de descanso y recreación artística.',
    plantillaBaseId: 'tpl-men-superior',
    adecuaciones: [
      {
        id: 'ad-201',
        asignatura: 'Física',
        indicador:
          'Aplica las leyes de Newton y la conservación de la energía mecánica en sistemas ideales sin fricción.',
        indicadorAjustado:
          'Modela matemáticamente y simula computacionalmente sistemas dinámicos con fricción variable y eficiencia energética en prototipos reales.',
        ajusteProceso:
          'Compactación curricular: tras aprobar el pre-test de la unidad, desarrolla simulación en Python/GeoGebra sobre aerodinámica y asesora como monitora par a su equipo de laboratorio.',
        nombreDocente: 'Lic. Carlos Andrés Restrepo',
        principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
        barreraIdentificada: 'Ritmo estándar de ejercitación algorítmica básica.',
      },
      {
        id: 'ad-202',
        asignatura: 'Matemáticas',
        indicador:
          'Identifica razones trigonométricas e identidades fundamentales en triángulos rectángulos y oblicuángulos.',
        indicadorAjustado:
          'Aplica análisis trigonométrico avanzado y series de Fourier básicas al procesamiento de señales y problemas de Olimpiadas Matemáticas.',
        ajusteProceso:
          'Enriquecimiento vertical y horizontal con banco de problemas de nivel olímpico; evaluación por proyecto aplicado en lugar de quices rutinarios.',
        nombreDocente: 'Lic. Carlos Andrés Restrepo',
        principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
        barreraIdentificada: 'Contenidos ya dominados desde el año lectivo anterior.',
      },
    ],
    seguimientos: [
      {
        periodo: 1,
        logros:
          'Desempeño Superior (5.0) en Física, Matemáticas y Tecnología. Clasificó a la fase regional de las Olimpiadas Colombianas de Ciencias.',
        evidencias:
          'Repositorio de simulación energética en Python; certificado de Olimpiadas; informe de compactación curricular.',
        observaciones:
          'Excelente disposición para apoyar a sus compañeros en los laboratorios sin asumir la carga operativa de los demás.',
        estado: 'Superado (Nivel Superior)',
        responsable: 'Lic. Carlos Andrés Restrepo',
        fechaActualizacion: '2026-04-12',
      },
      {
        periodo: 2,
        logros:
          'Lideró el prototipo institucional de monitoreo solar fotovoltaico escolar con análisis estadístico real.',
        evidencias: 'Artículo escolar arbitrado por el departamento de Ciencias y prototipo funcional.',
        observaciones:
          'Se gestionó convenio de mentoría virtual con semillero universitario de ingeniería.',
        estado: 'Superado (Nivel Superior)',
        responsable: 'Mg. Diana Marcela Quintero',
        fechaActualizacion: '2026-06-20',
      },
      {
        periodo: 3,
        logros: 'Avance del 85% en su proyecto anual de investigación STEM para grado 10°.',
        evidencias: 'Bitácora de investigación científica y ponencia preliminar.',
        observaciones: 'Acompañar manejo del perfeccionismo autoimpuesto desde Psicorientación.',
        estado: 'En Proceso',
        responsable: 'Dra. Valentina Morales Pineda',
        fechaActualizacion: '2026-09-19',
      },
      {
        periodo: 4,
        logros: 'Proyectada ponencia central en la Feria de Ciencia e Innovación Institucional.',
        evidencias: 'En preparación.',
        observaciones: 'Postular a beca de inmersión científica juvenil del Ministerio de Ciencias.',
        estado: 'Pendiente',
        responsable: 'Mg. Esteban Bolaños Rodríguez',
        fechaActualizacion: '2026-09-28',
      },
    ],
    historial: [
      {
        id: 'hist-v-2024',
        anioLectivo: '2024',
        curso: '8°A Bachillerato',
        resumenDiagnosticoYContexto:
          'Identificación formal en SIMAT como estudiante con Talento Excepcional en Ciencias y Tecnología.',
        logrosConsolidados: 'Primer puesto académico institucional y ganadora de feria de robótica.',
        ajustesMasEfectivos: 'Compactación curricular en Matemáticas y proyectos de indagación abierta.',
        recomendacionesPromocion: 'Vincular a semillero de programación y física experimental en 9°.',
        estadoPromocion: 'Promovido con Plan de Talentos Excepcionales',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
      {
        id: 'hist-v-2025',
        anioLectivo: '2025',
        curso: '9°B Bachillerato',
        resumenDiagnosticoYContexto:
          'Consolidación del Plan de Enriquecimiento Curricular y fortalecimiento socioemocional frente a la autoexigencia.',
        logrosConsolidados: 'Promedio anual 4.95/5.0; publicación de guía estudiantil de programación.',
        ajustesMasEfectivos: 'Mentoría por proyectos y exención de talleres mecánicos repetitivos.',
        recomendacionesPromocion: 'Articular plan de profundización en Media Académica (10° y 11°).',
        estadoPromocion: 'Promovido con Plan de Talentos Excepcionales',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
    ],
    firmaProfesional: {
      nombreProfesional: 'Dra. Valentina Morales Pineda',
      cargo: 'Psicóloga Orientadora Escolar — Líder de Inclusión',
      tarjetaProfesional: 'T.P. 148920 COLPSIC',
      institucion: 'Institución Educativa Ekirayá — Resolución MEN 1421',
      firmaDataUrl: '',
      fechaFirma: '2026-09-22',
      hashAuditoria: 'SHA256-3B7E91A0-5C1D48F2-8A0E63D9',
    },
    estadoPiar: 'Vigente — Firmado para Auditoría',
    updatedAt: '2026-09-28T08:15:00.000Z',
    lastModifiedBy: 'Lic. Carlos Andrés Restrepo',
  },
  {
    id: 'piar-2026-003',
    codigoSimat: 'SIMAT-2026-77312',
    nombresApellidos: 'Samuel David Ospina Hernández',
    documentoIdentidad: 'TI 1.104.219.875',
    edad: 9,
    curso: '3°A Primaria',
    anioLectivo: '2026',
    categoriaSimat: 'Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)',
    esDesempenoSuperior: true,
    diagnostico:
      'Perfil de Doble Excepcionalidad: Capacidad Excepcional en razonamiento verbal, creatividad narrativa y pensamiento espacial, coexistente con TDAH de presentación combinada y disgrafía motriz.',
    diagnosticoCifrado:
      'ENC:AES256GCM:cGlhci0yMDI2LTAw:UGVyZmlsIGRlIERvYmxlIEV4Y2VwY2lvbmFsaWRhZDogQ2FwYWNpZGFkIEV4Y2VwY2lvbmFsIGVuIHJhem9uYW1pZW50bw==...',
    descripcion:
      'Samuel posee un vocabulario extraordinario para su edad y construye explicaciones científicas e historias complejas de forma oral, pero experimenta frustración rápida y fatiga en la mano cuando debe transcribir extensamente del tablero.',
    barrerasContexto:
      'Actividades basadas en transcripción mecánica del tablero; descalificación de sus ideas por tachones o caligrafía irregular en el cuaderno.',
    recomendacionesFamilia:
      'Permitir el uso de dictado por voz o teclado en tareas largas en casa y canalizar su energía mediante retos de construcción e invención.',
    plantillaBaseId: 'tpl-doble-excepcionalidad',
    adecuaciones: [
      {
        id: 'ad-301',
        asignatura: 'Lengua Castellana y Literatura',
        indicador:
          'Escribe cuentos cortos respetando la estructura inicio-nudo-desenlace, el renglón y la caligrafía legible.',
        indicadorAjustado:
          'Crea narraciones complejas de ficción y textos expositivos combinando producción digital, dictado o ilustración secuencial con alta riqueza léxica.',
        ajusteProceso:
          'Eximir de copia extensa del tablero (entregar copia impresa de los conceptos base); evaluar la calidad argumental y creativa sin penalizar trazos caligráficos; incluir reto de creación de libro-álbum.',
        nombreDocente: 'Esp. Laura Sofía Gaviria',
        principioDua: 'Principio III: Múltiples formas de Acción y Expresión',
        barreraIdentificada: 'Fatiga grafomotora que bloquea su expresión literaria superior.',
      },
      {
        id: 'ad-302',
        asignatura: 'Matemáticas',
        indicador:
          'Resuelve situaciones de multiplicación y geometría básica en el cuaderno de ejercicios.',
        indicadorAjustado:
          'Resuelve acertijos lógicos de nivel avanzado y construye poliedros tridimensionales aplicando propiedades geométricas.',
        ajusteProceso:
          'Proporcionar hojas con cuadrícula ampliada (1 cm) para alinear cifras; alternar cada 15 minutos de trabajo sentado con retos prácticos o manipulación de bloques geométricos.',
        nombreDocente: 'Lic. Carlos Andrés Restrepo',
        principioDua: 'Enriquecimiento Curricular — Desempeño Superior (MEN)',
        barreraIdentificada: 'Inquietud motora y desalineación espacial de números en cuadrícula pequeña.',
      },
    ],
    seguimientos: [
      {
        periodo: 1,
        logros:
          'Ganó el concurso de cuento oral de primaria y mejoró su disposición hacia el trabajo escrito al reducirse la copia mecánica.',
        evidencias: 'Audiocuento ilustrado "El Reloj de los Planetas" y rúbrica DUA de Lengua Castellana.',
        observaciones:
          'Las pausas activas estructuradas cada 20 minutos han disminuido significativamente la impulsividad en fila y aula.',
        estado: 'Superado (Nivel Superior)',
        responsable: 'Esp. Laura Sofía Gaviria',
        fechaActualizacion: '2026-04-09',
      },
      {
        periodo: 2,
        logros:
          'Alcanzó desempeño Superior en resolución de problemas matemáticos y Alto en trabajo cooperativo.',
        evidencias: 'Maqueta geométrica modular y pruebas con cuadrícula adaptada.',
        observaciones:
          'Seguir acompañando la tolerancia a la frustración cuando sus compañeros no van a su misma velocidad.',
        estado: 'Alcanzado',
        responsable: 'Dra. Valentina Morales Pineda',
        fechaActualizacion: '2026-06-15',
      },
      {
        periodo: 3,
        logros: 'Incorporación de tableta institucional para toma de apuntes mediante mapas mentales.',
        evidencias: 'Portafolio de mapas mentales del periodo III.',
        observaciones: 'Excelente respuesta al ajuste tecnológico (Principio III DUA).',
        estado: 'En Proceso',
        responsable: 'Lic. Carlos Andrés Restrepo',
        fechaActualizacion: '2026-09-21',
      },
      {
        periodo: 4,
        logros: 'Pendiente cierre anual.',
        evidencias: 'En curso.',
        observaciones: 'Mantener perfil de Doble Excepcionalidad en SIMAT para grado 4°.',
        estado: 'Pendiente',
        responsable: 'Coordinación de Inclusión',
        fechaActualizacion: '2026-09-28',
      },
    ],
    historial: [
      {
        id: 'hist-s-2025',
        anioLectivo: '2025',
        curso: '2° Primaria',
        resumenDiagnosticoYContexto:
          'Inicialmente remitido por inquietud motora; en valoración integral de Psicología se identificó alta capacidad verbal y espacial (Doble Excepcionalidad).',
        logrosConsolidados: 'Lectura comprensiva de nivel de 5° primaria; liderazgo en proyectos de ciencia.',
        ajustesMasEfectivos: 'Sustitución de planas caligráficas por retos de creación e investigación.',
        recomendacionesPromocion: 'Garantizar que en 3° Primaria se atienda tanto su talento como su ajuste motor.',
        estadoPromocion: 'Promovido con Continuidad PIAR',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
    ],
    estadoPiar: 'En Construcción Docente',
    updatedAt: '2026-09-28T08:10:00.000Z',
    lastModifiedBy: 'Esp. Laura Sofía Gaviria',
  },
  {
    id: 'piar-2026-004',
    codigoSimat: 'SIMAT-2026-65109',
    nombresApellidos: 'Lucía Fernanda Chocontá Ruiz',
    documentoIdentidad: 'TI 1.099.741.002',
    edad: 11,
    curso: '6°A Bachillerato',
    anioLectivo: '2026',
    categoriaSimat: 'Trastorno Específico del Aprendizaje (Lectoescritura / Dislexia)',
    esDesempenoSuperior: false,
    diagnostico:
      'Trastorno Específico del Aprendizaje con dificultad en la lectura (Dislexia fonológica - DSM-5 315.00). Capacidad intelectual general dentro del promedio alto; excelente comprensión auditiva y razonamiento social.',
    diagnosticoCifrado:
      'ENC:AES256GCM:cGlhci0yMDI2LTAw:VHJhc3Rvcm5vIEVzcGVjw61maWNvIGRlbCBBcHJlbmRpemFqZSBjb24gZGlmaWN1bHRhZCBlbiBsYSBsZWN0dXJh...',
    descripcion:
      'Lucía es una estudiante líder, empática, con gran habilidad artística y expresión oral fluida. Comprende conceptos complejos cuando se explican verbalmente o mediante esquemas visuales, pero requiere mayor tiempo para decodificar textos escritos extensos.',
    barrerasContexto:
      'Pruebas escritas cronometradas con tipografía pequeña; solicitud de lectura en voz alta imprevista frente al grupo sin preparación previa.',
    recomendacionesFamilia:
      'Facilitar el texto de las lecturas literarias con una semana de anticipación y apoyar con audiolibros sincronizados.',
    plantillaBaseId: 'tpl-1421-aprendizaje',
    adecuaciones: [
      {
        id: 'ad-401',
        asignatura: 'Lengua Castellana y Literatura',
        indicador:
          'Lee obras literarias del plan lector y presenta controles de lectura escritos individuales.',
        indicadorAjustado:
          'Analiza las obras del plan lector apoyándose en formato bimodal (audiolibro + texto impreso en Arial 14pt) y sustenta su comprensión de forma oral o gráfica.',
        ajusteProceso:
          'No exponer a lectura en voz alta improvisada; entregar guías con interlineado 1.5 y palabras clave en negrita; evaluar contenido e ideas separadamente de la ortografía literal.',
        nombreDocente: 'Esp. Laura Sofía Gaviria',
        principioDua: 'Principio II: Múltiples formas de Representación',
        barreraIdentificada: 'Decodificación lenta en bloques de texto densos.',
      },
      {
        id: 'ad-402',
        asignatura: 'Inglés (Lengua Extranjera)',
        indicador:
          'Escribe párrafos descriptivos en inglés con ortografía exacta (spelling) y comprende textos cortos.',
        indicadorAjustado:
          'Se comunica oralmente en inglés en situaciones cotidianas y asocia vocabulario escrito con apoyos fonéticos y pictográficos.',
        ajusteProceso:
          'Priorizar el componente comunicativo oral (Listening & Speaking); en evaluaciones escritas, usar bancos de palabras y emparejamiento visual en lugar de dictado puro (spelling).',
        nombreDocente: 'Lic. Natalia Andrea Gómez',
        principioDua: 'Evaluación Diferenciada y Flexibilizada',
        barreraIdentificada: 'Opacidad ortográfica del idioma inglés frente a la dislexia fonológica.',
      },
    ],
    seguimientos: [
      {
        periodo: 1,
        logros:
          'Superó con éxito los objetivos de comprensión lectora y oralidad en Lengua Castellana e Inglés.',
        evidencias: 'Exposición oral ilustrada sobre mitos colombianos; evaluación adaptada de Inglés.',
        observaciones:
          'Su autoconfianza académica aumentó notablemente al eliminarse la lectura improvisada en público.',
        estado: 'Alcanzado',
        responsable: 'Esp. Laura Sofía Gaviria',
        fechaActualizacion: '2026-04-11',
      },
      {
        periodo: 2,
        logros: 'Desempeño Alto en Ciencias Sociales y Educación Artística; Básico-Alto en Lengua Castellana.',
        evidencias: 'Portafolio de mapas mentales y grabaciones de análisis literario.',
        observaciones: 'Extender el ajuste de verificación oral de enunciados al área de Matemáticas.',
        estado: 'Alcanzado',
        responsable: 'Dra. Valentina Morales Pineda',
        fechaActualizacion: '2026-06-19',
      },
      {
        periodo: 3,
        logros: 'Avance constante en el uso autónomo de herramientas de texto-a-voz.',
        evidencias: 'Seguimiento de aula Periodo III.',
        observaciones: 'Se evidencia mayor fluidez en textos cortos con tipografía accesible.',
        estado: 'En Proceso',
        responsable: 'Esp. Laura Sofía Gaviria',
        fechaActualizacion: '2026-09-18',
      },
      {
        periodo: 4,
        logros: 'Pendiente cierre cuarto periodo.',
        evidencias: 'Por registrar.',
        observaciones: 'Continuar con ajustes DUA de representación en grado 7°.',
        estado: 'Pendiente',
        responsable: 'Coordinación de Inclusión',
        fechaActualizacion: '2026-09-28',
      },
    ],
    historial: [
      {
        id: 'hist-l-2025',
        anioLectivo: '2025',
        curso: '5°A Primaria',
        resumenDiagnosticoYContexto:
          'Actualización neuropsicológica de Dislexia fonológica; implementación formal de PIAR Anexo 2.',
        logrosConsolidados: 'Aprobación satisfactoria de todas las áreas de básica primaria.',
        ajustesMasEfectivos: 'Evaluación bimodal oral-visual y adaptación tipográfica Arial 14pt.',
        recomendacionesPromocion: 'Socializar perfil con equipo docente de 6° especialmente en Inglés.',
        estadoPromocion: 'Promovido con Continuidad PIAR',
        profesionalCargo: 'Dra. Valentina Morales Pineda',
      },
    ],
    firmaProfesional: {
      nombreProfesional: 'Dra. Valentina Morales Pineda',
      cargo: 'Psicóloga Orientadora Escolar — Líder de Inclusión',
      tarjetaProfesional: 'T.P. 148920 COLPSIC',
      institucion: 'Institución Educativa Ekirayá — Resolución MEN 1421',
      firmaDataUrl: '',
      fechaFirma: '2026-09-18',
      hashAuditoria: 'SHA256-7C4D19E8-2A6F03B4-9E1C55D2',
    },
    estadoPiar: 'Vigente — Firmado para Auditoría',
    updatedAt: '2026-09-28T08:05:00.000Z',
    lastModifiedBy: 'Dra. Valentina Morales Pineda',
  },
];

export const MARCO_NORMATIVO_COLOMBIA = [
  {
    norma: 'Decreto 1421 de 2017 (Ministerio de Educación Nacional)',
    titulo: 'Reglamentación de la Atención Educativa a la Población con Discapacidad',
    resumenEjecutivo:
      'Define el Diseño Universal del Aprendizaje (DUA) como base para toda la comunidad educativa y establece el Plan Individual de Ajustes Razonables (PIAR) como la herramienta idónea para garantizar la pertinencia del proceso de enseñanza y aprendizaje del estudiante dentro del aula.',
    componentesClave: [
      'Anexo 1: Información general del estudiante (entorno salud, hogar y educativo).',
      'Anexo 2: Caracterización pedagógica, barreras identificadas en el contexto y Ajustes Razonables por área/asignatura y periodo.',
      'Anexo 3: Acta de Acuerdo firmada por directivos, docentes, profesional de apoyo y familia.',
      'Historia Escolar longitudinal: El PIAR hace parte de la historia escolar del estudiante y debe transferirse año tras año y entre instituciones.',
    ],
  },
  {
    norma: 'Diseño Universal para el Aprendizaje (DUA — CAST / MEN)',
    titulo: 'Los 3 Principios Pedagógicos para Eliminar Barreras desde el Diseño Curricular',
    resumenEjecutivo:
      'El DUA propone diseñar el currículo desde el inicio para atender la diversidad del aula (estilos cognitivos, ritmos y capacidades), reduciendo la necesidad de adaptaciones segregadoras posteriores.',
    componentesClave: [
      'Principio I — Múltiples formas de Implicación (El ¿Por qué?): Captar el interés, sostener el esfuerzo, promover la autorregulación y conectar con la realidad del estudiante.',
      'Principio II — Múltiples formas de Representación (El ¿Qué?): Presentar la información por vías visuales, auditivas, kinestésicas, lectura fácil, glosarios y organizadores gráficos.',
      'Principio III — Múltiples formas de Acción y Expresión (El ¿Cómo?): Permitir que el estudiante demuestre lo aprendido mediante texto, oralidad, maquetas, código, arte o medios digitales.',
    ],
  },
  {
    norma: 'Orientaciones Técnicas MEN (Documento No. 19) y SIMAT',
    titulo: 'Estudiantes con Desempeño Superior, Capacidades y Talentos Excepcionales',
    resumenEjecutivo:
      'En Colombia, la educación inclusiva abarca explícitamente el reconocimiento y potenciamiento de los estudiantes con capacidades o talentos excepcionales (globales o específicos) y aquellos con Doble Excepcionalidad.',
    componentesClave: [
      'Capacidad Excepcional Global: Potencial superior en múltiples áreas del desarrollo cognitivo y creativo.',
      'Talento Excepcional Específico: Desempeño muy superior en un campo disciplinar (Ciencias Naturales/Básicas, Tecnología, Artes y Letras, Deporte o Liderazgo Social).',
      'Doble Excepcionalidad: Concurrencia de una capacidad/talento excepcional con una discapacidad o trastorno del neurodesarrollo/aprendizaje.',
      'Estrategias Pedagógicas: Compactación curricular (eliminar repetición de lo ya dominado), Enriquecimiento horizontal/vertical, Mentorías, Proyectos de Investigación y Promoción Anticipada (Decreto 1290 de 2009).',
    ],
  },
  {
    norma: 'Ley Estatutaria 1581 de 2012 y Sentencias Corte Constitucional',
    titulo: 'Habeas Data y Protección Criptográfica de Datos Sensibles de NNA',
    resumenEjecutivo:
      'Los datos relativos a la salud, diagnósticos clínicos neuropsicológicos y condición de discapacidad de Niños, Niñas y Adolescentes (NNA) tienen carácter de Datos Sensibles de especial protección constitucional.',
    componentesClave: [
      'Confidencialidad y Encriptación: El diagnóstico clínico se almacena cifrado (AES-256-GCM) en la base de datos de Google Sheets.',
      'Enfoque Pedagógico y no Estigmatizante: El docente de aula recibe orientaciones pedagógicas funcionales y ajustes razonables sin vulnerar la intimidad clínica del menor.',
      'Trazabilidad de Auditoría: Todo acceso, modificación o firma profesional genera sello de integridad verificable.',
    ],
  },
];
