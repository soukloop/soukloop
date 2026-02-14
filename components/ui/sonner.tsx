"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      visibleToasts={5}
      closeButton
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-full px-4 py-3 flex items-center gap-3 min-w-[200px] max-w-sm " +
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground " +
            "group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          success: "!bg-emerald-500 !text-white !border-0 !rounded-full",
          error: "!bg-red-500 !text-white !border-0 !rounded-full",
          info: "!bg-blue-500 !text-white !border-0 !rounded-full",
          warning: "!bg-amber-500 !text-white !border-0 !rounded-full",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:bg-white/20 group-[.toast]:border-0",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
