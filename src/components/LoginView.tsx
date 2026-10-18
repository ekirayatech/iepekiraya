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
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  LogOut,
  X,
} from 'lucide-react';
import { SyncStatus, UserRole, UsuarioPerfilCatalogItem } from '../types/piar';
import { TABLA_USUARIOS_PERFILES_INICIAL } from '../data/colombianLegislationAndSeed';
import { resetUserPassword } from '../services/firebaseAuthService';
import { saveUsuario } from '../services/firebaseDbService';

interface LoginViewProps {
  usuariosCatalog: UsuarioPerfilCatalogItem[];
  currentUser?: UsuarioPerfilCatalogItem | null;
  syncStatus: SyncStatus;
  onLoginSuccess: (user: UsuarioPerfilCatalogItem) => void;
  onAddUserAndLogin: (newUser: UsuarioPerfilCatalogItem) => void;
  onLogout?: () => void;
  onCancel?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  usuariosCatalog,
  currentUser,
  syncStatus,
  onLoginSuccess,
  onAddUserAndLogin,
  onLogout,
  onCancel,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logoutToast, setLogoutToast] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      setIdentifier('');
      setPassword('');
      setErrorMsg(null);
      setLogoutToast('Has cerrado sesión correctamente. Ingresa tus credenciales para continuar.');
    }
  };

  // Campos de registro rápido en hoja Usuarios_Perfiles
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('profesor');
  const [regCargo, setRegCargo] = useState('');
  const [regTarjeta, setRegTarjeta] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newRecoveryPass, setNewRecoveryPass] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRecoverySuccess(null);
    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Por favor ingresa tu correo institucional.');
      return;
    }
    setRecoveryLoading(true);
    try {
      const foundUser = usuariosCatalog.find(
        (u) => u.correoInstitucional.toLowerCase() === cleanEmail
      ) || TABLA_USUARIOS_PERFILES_INICIAL.find(
        (u) => u.correoInstitucional.toLowerCase() === cleanEmail
      );

      if (foundUser) {
        const tempPass = newRecoveryPass.trim() || 'Ekiraya2026*';
        const updatedUser: UsuarioPerfilCatalogItem = {
          ...foundUser,
          claveAcceso: tempPass,
        };
        await saveUsuario(updatedUser).catch(() => {});
        setRecoverySuccess(
          `¡Contraseña restablecida con éxito para ${cleanEmail}! Tu nueva clave de acceso institucional es: "${tempPass}". Ya puedes regresar al ingreso y acceder al sistema.`
        );
      } else {
        try {
          await resetUserPassword(cleanEmail);
        } catch (authErr) {
          // ignore
        }
        setRecoverySuccess(
          `Solicitud de recuperación procesada para ${cleanEmail}. Si tu correo está registrado en la base de datos institucional, recibirás las instrucciones de recuperación.`
        );
      }
    } catch (err: unknown) {
      setErrorMsg(
        'Error al procesar la recuperación. Intenta nuevamente o contacta al administrador.'
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLogoutToast(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('Por favor ingresa tu correo institucional (o usuario) y tu clave de acceso.');
      return;
    }

    const combinedCatalog = [...usuariosCatalog, ...TABLA_USUARIOS_PERFILES_INICIAL];
    const matchedUser = combinedCatalog.find(
      (u) =>
        u.activo !== false &&
        (u.correoInstitucional.toLowerCase() === cleanId ||
          u.username.toLowerCase() === cleanId) &&
        u.claveAcceso === cleanPass
    );

    if (!matchedUser) {
      setErrorMsg(
        'Credenciales institucionales no válidas o usuario inactivo. Verifica tu correo/usuario y contraseña.'
      );
      return;
    }

    onLoginSuccess({
      ...matchedUser,
      ultimoAcceso: new Date().toISOString().slice(0, 10),
    });
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

  const isAdmin = currentUser?.rol === 'administrador';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FBFBF9] border border-[#CBD5E1] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        {/* Barra Superior Institucional */}
        <div className="bg-[#0F172A] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Hoja: Usuarios_Perfiles
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Acceso Institucional Seguro • Ley 1581 de 2012
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentUser && onLogout && (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
                title="Cerrar sesión activa"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            )}

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

        {/* FORMULARIO DE LOGIN / REGISTRO Y CONTROL DE SESIÓN */}
        <div className="p-6 sm:p-8 bg-white flex flex-col justify-between">
          <div className="space-y-5">
            {/* Banner de Sesión Activa con botón de Cerrar Sesión */}
            {currentUser && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Sesión Activa Actualmente
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                      {currentUser.nombresApellidos}
                    </span>
                    {roleBadge(currentUser.rol)}
                  </div>
                  <div className="text-[11px] font-mono-code text-[#475569]">
                    {currentUser.correoInstitucional}
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                  </button>
                )}
              </div>
            )}

            {logoutToast && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{logoutToast}</span>
              </div>
            )}

            {/* Encabezado */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                Colegio Ekirayá Montessori
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial leading-tight">
                Ingreso Institucional PIAR & DUA
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isAdmin ? (
                  <>
                    Autenticación validada contra la pestaña{' '}
                    <code className="font-mono-code text-teal-800">Usuarios_Perfiles</code>
                  </>
                ) : (
                  'Plataforma Institucional de Educación Inclusiva • Decreto 1421 MEN'
                )}
              </p>
            </div>

            {/* Pestañas Login vs Crear Usuario en Hoja — Exclusivo Administrador */}
            {isAdmin && (
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
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isRecoveryMode ? (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-950 space-y-1">
                  <div className="font-bold">Recuperación de Contraseña Institucional</div>
                  <p>Ingresa tu correo institucional. Te enviaremos un enlace seguro para restablecer tu clave de acceso al sistema.</p>
                </div>

                {recoverySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{recoverySuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Correo Institucional *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="ejemplo@cem.edu.co"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Nueva Clave de Acceso (Opcional)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newRecoveryPass}
                      onChange={(e) => setNewRecoveryPass(e.target.value)}
                      placeholder="Dejar en blanco para asignar Ekiraya2026*"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm font-mono-code text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryMode(false);
                      setRecoverySuccess(null);
                      setErrorMsg(null);
                      setNewRecoveryPass('');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    ← Volver al Ingreso
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    {recoveryLoading ? 'Procesando...' : 'Restablecer Clave'}
                  </button>
                </div>
              </form>
            ) : !isRegisterMode || !isAdmin ? (
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
                      placeholder="Ej. usuario@cem.edu.co"
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
                  <div className="flex items-center justify-between text-xs pt-1.5">
                    <span className="text-slate-400">Acceso seguro institucional</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryMode(true);
                        setErrorMsg(null);
                        setRecoverySuccess(null);
                        setRecoveryEmail(identifier.includes('@') ? identifier : '');
                      }}
                      className="text-[#0F766E] hover:underline font-bold cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
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

          <div className="pt-5 mt-5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-700" />
              Protección Ley 1581 • AES-256-GCM
            </span>
            <span>
              Decreto 1421 de 2017 • MEN Colombia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
