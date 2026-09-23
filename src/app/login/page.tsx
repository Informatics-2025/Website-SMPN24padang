'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { authenticate, type LoginState } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mohon tunggu...</>
            ) : (
                'Login'
            )}
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState<LoginState | undefined, FormData>(
        authenticate,
        undefined,
    );
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!state) return;

        if (state.success) {
            toast({
                title: 'Login Berhasil',
                description: 'Mengalihkan Anda ke dashboard admin...',
            });
            router.push('/admin/dashboard');
            router.refresh();
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Gagal',
                description: state.message || 'Email atau password yang Anda masukkan salah.',
            });
        }
    }, [state, router, toast]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="flex flex-col items-center space-y-4">
                    <Image
                        src="/logo.png"
                        alt="Logo Sekolah"
                        width={80}
                        height={80}
                        className="mx-auto"
                    />
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>
                        Masukkan email dan password untuk mengakses panel admin.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <SubmitButton />
                    </CardFooter>
                </form>
            </Card>
            <div className="mt-4 w-full max-w-sm">
                <Button asChild className="w-full">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </Button>
            </div>
        </main>
    );
}

function PasswordInput() {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="relative">
            <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
