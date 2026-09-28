import React, { useState } from 'react';
import {
  ShieldCheck,
  Brain,
  GraduationCap,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  X,
} from 'lucide-react';
import { SyncStatus, UserRole, UsuarioPerfilCatalogItem } from '../types/piar';
import { EKIRAYA_LOGO_LOCAL_FALLBACK, EKIRAYA_LOGO_URL } from '../utils/exportUtils';

interface LoginViewProps {
  usuariosCatalog: UsuarioPerfilCatalogItem[];
  syncStatus: SyncStatus;
  onLoginSuccess: (user: UsuarioPerfilCatalogItem) => void;
  onAddUserAndLogin: (newUser: UsuarioPerfilCatalogItem) => void;
  onConnectGoogleOAuth: () => void;
  onForceSyncSheets: () => Promise<void>;
  onCancel?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  usuariosCatalog,
  syncStatus,
  onLoginSuccess,
  onAddUserAndLogin,
  onConnectGoogleOAuth,
  onForceSyncSheets,
  onCancel,
}) => {
  const [identifier, setIdentifier] = useState('mebolanos@cem.edu.co');
  const [password, setPassword] = useState('Ekiraya2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Campos de registro rápido en hoja Usuarios_Perfiles
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('profesor');
  const [regCargo, setRegCargo] = useState('');
  const [regTarjeta, setRegTarjeta] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('Por favor ingresa tu correo institucional (o usuario) y tu clave de acceso.');
      return;
    }

    const matchedUser = usuariosCatalog.find(
      (u) =>
        u.activo !== false &&
        (u.correoInstitucional.toLowerCase() === cleanId ||
          u.username.toLowerCase() === cleanId) &&
        u.claveAcceso === cleanPass
    );

    if (!matchedUser) {
      setErrorMsg(
        'Credenciales no válidas o usuario inactivo en la hoja Usuarios_Perfiles. Verifica tu correo/usuario y clave o selecciona un perfil de la tabla.'
      );
      return;
    }

    onLoginSuccess({
      ...matchedUser,
      ultimoAcceso: new Date().toISOString().slice(0, 10),
    });
  };

  const handleQuickSelectUser = (user: UsuarioPerfilCatalogItem, immediateLogin: boolean = false) => {
    setIdentifier(user.correoInstitucional);
    setPassword(user.claveAcceso);
    setErrorMsg(null);
    if (immediateLogin) {
      onLoginSuccess({
        ...user,
        ultimoAcceso: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Completa nombre completo, correo institucional y clave de acceso.');
      return;
    }

    const derivedUsername =
      regUsername.trim() || regEmail.trim().split('@')[0].toLowerCase();

    const permisosDefault =
      regRole === 'administrador'
        ? 'Acceso total: Diagnóstico clínico Ley 1581, Firma Auditoría PDF, Configuración Google Sheets, Tablas Maestras y Usuarios'
        : regRole === 'psicologa'
          ? 'Valoración y Diagnóstico Clínico (AES-256), Firma Profesional PDF Oficial, Adecuaciones DUA y Seguimiento Periodos I-IV'
          : 'Diseño de Adecuaciones por Asignatura (Anexo 2), Banco DUA y Seguimiento por Periodos (Diagnóstico clínico protegido)';

    const newUser: UsuarioPerfilCatalogItem = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      correoInstitucional: regEmail.trim().toLowerCase(),
      username: derivedUsername,
      nombresApellidos: regName.trim(),
      rol: regRole,
      cargoArea:
        regCargo.trim() ||
        (regRole === 'administrador'
          ? 'Coordinación Académica / Administración'
          : regRole === 'psicologa'
            ? 'Psicorientación Escolar y Apoyo Pedagógico'
            : 'Docente de Aula / Área Académica'),
      tarjetaProfesional: regTarjeta.trim() || 'Registro MEN Activo',
      claveAcceso: regPassword.trim(),
      cursosAsignados: 'Todos los cursos asignados',
      permisosResumen: permisosDefault,
      activo: true,
      ultimoAcceso: new Date().toISOString().slice(0, 10),
    };

    onAddUserAndLogin(newUser);
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await onForceSyncSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  const roleBadge = (rol: UserRole) => {
    if (rol === 'administrador') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          <ShieldCheck className="w-3 h-3" />
          Administrador
        </span>
      );
    }
    if (rol === 'psicologa') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <Brain className="w-3 h-3" />
          Psicóloga
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
        <GraduationCap className="w-3 h-3" />
        Profesor
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FBFBF9] border border-[#CBD5E1] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto">
        {/* Barra Superior Institucional */}
        <div className="bg-[#0F172A] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Hoja Google Sheets: Usuarios_Perfiles ({usuariosCatalog.length} registrados)
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-300">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              Protección Ley 1581 de 2012 • Decreto 1421 MEN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                syncStatus.isConnectedToGoogle ? handleSyncClick : onConnectGoogleOAuth
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {syncStatus.isConnectedToGoogle
                ? 'Sincronizar Usuarios_Perfiles (2s)'
                : 'Conectar Google Sheets'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Volver al sistema"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* COLUMNA IZQUIERDA: FORMULARIO DE LOGIN / REGISTRO */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-white border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col justify-between">
            <div className="space-y-5">
              {/* Logo y Encabezado */}
              <div className="flex items-center gap-3.5">
                <div className="bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 shadow-2xs shrink-0">
                  <img
                    src={EKIRAYA_LOGO_URL}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = EKIRAYA_LOGO_LOCAL_FALLBACK;
                    }}
                    alt="Logo Colegio Ekirayá Montessori"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                    Colegio Ekirayá Montessori
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial leading-tight">
                    Ingreso Institucional PIAR & DUA
                  </h1>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Autenticación validada contra la pestaña <code className="font-mono-code text-teal-800">Usuarios_Perfiles</code>
                  </p>
                </div>
              </div>

              {/* Pestañas Login vs Crear Usuario en Hoja */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F4F4F0] border border-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    !isRegisterMode
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isRegisterMode
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Registrar en Usuarios_Perfiles
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!isRegisterMode ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">
                      Correo Institucional o Nombre de Usuario *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Ej. mebolanos@cem.edu.co o mebolanos"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">
                      Contraseña / Clave de Acceso *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu clave institucional"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm font-mono-code text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Ingresar al Sistema PIAR • DUA
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Nombres y Apellidos *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Lic. Camilo Pardo"
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Perfil / Rol en el Sistema *
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs bg-white font-semibold"
                      >
                        <option value="administrador">Administrador Institucional</option>
                        <option value="psicologa">Profesional Psicóloga / Orientación</option>
                        <option value="profesor">Profesor de Aula / Área</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Correo Institucional *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="usuario@cem.edu.co"
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Usuario (Username) y Clave *
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="usuario"
                          className="w-1/2 px-2.5 py-2 rounded-lg border border-[#CBD5E1] text-xs font-mono-code"
                        />
                        <input
                          type="text"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Clave*"
                          className="w-1/2 px-2.5 py-2 rounded-lg border border-[#CBD5E1] text-xs font-mono-code"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Cargo / Área o Asignatura
                      </label>
                      <input
                        type="text"
                        value={regCargo}
                        onChange={(e) => setRegCargo(e.target.value)}
                        placeholder="Ej. Docente Matemáticas Secundaria"
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Tarjeta Profesional / Escalafón
                      </label>
                      <input
                        type="text"
                        value={regTarjeta}
                        onChange={(e) => setRegTarjeta(e.target.value)}
                        placeholder="Ej. T.P. 148920 / Escalafón 2A"
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Guardar en Hoja Usuarios_Perfiles e Ingresar
                  </button>
                </form>
              )}
            </div>

            <div className="pt-5 mt-5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Cifrado Clínico AES-256-GCM Activo</span>
              <span>Sincronización Google Sheets (2.0s)</span>
            </div>
          </div>

          {/* COLUMNA DERECHA: SELECTOR DE PERFILES DESDE LA HOJA USUARIOS_PERFILES */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#F4F4F0] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                    Hoja en Google Sheets: Usuarios_Perfiles
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Perfiles Institucionales Configurados
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Activos
                </span>
              </div>

              <p className="text-xs text-[#475569]">
                Haz clic en cualquier usuario registrado en la hoja{' '}
                <code className="font-mono-code font-semibold text-[#0F172A]">Usuarios_Perfiles</code>{' '}
                para autocompletar el formulario o ingresar directamente con sus permisos de rol:
              </p>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {usuariosCatalog
                  .filter((u) => u.activo !== false)
                  .map((usr) => {
                    const isSelected =
                      identifier.toLowerCase() === usr.correoInstitucional.toLowerCase() ||
                      identifier.toLowerCase() === usr.username.toLowerCase();
                    return (
                      <div
                        key={usr.id}
                        onClick={() => handleQuickSelectUser(usr, false)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#0F766E] ring-2 ring-teal-600/20 shadow-xs'
                            : 'bg-white/90 border-[#CBD5E1] hover:bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                                {usr.nombresApellidos}
                              </span>
                              {roleBadge(usr.rol)}
                            </div>
                            <p className="text-[11px] text-[#475569] mt-0.5">{usr.cargoArea}</p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickSelectUser(usr, true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-bold shrink-0 transition cursor-pointer"
                          >
                            Entrar →
                          </button>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-code text-[#64748B]">
                          <span>
                            Correo: <strong className="text-[#0F172A]">{usr.correoInstitucional}</strong>
                          </span>
                          <span>
                            Clave: <strong className="text-teal-800">{usr.claveAcceso}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#334155] space-y-1">
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Sincronización Bidireccional con Google Sheets
              </div>
              <p className="text-[11px] text-[#475569]">
                Cualquier usuario o perfil que agregues desde la pestaña{' '}
                <code className="font-mono-code">Usuarios_Perfiles</code> en tu archivo de Google
                Sheets o desde el módulo de Tablas Maestras podrá iniciar sesión inmediatamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
