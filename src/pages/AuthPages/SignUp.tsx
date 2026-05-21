import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear cuenta — AtratoCentinela AI"
        description="Crea tu cuenta en AtratoCentinela AI, sistema de monitoreo ambiental del Chocó Biogeográfico"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
