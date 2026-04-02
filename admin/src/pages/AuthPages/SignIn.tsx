import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="World Fly Tickets Travels SignIn Dashboard"
        description="This is Admin SignIn Dashboard page for World Fly Tickets Travels"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
