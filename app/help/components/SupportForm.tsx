"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { CopyButton } from "@/components/ui/copy-button"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { submitSupportRequest } from "../actions"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    subject: z.string().min(5, {
        message: "Subject must be at least 5 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
})

interface SupportFormProps {
    user?: {
        name?: string | null
        email?: string | null
    }
}

export function SupportForm({ user }: SupportFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ticketId, setTicketId] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            subject: "",
            description: "",
        },
    })



    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const result = await submitSupportRequest(values)

            if (result.success) {
                toast.success("Support ticket created successfully!")
                setTicketId(result.ticketId || null)
                if (!user) {
                    form.reset()
                } else {
                    // Reset only subject/description for logged in users
                    form.setValue("subject", "")
                    form.setValue("description", "")
                }
            } else {
                toast.error(result.error || "Failed to submit ticket")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }


    if (ticketId) {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-50">
                    <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-green-900">Request Submitted!</h3>
                <p className="mb-6 text-green-700">
                    We have received your request and will get back to you shortly via email.
                </p>

                <div className="mx-auto mb-6 max-w-sm rounded-lg border border-green-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Support Ticket ID
                    </p>
                    <div className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 border border-gray-100">
                        <code className="text-sm font-mono font-medium text-gray-900 truncate">
                            {ticketId}
                        </code>
                        <CopyButton
                            value={ticketId}
                            className="h-8 w-8 shrink-0 text-gray-500 hover:bg-white hover:text-green-600 hover:shadow-sm"
                            variant="ghost"
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    <Button
                        variant="outline"
                        className="border-green-200 bg-white text-green-700 hover:bg-green-50 hover:text-green-800"
                        onClick={() => {
                            setTicketId(null)
                            form.reset()
                        }}
                    >
                        Submit Another Request
                    </Button>
                </div>
            </div>
        )
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} disabled={!!user?.name} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your email" {...field} disabled={!!user?.email} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="What is this regarding?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Please describe your issue in detail..."
                                    className="min-h-[120px] resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full bg-[#E87A3F] hover:bg-[#d96d34]" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                </Button>
            </form>
        </Form>
    )
}
