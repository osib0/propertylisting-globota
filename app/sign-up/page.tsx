'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import toast from "react-hot-toast"

const phoneSchema = z.object({
    phone: z.string()
        .min(10, { message: "Phone number must be 10 digits." })
        .max(15, { message: "Phone number too long." })
        .regex(/^[0-9]+$/, { message: "Only numbers allowed." }),
})

const otpSchema = z.object({
    otp: z.string().min(6, { message: "OTP must be 6 digits." }),
})

const signupSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function Page() {
    const [screen, setScreen] = useState<'phone' | 'otp' | 'sign'>('phone')
    const [timer, setTimer] = useState(30)
    const [canResend, setCanResend] = useState(false)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [sentOtp, setSentOtp] = useState("")

    useEffect(() => {
        if (screen === 'otp' && timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000)
            return () => clearInterval(interval)
        } else if (timer === 0) {
            setCanResend(true)
        }
    }, [screen, timer])

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phone: "" },
    })

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    })

    const signForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { firstName: "", lastName: "", email: "", password: "" },
    })

    const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
        setLoading(true)
        try {
            const res = await fetch("/api/user/mobile_verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: values.phone }),
            })

            const result = await res.json()
            if (result.success) {
                setPhoneNumber(values.phone)
                setSentOtp(result.data?.otp)
                setUserId(result.data?.id)
                setScreen("otp")
                setTimer(30)
                setCanResend(false)
            } else {
                toast.error(result.msg || "Failed to send OTP")
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong while sending OTP.")
        } finally {
            setLoading(false)
        }
    }

    const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
        setLoading(true)
        try {
            const res = await fetch("/api/user/verify_otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, otp: values.otp }),
            })

            const data = await res.json()
            if (data.status && data.vaild_access) {
                if (data.register) {
                    // ✅ existing user → auto-login
                    await signIn("credentials", {
                        redirect: true,
                        phone: phoneNumber,
                        otp: values.otp,
                    })
                } else {
                    // ✅ new user → go to signup form
                    setScreen("sign")
                }
            } else if (data.vaild_access) {
                toast.error("Invalid OTP. Try again.")
            } else {
                toast.error("OTP expired. Please try again.")
                setScreen("phone")
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong verifying OTP.")
        } finally {
            setLoading(false)
        }
    }

    const handleSignSubmit = async (values: z.infer<typeof signupSchema>) => {
        setLoading(true)
        try {
            const res = await fetch("/api/user/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    first_name: values.firstName,
                    last_name: values.lastName,
                    email: values.email,
                    password: values.password,
                }),
            })

            const data = await res.json()
            if (data.status) {
                await signIn("credentials", {
                    redirect: true,
                    phone: phoneNumber,
                    email: values.email,
                })
            } else {
                toast.error(data.msg || "Signup failed. Please try again.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error during signup.")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (!canResend) return
        try {
            const res = await fetch("/api/user/mobile_verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phoneNumber }),
            })
            const result = await res.json()
            if (result.success) {
                setSentOtp(result.data?.otp)
                setTimer(30)
                setCanResend(false)
                toast.success("OTP resent successfully!")
            } else {
                toast.error("Failed to resend OTP.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error resending OTP.")
        }
    }

    return (
        <section className="flex min-h-screen">
            {/* Left Image */}
            <div className="relative hidden w-1/2 lg:block">
                <Image
                    src="/sign.jpg"
                    alt="Signup illustration"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h1 className="text-white text-4xl font-bold">Join Us Today</h1>
                </div>
            </div>

            <div className="flex w-full lg:w-1/2 items-center justify-center bg-white text-center">
                <div className="max-w-sm w-full p-8 space-y-6 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={screen}
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: -90, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="space-y-6"
                        >
                            {/* PHONE SCREEN */}
                            {screen === "phone" && (
                                <>
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Log in or sign up
                                    </h2>
                                    <p className="mt-2 text-gray-500">
                                        Enter your phone number to continue
                                    </p>

                                    <Form {...phoneForm}>
                                        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
                                            <FormField
                                                control={phoneForm.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="tel"
                                                                placeholder="+91 98765 43210"
                                                                inputMode="numeric"
                                                                maxLength={10}
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const numericValue = e.target.value.replace(/[^0-9]/g, "")
                                                                    field.onChange(numericValue)
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={loading} className="w-full">
                                                {loading ? "Sending OTP..." : "Continue"}
                                            </Button>
                                        </form>
                                    </Form>
                                </>
                            )}

                            {/* OTP SCREEN */}
                            {screen === "otp" && (
                                <>
                                    <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
                                    <p className="mt-2 text-gray-500">
                                        Enter the 6-digit code sent to your phone
                                    </p>

                                    <Form {...otpForm}>
                                        <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6 flex flex-col items-center">
                                            <FormField
                                                control={otpForm.control}
                                                name="otp"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <FormLabel>OTP</FormLabel>
                                                        <FormControl>
                                                            <InputOTP maxLength={6} {...field} className="justify-center">
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={0} />
                                                                    <InputOTPSlot index={1} />
                                                                    <InputOTPSlot index={2} />
                                                                </InputOTPGroup>
                                                                <InputOTPSeparator />
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={3} />
                                                                    <InputOTPSlot index={4} />
                                                                    <InputOTPSlot index={5} />
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={loading} className="w-full">
                                                {loading ? "Verifying..." : "Verify"}
                                            </Button>

                                            <div className="text-sm text-gray-600">
                                                {canResend ? (
                                                    <button type="button" onClick={handleResendOtp} className="text-blue-600 hover:underline font-medium">
                                                        Resend OTP
                                                    </button>
                                                ) : (
                                                    <span>
                                                        Resend in{" "}
                                                        <span className="font-medium text-blue-600">
                                                            {timer}s
                                                        </span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Test OTP display (remove later) */}
                                            {sentOtp && (
                                                <p className="text-green-600 text-sm mt-2">
                                                    <strong>Test OTP:</strong> {sentOtp}
                                                </p>
                                            )}
                                        </form>
                                    </Form>
                                </>
                            )}

                            {/* SIGNUP SCREEN */}
                            {screen === "sign" && (
                                <>
                                    <h2 className="text-3xl font-bold text-gray-900">Complete Your Signup</h2>
                                    <p className="mt-2 text-gray-500">Enter your details to continue</p>

                                    <Form {...signForm}>
                                        <form onSubmit={signForm.handleSubmit(handleSignSubmit)} className="space-y-4">
                                            <FormField
                                                control={signForm.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signForm.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="you@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={loading} className="w-full">
                                                {loading ? "Saving..." : "Sign Up"}
                                            </Button>
                                        </form>
                                    </Form>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
