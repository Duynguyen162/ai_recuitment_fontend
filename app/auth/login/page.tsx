import AuthLayout from "../components/AuthLayout";
import LoginForm from "./LoginForm";

type LoginPageProps = {
    searchParams?: Promise<{
        redirect?: string;
    }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const redirectUrl = params?.redirect;

    return (
        <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại">
            <LoginForm redirectUrl={redirectUrl} />
        </AuthLayout>
    );
}
