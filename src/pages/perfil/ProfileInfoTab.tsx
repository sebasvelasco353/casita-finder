import ProfileForm from "../../components/ProfileForm";
import SettingsSection from "../../components/SettingsSection";
import { useAuth } from "../../providers/authFirebase";

function ProfileInfoTab() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <p className="py-10 text-sm text-orange-42">Cargando tu información…</p>
    );
  }

  return (
    <>
      <SettingsSection
        title="Información personal"
        description="Estos datos nos ayudan a ponerte en contacto con quienes publican o buscan casitas."
      >
        <ProfileForm user={user} />
      </SettingsSection>

      <SettingsSection
        title="Correo electrónico"
        description="Este es el correo con el que iniciaste sesión."
      >
        <p className="rounded-lg border border-gray-91 bg-gray-98 px-4 py-2.5 text-sm text-orange-18 sm:max-w-xs">
          {user.email}
        </p>
      </SettingsSection>
    </>
  );
}

export default ProfileInfoTab;
