"use client";

import { useState } from "react";
import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { PinInput } from "@/components/base/pin-input/pin-input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { createClient } from "@/utils/supabase/client";
import { authConfig, isSignInMethodEnabled } from "@/config";

type AuthStep = "email" | "otp";

export default function LoginPage() {
    const [step, setStep] = useState<AuthStep>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();

    const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false, // Don't create new users, only allow existing ones
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setStep("otp");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (otp.length !== 6) return;

        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email",
            });

            if (error) {
                setError(error.message);
            } else {
                // Successful login - redirect will be handled by middleware or auth state change
                window.location.href = authConfig.redirectAfterAuth;
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep("email");
        setOtp("");
        setError(null);
        setMessage(null);
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage("A new verification code has been sent to your email!");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (value: string) => {
        setOtp(value);
        // Auto-submit when all 6 digits are entered
        if (value.length === 6) {
            // Small delay to let the UI update
            setTimeout(() => {
                handleVerifyOtp();
            }, 100);
        }
    };

    const isOtpEnabled = isSignInMethodEnabled("otp");
    const isGoogleEnabled = isSignInMethodEnabled("google");

    // Email entry step
    if (step === "email") {
        return (
            <section className="relative min-h-screen overflow-hidden bg-primary px-4 py-12 md:px-8 md:pt-24">
                <div className="relative z-10 mx-auto flex w-full flex-col gap-8 sm:max-w-90">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="relative">
                            <BackgroundPattern pattern="grid" className="absolute top-1/2 left-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block" />
                            <BackgroundPattern pattern="grid" size="md" className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:hidden" />
                            <img src="/logos/Badge Slanted_Blue-01.svg" alt="Logo" className="relative z-10 h-12 max-md:h-10" />
                        </div>
                        <div className="z-10 flex flex-col gap-2 md:gap-3">
                            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">Log in to your account</h1>
                            <p className="self-stretch p-0 text-md text-tertiary">Welcome back! Please enter your email.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="z-10 rounded-lg bg-error-secondary p-4 text-sm text-error-primary">
                            {error}
                        </div>
                    )}

                    {isOtpEnabled && (
                        <Form onSubmit={handleSendOtp} className="z-10 flex flex-col gap-6">
                            <div className="flex flex-col gap-5">
                                <Input
                                    isRequired
                                    hideRequiredIndicator
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    size="md"
                                    value={email}
                                    onChange={(value) => setEmail(value)}
                                    isDisabled={isLoading}
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button type="submit" size="lg" isDisabled={isLoading || !email}>
                                    {isLoading ? "Sending..." : "Continue with email"}
                                </Button>

                                {isGoogleEnabled && (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-secondary" />
                                            <span className="text-sm text-tertiary">or</span>
                                            <div className="h-px flex-1 bg-secondary" />
                                        </div>
                                        <SocialButton social="google" theme="color" onClick={handleGoogleSignIn} disabled={isLoading}>
                                            Sign in with Google
                                        </SocialButton>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </div>
            </section>
        );
    }

    // OTP verification step
    return (
        <section className="min-h-screen overflow-hidden bg-primary px-4 py-12 md:px-8 md:pt-24">
            <div className="mx-auto flex w-full max-w-90 flex-col gap-8">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                        <FeaturedIcon color="gray" theme="modern" size="xl" className="relative z-10">
                            <Mail01 className="size-7" />
                        </FeaturedIcon>
                        <BackgroundPattern pattern="grid" size="lg" className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block" />
                        <BackgroundPattern pattern="grid" size="md" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden" />
                    </div>

                    <div className="z-10 flex flex-col gap-2 md:gap-3">
                        <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">Check your email</h1>
                        <p className="text-md text-tertiary">
                            We sent a verification code to <span className="font-medium">{email}</span>
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="z-10 rounded-lg bg-error-secondary p-4 text-sm text-error-primary">
                        {error}
                    </div>
                )}

                <Form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-6 md:gap-8">
                    <div className="md:hidden">
                        <PinInput size="sm" disabled={isLoading}>
                            <PinInput.Group maxLength={6} value={otp} onChange={handleOtpChange}>
                                <PinInput.Slot index={0} />
                                <PinInput.Slot index={1} />
                                <PinInput.Slot index={2} />
                                <PinInput.Slot index={3} />
                                <PinInput.Slot index={4} />
                                <PinInput.Slot index={5} />
                            </PinInput.Group>
                        </PinInput>
                    </div>
                    <div className="max-md:hidden">
                        <PinInput size="md" disabled={isLoading}>
                            <PinInput.Group maxLength={6} value={otp} onChange={handleOtpChange}>
                                <PinInput.Slot index={0} />
                                <PinInput.Slot index={1} />
                                <PinInput.Slot index={2} />
                                <PinInput.Slot index={3} />
                                <PinInput.Slot index={4} />
                                <PinInput.Slot index={5} />
                            </PinInput.Group>
                        </PinInput>
                    </div>

                    <div className="w-full">
                        <Button type="submit" size="lg" className="w-full" isDisabled={isLoading || otp.length !== 6}>
                            {isLoading ? "Verifying..." : "Verify email"}
                        </Button>
                    </div>
                </Form>

                <div className="flex flex-col items-center gap-8 text-center">
                    <p className="flex gap-1">
                        <span className="text-sm text-tertiary">Didn't receive the email?</span>
                        <Button color="link-color" size="md" onClick={handleResendOtp} isDisabled={isLoading}>
                            Click to resend
                        </Button>
                    </p>
                    <Button color="link-gray" size="md" onClick={handleBackToEmail} className="mx-auto" iconLeading={ArrowLeft} isDisabled={isLoading}>
                        Back to log in
                    </Button>
                </div>
            </div>
        </section>
    );
}
